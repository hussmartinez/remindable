import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';

import { BigButton, Card, Gap, Row, Txt } from '@/components/ui';
import { nextDisplayMs } from '@/engine/adaptive';
import { pick, shuffle } from '@/engine/random';
import { colors, radius } from '@/lib/theme';
import { useStore } from '@/state/store';
import type { GameProps } from './types';

/**
 * Quick Eye: speed-of-processing training modelled on the ACTIVE trial's
 * Useful Field of View task. Identify the central object (car vs truck) and
 * locate a peripheral target; display time adapts trial by trial.
 */

const CENTER = ['🚗', '🚚'];
const TARGET = '⭐';
const DISTRACTOR = '▲';
const POSITIONS = 8;
/** Below this display time, Keep Sharp users also get distractors (harder "selective" level). */
const DISTRACTOR_MS = 350;

type Phase = 'intro' | 'fixation' | 'stimulus' | 'mask' | 'center' | 'where' | 'feedback';
type Trial = { center: string; pos: number; distractors: boolean };

export function QuickEye({ onDone }: GameProps) {
  const { t } = useTranslation();
  const profile = useStore((s) => s.settings.profile);
  const setMs = useStore((s) => s.setQuickEyeMs);
  const totalTrials = profile === 'rebuild' ? 8 : 12;
  const { width } = useWindowDimensions();
  const size = Math.min(width - 48, 440);

  const [phase, setPhase] = useState<Phase>('intro');
  const [n, setN] = useState(0);
  const [ms, setLocalMs] = useState(() => useStore.getState().quickEyeMs);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [success, setSuccess] = useState(false);
  const centerAnswer = useRef<string | null>(null);
  const score = useRef({ correct: 0, total: 0 });

  const startTrial = () => {
    setTrial({
      center: pick(CENTER),
      pos: Math.floor(Math.random() * POSITIONS),
      distractors: profile === 'keepSharp' && ms < DISTRACTOR_MS,
    });
    setPhase('fixation');
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (phase === 'fixation') timer = setTimeout(() => setPhase('stimulus'), 700);
    if (phase === 'stimulus') timer = setTimeout(() => setPhase('mask'), ms);
    if (phase === 'mask') timer = setTimeout(() => setPhase('center'), 400);
    if (phase === 'feedback') {
      timer = setTimeout(() => {
        if (n >= totalTrials) onDone(score.current);
        else startTrial();
      }, 1300);
    }
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const answerWhere = (pos: number) => {
    if (!trial) return;
    const ok = centerAnswer.current === trial.center && pos === trial.pos;
    score.current.total += 1;
    if (ok) score.current.correct += 1;
    const next = nextDisplayMs(ms, ok, profile);
    setLocalMs(next);
    setMs(next);
    setSuccess(ok);
    setN(n + 1);
    setPhase('feedback');
  };

  if (phase === 'intro') {
    return (
      <>
        <Card style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 64 }}>
            {CENTER[0]} {TARGET}
          </Text>
          <Gap size={12} />
          <Txt center>{t('quick.instructions', { target: TARGET })}</Txt>
        </Card>
        <Gap />
        <BigButton label={t('common.continue')} onPress={startTrial} />
      </>
    );
  }

  const show = phase === 'stimulus' ? 'stimulus' : phase === 'mask' ? 'mask' : phase === 'where' ? 'where' : 'blank';

  return (
    <>
      <Row style={{ justifyContent: 'center' }}>
        <Txt variant="small" color={colors.inkSoft}>
          {t('quick.trial', { n: Math.min(n + 1, totalTrials), total: totalTrials })}
        </Txt>
      </Row>
      <Gap size={8} />
      <Arena size={size} trial={trial} show={show} fixation={phase === 'fixation'} onPick={answerWhere} />
      <Gap size={12} />

      {phase === 'fixation' && (
        <Txt center bold>
          {t('quick.ready')}
        </Txt>
      )}

      {phase === 'center' && (
        <>
          <Txt center bold>
            {t('quick.whatCenter')}
          </Txt>
          <Row style={{ justifyContent: 'center' }}>
            {shuffle(CENTER).map((c) => (
              <BigButton
                key={c}
                label={c}
                tone="secondary"
                style={{ minWidth: 110 }}
                onPress={() => {
                  centerAnswer.current = c;
                  setPhase('where');
                }}
              />
            ))}
          </Row>
        </>
      )}

      {phase === 'where' && (
        <Txt center bold>
          {t('quick.whereTarget', { target: TARGET })}
        </Txt>
      )}

      {phase === 'feedback' && (
        <Txt center bold color={success ? colors.good : colors.hint}>
          {success ? t('quick.good') : t('quick.again')}
        </Txt>
      )}
    </>
  );
}

function Arena({
  size,
  trial,
  show,
  fixation,
  onPick,
}: {
  size: number;
  trial: Trial | null;
  show: 'stimulus' | 'mask' | 'where' | 'blank';
  fixation: boolean;
  onPick: (pos: number) => void;
}) {
  const cell = Math.round(size * 0.17);
  const spots = useMemo(
    () =>
      Array.from({ length: POSITIONS }, (_, i) => {
        const a = (i / POSITIONS) * Math.PI * 2 - Math.PI / 2;
        const r = size * 0.38;
        return { left: size / 2 + r * Math.cos(a) - cell / 2, top: size / 2 + r * Math.sin(a) - cell / 2 };
      }),
    [size, cell],
  );
  const center = { left: size / 2 - cell / 2, top: size / 2 - cell / 2 };
  const glyph = { fontSize: cell * 0.7, textAlign: 'center' as const };

  return (
    <View
      style={{
        width: size,
        height: size,
        alignSelf: 'center',
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        borderWidth: 2,
        borderColor: colors.border,
        direction: 'ltr',
      }}>
      <View style={[{ position: 'absolute', width: cell, height: cell, alignItems: 'center', justifyContent: 'center' }, center]}>
        {fixation && <Text style={[glyph, { color: colors.inkSoft }]}>+</Text>}
        {show === 'stimulus' && trial && <Text style={glyph}>{trial.center}</Text>}
        {show === 'mask' && <Text style={[glyph, { color: colors.inkSoft }]}>▩</Text>}
      </View>
      {spots.map((p, i) => {
        const content =
          show === 'stimulus' && trial
            ? i === trial.pos
              ? TARGET
              : trial.distractors
                ? DISTRACTOR
                : ''
            : show === 'mask'
              ? '▩'
              : '';
        const base = { position: 'absolute' as const, width: cell, height: cell, alignItems: 'center' as const, justifyContent: 'center' as const, ...p };
        if (show === 'where') {
          return (
            <Pressable
              key={i}
              accessibilityRole="button"
              onPress={() => onPick(i)}
              style={({ pressed }) => [base, { borderRadius: radius.pill, borderWidth: 3, borderColor: colors.primary, backgroundColor: pressed ? colors.accentSoft : colors.bg }]}
            />
          );
        }
        return (
          <View key={i} style={base}>
            <Text style={[glyph, { color: content === DISTRACTOR || content === '▩' ? colors.inkSoft : undefined }]}>{content}</Text>
          </View>
        );
      })}
    </View>
  );
}
