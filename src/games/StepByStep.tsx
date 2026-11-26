import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Platform, Pressable, View, useWindowDimensions } from 'react-native';

import { Choices } from '@/components/Choices';
import { BigButton, Dir, Gap, Row, SpeakButton, Txt, useTextScale } from '@/components/ui';
import { SCRIPTS } from '@/content/scripts';
import {
  correctOrder,
  makeRounds,
  nextOptions,
  scoreOrder,
  stepsConfig,
  type Card,
  type MissingRound,
  type OrderRound,
  type StepsConfig,
} from '@/engine/steps';
import { tIn } from '@/i18n';
import type { Lang } from '@/lib/lang';
import { useAutoSpeak, useSpeak } from '@/lib/speech';
import { colors, radius, space } from '@/lib/theme';
import { getGameData, useLevel, useStore } from '@/state/store';
import type { GameProps } from './types';

type Score = { correct: number; total: number };
const ID = 'stepByStep';
const native = Platform.OS !== 'web';

/**
 * Step by Step: tap shuffled picture cards into numbered slots to put an
 * everyday task in order. Rebuild starts with the first card placed and is
 * errorless: a card that comes later slides back and the right slot glows.
 */
export function StepByStep(props: GameProps) {
  const level = useLevel(ID);
  const profile = useStore((s) => s.settings.profile);
  return <Game key={`${level}-${profile}`} {...props} cfg={stepsConfig(level, profile)} />;
}

function Game({ lang, onDone, cfg }: GameProps & { cfg: StepsConfig }) {
  const [rounds] = useState(() => {
    const { recent } = getGameData<{ recent: string[] }>(ID, { recent: [] });
    return { list: makeRounds(cfg, SCRIPTS, recent), recent };
  });
  // Remember the scripts used so the next session prefers fresh ones.
  useEffect(() => {
    const used = rounds.list.flatMap((r) => (r.kind === 'order' ? r.scripts.map((s) => s.id) : [r.script.id]));
    useStore.getState().setGameData(ID, { recent: [...used, ...rounds.recent].slice(0, 9) });
  }, [rounds]);
  const [n, setN] = useState(0);
  const score = useRef<Score>({ correct: 0, total: 0 });

  const finish = (correct: number, total: number) => {
    score.current.correct += correct;
    score.current.total += total;
    if (n + 1 >= rounds.list.length) onDone(score.current);
    else setN(n + 1);
  };

  const round = rounds.list[n];
  return (
    <Dir lang={lang}>
      <Txt variant="small" center color={colors.inkSoft}>
        {n + 1} / {rounds.list.length}
      </Txt>
      {round.kind === 'missing' ? (
        <MissingView key={n} round={round} lang={lang} onDone={(ok) => finish(ok ? 1 : 0, 1)} />
      ) : (
        <OrderView key={n} round={round} lang={lang} errorless={cfg.errorless} onDone={finish} />
      )}
    </Dir>
  );
}

function useGlow(active: boolean) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 550, useNativeDriver: native }),
        Animated.timing(v, { toValue: 0, duration: 550, useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, v]);
  return v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
}

/** Card width: three per row, two when the text is enlarged. */
function useCardWidth() {
  const { width } = useWindowDimensions();
  const scale = useTextScale();
  const avail = Math.min(width - 40, 640);
  const perRow = scale > 1.15 ? 2 : 3;
  return Math.floor((avail - space.xs * (perRow - 1)) / perRow) - 1;
}

function Header({ round, lang, prompt }: { round: OrderRound | MissingRound; lang: Lang; prompt: string }) {
  const scripts = round.kind === 'order' ? round.scripts : [round.script];
  const titles = scripts.map((s) => `${s.emoji} ${s.title[lang]}`);
  const spoken = `${scripts.map((s) => s.title[lang]).join('. ')}. ${prompt}`;
  useAutoSpeak(spoken, lang);
  return (
    <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <View style={{ flex: 1 }}>
        {titles.map((title) => (
          <Txt key={title} variant="title">
            {title}
          </Txt>
        ))}
        <Txt>{prompt}</Txt>
      </View>
      <SpeakButton text={spoken} lang={lang} />
    </Row>
  );
}

type Look = 'plain' | 'good' | 'hint' | 'fixed';

function StepCard({
  card,
  lang,
  width,
  look = 'plain',
  number,
  onPress,
  shake,
}: {
  card: Card | null;
  lang: Lang;
  width: number;
  look?: Look;
  number?: number;
  onPress?: () => void;
  shake?: Animated.Value;
}) {
  const scale = useTextScale();
  const bg = look === 'good' ? colors.goodSoft : look === 'hint' ? colors.hintSoft : look === 'fixed' ? colors.accentSoft : colors.card;
  const border = look === 'good' ? colors.good : look === 'hint' ? colors.hint : card ? colors.border : colors.inkSoft;
  return (
    <Animated.View style={{ width, transform: shake ? [{ translateX: shake }] : [] }}>
      <Pressable
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={card ? card.text[lang] : String(number ?? '?')}
        disabled={!onPress}
        onPress={onPress}
        style={({ pressed }) => ({
          minHeight: 118 * scale,
          borderRadius: radius.md,
          borderWidth: 2,
          borderStyle: card ? 'solid' : 'dashed',
          borderColor: border,
          backgroundColor: card ? bg : 'transparent',
          padding: space.xs,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.8 : 1,
        })}>
        {number !== undefined && (
          <View style={{ position: 'absolute', top: 4, start: 8 }}>
            <Txt variant="small" bold color={colors.inkSoft}>
              {number}
            </Txt>
          </View>
        )}
        {card ? (
          <>
            <Txt variant="title" center>
              {card.emoji}
            </Txt>
            <Txt variant="small" center>
              {card.text[lang]}
            </Txt>
          </>
        ) : (
          <Txt variant="title" color={colors.border}>
            {number === undefined ? '?' : ''}
          </Txt>
        )}
      </Pressable>
    </Animated.View>
  );
}

function GlowSlot({ width, number }: { width: number; number: number }) {
  const opacity = useGlow(true);
  const scale = useTextScale();
  return (
    <View style={{ width, minHeight: 118 * scale }}>
      <Animated.View
        style={{
          flex: 1,
          borderRadius: radius.md,
          borderWidth: 4,
          borderColor: colors.accent,
          backgroundColor: colors.accentSoft,
          opacity,
        }}
      />
      <View style={{ position: 'absolute', top: 4, start: 8 }}>
        <Txt variant="small" bold color={colors.inkSoft}>
          {number}
        </Txt>
      </View>
    </View>
  );
}

const wrap = { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs } as const;

function OrderView({
  round,
  lang,
  errorless,
  onDone,
}: {
  round: OrderRound;
  lang: Lang;
  errorless: boolean;
  onDone: (correct: number, total: number) => void;
}) {
  const { t } = useTranslation();
  const tl = tIn(lang);
  const speak = useSpeak();
  const width = useCardWidth();
  const [slots, setSlots] = useState<(Card | null)[]>(() =>
    Array.from({ length: round.slots }, (_, i) => (i === 0 ? round.prePlaced : null)),
  );
  const [checked, setChecked] = useState<boolean[] | null>(null);
  const [missedSlots, setMissedSlots] = useState<Set<number>>(new Set());
  const [glowAt, setGlowAt] = useState<number | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [shake] = useState(() => new Animated.Value(0));

  const placedIds = new Set(slots.filter(Boolean).map((c) => c!.id));
  const pool = round.pool.filter((c) => !placedIds.has(c.id));
  const full = slots.every(Boolean);
  const finished = errorless ? full : checked !== null;
  const scored = errorless ? round.slots - (round.prePlaced ? 1 : 0) : round.slots;

  const prompt = [
    tl(round.scripts.length > 1 ? 'stepByStep.both' : 'stepByStep.order'),
    round.pool.some((c) => c.index < 0) ? tl('stepByStep.intruder') : '',
  ]
    .filter(Boolean)
    .join(' ');

  const place = (card: Card) => {
    if (finished) return;
    const at = slots.indexOf(null);
    if (at < 0) return;
    if (errorless) {
      const placed = slots.slice(0, at) as Card[];
      if (!nextOptions(placed, round).some((c) => c.id === card.id)) {
        // Slide the card back and light up the slot that needs filling.
        setMissedSlots(new Set(missedSlots).add(at));
        setGlowAt(at);
        setShakeId(card.id);
        shake.setValue(0);
        Animated.sequence(
          [16, -16, 10, -10, 0].map((x) => Animated.timing(shake, { toValue: x, duration: 70, useNativeDriver: native })),
        ).start();
        return;
      }
      setGlowAt(null);
    }
    speak(card.text[lang], lang);
    const next = [...slots];
    next[at] = card;
    setSlots(next);
  };

  const unplace = (i: number) => {
    if (errorless || finished) return;
    const next = [...slots];
    next[i] = null;
    setSlots(next);
  };

  const check = () => setChecked(scoreOrder(slots as Card[]));
  const nRight = errorless ? scored - missedSlots.size : (checked ?? []).filter(Boolean).length;
  const intruder = round.pool.find((c) => c.index < 0);

  return (
    <>
      <Header round={round} lang={lang} prompt={prompt} />
      <Gap size={12} />
      <View style={wrap}>
        {slots.map((card, i) =>
          glowAt === i && !card ? (
            <GlowSlot key={i} width={width} number={i + 1} />
          ) : (
            <StepCard
              key={i}
              card={card}
              lang={lang}
              width={width}
              number={i + 1}
              look={checked ? (checked[i] ? 'good' : 'hint') : errorless && full ? 'good' : card && card === round.prePlaced ? 'fixed' : 'plain'}
              onPress={card && !errorless && !finished ? () => unplace(i) : undefined}
            />
          ),
        )}
      </View>
      <Gap size={16} />
      {!finished && (
        <>
          <Txt variant="small" center color={colors.inkSoft}>
            {t(errorless ? 'stepByStep.tapNext' : 'stepByStep.tapCards')}
          </Txt>
          <Gap size={8} />
          <View style={wrap}>
            {pool.map((card) => (
              <StepCard
                key={card.id}
                card={card}
                lang={lang}
                width={width}
                shake={card.id === shakeId ? shake : undefined}
                onPress={full ? undefined : () => place(card)}
              />
            ))}
          </View>
          {glowAt !== null && (
            <Txt center color={colors.hint}>
              {t('stepByStep.later')}
            </Txt>
          )}
          <Gap size={8} />
          {!errorless && full && <BigButton label={t('stepByStep.check')} onPress={check} />}
        </>
      )}
      {finished && (
        <>
          <Txt bold center color={errorless || nRight === scored ? colors.good : colors.hint}>
            {errorless || nRight === scored ? t('stepByStep.allRight') : t('stepByStep.someRight', { n: nRight, total: scored })}
          </Txt>
          {checked && nRight < scored && <RightOrder round={round} lang={lang} />}
          {checked && intruder && (
            <Txt center color={colors.inkSoft}>
              {t('stepByStep.notPart')} {intruder.emoji} {intruder.text[lang]}
            </Txt>
          )}
          {errorless && (
            <Txt variant="small" center color={colors.inkSoft}>
              {t('stepByStep.realLife')}
            </Txt>
          )}
          <Gap size={8} />
          <BigButton label={t('common.next')} onPress={() => onDone(nRight, scored)} />
        </>
      )}
    </>
  );
}

function RightOrder({ round, lang }: { round: OrderRound; lang: Lang }) {
  const { t } = useTranslation();
  return (
    <View style={{ backgroundColor: colors.goodSoft, borderRadius: radius.md, padding: space.sm, marginTop: space.sm }}>
      <Txt bold>{t('stepByStep.rightOrder')}</Txt>
      {round.scripts.map((s) => (
        <View key={s.id} style={{ marginTop: space.xs }}>
          {round.scripts.length > 1 && <Txt bold>{`${s.emoji} ${s.title[lang]}`}</Txt>}
          {correctOrder({ ...round, scripts: [s] }).map((c, i) => (
            <Txt key={c.id}>{`${i + 1}. ${c.emoji} ${c.text[lang]}`}</Txt>
          ))}
        </View>
      ))}
    </View>
  );
}

function MissingView({ round, lang, onDone }: { round: MissingRound; lang: Lang; onDone: (ok: boolean) => void }) {
  const tl = tIn(lang);
  const width = useCardWidth();
  return (
    <>
      <Header round={round} lang={lang} prompt={tl('stepByStep.missing')} />
      <Gap size={12} />
      <View style={wrap}>
        {round.shown.map((card, i) => (
          <StepCard key={i} card={card} lang={lang} width={width} number={card ? i + 1 : undefined} look={card ? 'plain' : 'fixed'} />
        ))}
      </View>
      <Gap size={12} />
      <Choices
        choices={round.options.map((o) => ({ key: o.id, label: o.text[lang], icon: o.emoji }))}
        correctKey={round.answer.id}
        correctText={tl('vault.right')}
        revealText={tl('vault.itWas', { answer: `${round.answer.emoji} ${round.answer.text[lang]}` })}
        onAnswer={onDone}
      />
    </>
  );
}
