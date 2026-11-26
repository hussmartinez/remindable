import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton, Card, Emoji, Gap, Row, Screen, Txt } from '@/components/ui';
import { INTENTION_EMOJI } from '@/content/moves';
import type { VaultItem } from '@/content/vault';
import { nextLevel } from '@/engine/adaptive';
import { pick } from '@/engine/random';
import { buildPlan, type GameResult, type StepType } from '@/engine/session';
import { GAMES, type GameId } from '@/games/catalog';
import { MemoryVault } from '@/games/MemoryVault';
import { MoveThink } from '@/games/MoveThink';
import { GAME_COMPONENTS } from '@/games/registry';
import { confirm } from '@/lib/confirm';
import { useAutoSpeak } from '@/lib/speech';
import { colors, radius, space } from '@/lib/theme';
import { useStore } from '@/state/store';

const isGame = (s: StepType): s is GameId => s in GAMES;

function stepInfo(s: StepType): { icon: string; name: string; desc: string } | null {
  if (s === 'vault') return { icon: '📦', name: 'games.vault', desc: 'games.vaultDesc' };
  if (s === 'move') return { icon: '🚶', name: 'games.move', desc: 'games.moveDesc' };
  if (isGame(s)) return { icon: GAMES[s].icon, name: `games.${s}`, desc: `games.${s}Desc` };
  return null;
}

export default function Session() {
  const { t } = useTranslation();
  const { profile, trainLangs } = useStore((s) => s.settings);
  const sessionNumber = useStore((s) => s.sessionDays.length);

  // Frozen for the whole session; finishing it bumps sessionNumber.
  const [plan] = useState(() => buildPlan(profile, sessionNumber, useStore.getState().recentGames));
  const [intentionEmoji, distractorEmoji] = useMemo(() => {
    const a = pick(INTENTION_EMOJI);
    return [a, pick(INTENTION_EMOJI.filter((e) => e !== a))];
  }, []);

  const [stepIndex, setStepIndex] = useState(0);
  const [intentionHit, setIntentionHit] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [todaysItems, setTodaysItems] = useState<VaultItem[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const step = plan.steps[stepIndex];
  // Content language rotates across steps and days so every practice language gets used.
  const lang = trainLangs[(sessionNumber + stepIndex) % trainLangs.length];

  const next = () => setStepIndex((i) => Math.min(i + 1, plan.steps.length - 1));

  const showToast = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const onGameDone = (game: StepType) => (r: GameResult) => {
    const s = useStore.getState();
    // Quick Eye adapts its own display time; Move & Think is unscored.
    const key = game === 'vaultLater' ? 'vault' : game;
    if (key !== 'quickEye' && key !== 'move' && key !== 'vault' && r.total > 0) {
      s.setLevel(key, nextLevel(s.levels[key] ?? 1, r.correct, r.total, profile));
    }
    if (game === 'vaultLater' && r.total > 0) s.setLevel('vault', nextLevel(s.levels.vault ?? 1, r.correct, r.total, profile));
    next();
  };

  const quit = () =>
    confirm(t('session.quitConfirm'), () => router.replace('/home'), t('session.stop'), t('session.keepGoing'));

  const gameSteps = plan.steps.filter((s) => stepInfo(s));
  const progress = Math.min(1, stepIndex / (plan.steps.length - 1));
  const intentionGameName = t(stepInfo(plan.steps[plan.intentionStep])?.name ?? 'games.vault');

  let body: React.ReactNode = null;
  switch (step) {
    case 'intro':
      body = (
        <>
          <Txt variant="title" center>
            {t('session.introTitle')}
          </Txt>
          <Gap />
          {gameSteps.map((s, i) => (
            <Card key={`${s}${i}`} style={{ marginBottom: space.sm }}>
              <Row>
                <Text style={{ fontSize: 36 }}>{stepInfo(s)!.icon}</Text>
                <View style={{ flexShrink: 1 }}>
                  <Txt bold>{t(stepInfo(s)!.name)}</Txt>
                  <Txt variant="small" color={colors.inkSoft}>
                    {t(stepInfo(s)!.desc)}
                  </Txt>
                </View>
              </Row>
            </Card>
          ))}
          <Gap />
          <BigButton label={t('common.continue')} onPress={next} />
        </>
      );
      break;
    case 'plant':
      body = <PlantIntention emoji={intentionEmoji} onNext={next} />;
      break;
    case 'vault':
      body = <MemoryVault key={stepIndex} mode="learn" lang={lang} onLearned={setTodaysItems} onDone={onGameDone('vault')} />;
      break;
    case 'vaultLater':
      body = <MemoryVault key={stepIndex} mode="later" lang={lang} todaysItems={todaysItems} onDone={onGameDone('vaultLater')} />;
      break;
    case 'move':
      body = <MoveThink key={stepIndex} lang={lang} onDone={onGameDone('move')} />;
      break;
    case 'close':
      body = <Close emoji={intentionEmoji} remembered={intentionHit} gameName={intentionGameName} games={plan.games} />;
      break;
    default: {
      const Game = GAME_COMPONENTS[step];
      body = <Game key={stepIndex} lang={lang} onDone={onGameDone(step)} />;
    }
  }

  const floating =
    stepIndex === plan.intentionStep && !intentionHit ? intentionEmoji : stepIndex === plan.distractorStep ? distractorEmoji : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.bg }}>
        <Row style={{ paddingHorizontal: space.md, paddingTop: space.xs }}>
          <View style={{ flex: 1, height: 12, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' }}>
            <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: colors.accent }} />
          </View>
          {/* Development builds only: skip a step without scoring it (for testing). */}
          {__DEV__ && step !== 'close' && <BigButton tone="quiet" label="⏭" onPress={next} style={{ marginVertical: 0 }} />}
          {step !== 'close' && <BigButton tone="quiet" label={t('session.quit')} onPress={quit} style={{ marginVertical: 0 }} />}
        </Row>
      </SafeAreaView>

      <Screen edges={['bottom', 'left', 'right']}>{body}</Screen>

      {floating && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={floating}
          onPress={() => {
            if (floating === intentionEmoji) {
              setIntentionHit(true);
              showToast(t('session.intentionHit'));
            } else {
              showToast(t('session.intentionMiss', { emoji: intentionEmoji }));
            }
          }}
          style={{ position: 'absolute', bottom: 28, end: 20, width: 76, height: 76, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 44 }}>{floating}</Text>
        </Pressable>
      )}

      {toast && (
        <View pointerEvents="none" style={{ position: 'absolute', bottom: 120, start: 20, end: 20, alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.ink, borderRadius: radius.lg, paddingHorizontal: space.md, paddingVertical: space.sm }}>
            <Txt color={colors.primaryInk} bold center>
              {toast}
            </Txt>
          </View>
        </View>
      )}
    </View>
  );
}

function PlantIntention({ emoji, onNext }: { emoji: string; onNext: () => void }) {
  const { t, i18n } = useTranslation();
  const body = t('session.plantBody');
  useAutoSpeak(body, i18n.language as never);
  return (
    <>
      <Txt variant="title" center>
        {t('session.plantTitle')}
      </Txt>
      <Gap />
      <Card style={{ alignItems: 'center' }}>
        <Emoji size={120}>{emoji}</Emoji>
        <Gap size={12} />
        <Txt center>{body}</Txt>
      </Card>
      <Gap />
      <BigButton label={t('session.gotIt')} onPress={onNext} />
    </>
  );
}

function Close({ emoji, remembered, gameName, games }: { emoji: string; remembered: boolean; gameName: string; games: GameId[] }) {
  const { t } = useTranslation();
  const finishSession = useStore((s) => s.finishSession);
  // Count the session as soon as the close screen is reached.
  useEffect(() => finishSession(games), [finishSession, games]);

  return (
    <>
      <Gap />
      <Emoji size={110}>🌻</Emoji>
      <Txt variant="title" center>
        {t('close.title')}
      </Txt>
      <Txt center>{t('close.body')}</Txt>
      <Gap />
      <Card>
        <Txt center color={remembered ? colors.good : colors.inkSoft}>
          {remembered ? t('close.remembered', { emoji }) : t('close.forgot', { emoji, game: gameName })}
        </Txt>
      </Card>
      <Gap />
      <BigButton tone="secondary" icon="💌" label={t('close.share')} onPress={() => Share.share({ message: t('close.shareText') }).catch(() => {})} />
      <BigButton label={t('close.finish')} onPress={() => router.replace('/home')} />
    </>
  );
}
