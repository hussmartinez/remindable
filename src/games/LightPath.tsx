import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, View, useWindowDimensions } from 'react-native';

import { BigButton, Card, Gap, NoFlip, SpeakButton, Txt } from '@/components/ui';
import {
  backwardAllowed,
  BOARD,
  BOARD_HEIGHT,
  checkTap,
  expectedOrder,
  makeMosaic,
  makeSequence,
  maxSpan,
  MIN_SPAN,
  MOSAIC_DELAY_MS,
  MOSAIC_SIDE,
  mosaicCellsFor,
  mosaicRange,
  mosaicShowMs,
  mosaicViewFor,
  ROUNDS,
  spanFor,
  TILE,
  timing,
  tipBefore,
  tipFor,
  type MosaicView,
  type TipKey,
} from '@/engine/lightPath';
import { stepStair, type Stair } from '@/engine/patterns';
import { useAutoSpeak } from '@/lib/speech';
import { colors, radius, space } from '@/lib/theme';
import { useLevel, useStore } from '@/state/store';
import type { GameProps } from './types';

/**
 * Light Path: Corsi-style spatial span (sequence mode) and Mosaic pattern copy.
 * Far transfer from span drills is weak, so the game leans on strategy tips
 * (see the path as a shape) and errorless replays instead of failure counts.
 */

type Round =
  | { mode: 'sequence'; seq: number[]; backward: boolean }
  | { mode: 'mosaic'; cells: number[]; view: MosaicView };

const FEEDBACK_MS = 1300;

export function LightPath({ onDone }: GameProps) {
  const { t } = useTranslation();
  const profile = useStore((s) => s.settings.profile);
  const uiLang = useStore((s) => s.settings.uiLang);
  const level = useLevel('lightPath');
  const rebuild = profile === 'rebuild';
  const [phase, setPhase] = useState<'intro' | 'tip' | 'round'>('intro');
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const span = useRef<Stair>({ level: MIN_SPAN, up: 0, down: 0 });
  const cells = useRef<Stair>({ level: 3, up: 0, down: 0 });
  const seqCount = useRef(0);
  const score = useRef({ correct: 0, total: 0 });

  const build = (i: number): Round => {
    if (ROUNDS[i] === 'mosaic') return { mode: 'mosaic', cells: makeMosaic(cells.current.level), view: mosaicViewFor(level, profile) };
    // Keep Sharp L6+ alternates forward and backward recall; backward is one shorter, as in standard span norms.
    const backward = backwardAllowed(level, profile) && seqCount.current % 2 === 1;
    seqCount.current += 1;
    const n = backward ? Math.max(MIN_SPAN, span.current.level - 1) : span.current.level;
    return { mode: 'sequence', seq: makeSequence(n), backward };
  };

  const begin = (i: number) => {
    setIndex(i);
    setRound(build(i));
    setPhase(tipBefore(i) ? 'tip' : 'round');
  };

  const finish = (ok: boolean) => {
    score.current.total += 1;
    if (ok) score.current.correct += 1;
    if (round?.mode === 'mosaic') {
      const [lo, hi] = mosaicRange(profile);
      cells.current = stepStair(cells.current, ok, profile, lo, hi);
    } else {
      span.current = stepStair(span.current, ok, profile, MIN_SPAN, maxSpan(profile));
    }
    if (index + 1 >= ROUNDS.length) onDone(score.current);
    else begin(index + 1);
  };

  const tipKey: TipKey | null = round ? tipFor(index, round.mode, round.mode === 'sequence' && round.backward) : null;
  useAutoSpeak(phase === 'intro' ? t('lightPath.intro') : phase === 'tip' && tipKey ? t(`lightPath.tips.${tipKey}`) : null, uiLang);

  if (phase === 'intro') {
    return (
      <>
        <Card style={{ alignItems: 'center' }}>
          <Txt variant="huge">💡</Txt>
          <Txt center>{t('lightPath.intro')}</Txt>
          <Gap size={8} />
          <SpeakButton text={t('lightPath.intro')} lang={uiLang} />
        </Card>
        <Gap />
        <BigButton
          label={t('lightPath.start')}
          onPress={() => {
            span.current = { level: spanFor(level, profile), up: 0, down: 0 };
            cells.current = { level: mosaicCellsFor(level, profile), up: 0, down: 0 };
            seqCount.current = 0;
            begin(0);
          }}
        />
      </>
    );
  }

  if (phase === 'tip' && tipKey) {
    return (
      <>
        <Card style={{ alignItems: 'center', backgroundColor: colors.accentSoft, borderColor: colors.accent }}>
          <Txt variant="huge">💡</Txt>
          <Txt bold center>
            {t('lightPath.tipTitle')}
          </Txt>
          <Gap size={8} />
          <Txt center>{t(`lightPath.tips.${tipKey}`)}</Txt>
          <Gap size={8} />
          <SpeakButton text={t(`lightPath.tips.${tipKey}`)} lang={uiLang} />
        </Card>
        <Gap />
        <BigButton label={t('common.continue')} onPress={() => setPhase('round')} />
      </>
    );
  }
  if (!round) return null;

  return (
    <>
      <Txt variant="small" center color={colors.inkSoft}>
        {t('lightPath.round', { n: index + 1, total: ROUNDS.length })}
      </Txt>
      <Gap size={8} />
      {round.mode === 'sequence' ? (
        <SequenceRound key={index} seq={round.seq} backward={round.backward} timing={timing(level, profile)} canReplay={rebuild} onFinish={finish} />
      ) : (
        <MosaicRound key={index} cells={round.cells} view={round.view} showMs={mosaicShowMs(level, profile)} canReplay={rebuild} onFinish={finish} />
      )}
    </>
  );
}

// ---------- shared helpers ----------

/** Timeouts that are all cleared on unmount or when a new run starts. */
function useTimers() {
  const ids = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clear = () => {
    ids.current.forEach(clearTimeout);
    ids.current = [];
  };
  useEffect(() => clear, []);
  return { after: (ms: number, fn: () => void) => void ids.current.push(setTimeout(fn, ms)), clear };
}

type AudioCtx = {
  currentTime: number;
  destination: unknown;
  createOscillator(): { type: string; frequency: { value: number }; connect(n: unknown): void; start(t?: number): void; stop(t?: number): void };
  createGain(): { gain: { setValueAtTime(v: number, t: number): void; linearRampToValueAtTime(v: number, t: number): void; exponentialRampToValueAtTime(v: number, t: number): void }; connect(n: unknown): void };
};
let audio: AudioCtx | null = null;
/** C-major pentatonic, so any sequence sounds pleasant. */
const NOTES = [262, 294, 330, 392, 440, 523, 587, 659, 784];

/**
 * Soft tone per tile through the Web Audio API. Web only: there is no audio
 * module in the native build, and the game works fully without sound.
 */
function playTone(i: number) {
  if (Platform.OS !== 'web') return;
  try {
    const AC = (globalThis as unknown as { AudioContext?: new () => AudioCtx }).AudioContext;
    if (!AC) return;
    audio ??= new AC();
    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'sine';
    osc.frequency.value = NOTES[i % NOTES.length];
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  } catch {
    // Sound is optional.
  }
}

/** Fixed-height prompt so the board doesn't jump when the text wraps. */
function PromptBox({ text, good }: { text: string; good: boolean }) {
  const scale = useStore((s) => s.settings.textScale);
  return (
    <View style={{ minHeight: 70 * scale, justifyContent: 'center', marginBottom: space.sm }}>
      <Txt bold center color={good ? colors.good : colors.ink}>
        {text}
      </Txt>
    </View>
  );
}

function useBoardWidth(max: number) {
  const { width } = useWindowDimensions();
  return Math.min(max, Math.min(width, 640) - space.md * 2);
}

// ---------- sequence mode ----------

type TileState = 'idle' | 'lit' | 'hint' | 'done';

function SequenceRound({
  seq,
  backward,
  timing: { onMs, gapMs },
  canReplay,
  onFinish,
}: {
  seq: number[];
  backward: boolean;
  timing: { onMs: number; gapMs: number };
  canReplay: boolean;
  onFinish: (ok: boolean) => void;
}) {
  const { t } = useTranslation();
  const uiLang = useStore((s) => s.settings.uiLang);
  const timers = useTimers();
  const W = useBoardWidth(460);
  const expected = expectedOrder(seq, backward);
  const [stage, setStage] = useState<'watch' | 'input' | 'done'>('watch');
  const [lit, setLit] = useState<number | null>(null);
  const [hint, setHint] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [missed, setMissed] = useState(false);
  const [replaying, setReplaying] = useState(false);

  const schedule = (thenHint: number | null) => {
    const step = onMs + gapMs;
    seq.forEach((tile, k) => {
      timers.after(600 + k * step, () => {
        setLit(tile);
        playTone(tile);
      });
      timers.after(600 + k * step + onMs, () => setLit(null));
    });
    timers.after(600 + seq.length * step, () => {
      setStage('input');
      setHint(thenHint);
    });
  };

  const play = (thenHint: number | null) => {
    timers.clear();
    setStage('watch');
    setHint(null);
    setLit(null);
    schedule(thenHint);
  };

  useEffect(() => {
    schedule(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = (tile: number) => {
    if (stage !== 'input') return;
    const res = checkTap(expected, progress, tile);
    if (res === 'wrong') {
      // Errorless: no mark on the wrong tile; show the path again and light the one that comes next.
      setMissed(true);
      setReplaying(true);
      play(expected[progress]);
      return;
    }
    playTone(tile);
    setHint(null);
    setReplaying(false);
    setProgress(progress + 1);
    if (res === 'done') {
      setStage('done');
      timers.after(FEEDBACK_MS, () => onFinish(!missed));
    }
  };

  const prompt =
    stage === 'watch' || hint !== null
      ? replaying
        ? t('lightPath.replay')
        : t('lightPath.watch')
      : stage === 'done'
        ? missed
          ? t('lightPath.goodHelp')
          : t('lightPath.good')
        : backward
          ? t('lightPath.yourTurnBack')
          : t('lightPath.yourTurn');
  useAutoSpeak(prompt, uiLang);

  const done = new Set(expected.slice(0, progress));
  const stateOf = (i: number): TileState => (lit === i ? 'lit' : hint === i ? 'hint' : done.has(i) && stage !== 'watch' ? 'done' : 'idle');

  return (
    <>
      {backward && stage === 'watch' && !replaying && (
        <Txt bold center color={colors.primary}>
          {t('lightPath.backwardNote')}
        </Txt>
      )}
      <PromptBox text={prompt} good={stage === 'done'} />
      <NoFlip style={{ width: W, height: W * BOARD_HEIGHT, alignSelf: 'center' }}>
        {BOARD.map(([x, y], i) => (
          <LightTile
            key={i}
            label={t('lightPath.tile', { n: i + 1 })}
            state={stateOf(i)}
            disabled={stage !== 'input'}
            onPress={() => tap(i)}
            style={{ left: x * W, top: y * W, width: TILE * W, height: TILE * W }}
          />
        ))}
      </NoFlip>
      <Gap size={12} />
      {canReplay && stage === 'input' && <BigButton tone="secondary" icon="🔁" label={t('lightPath.showAgain')} onPress={() => play(hint)} />}
    </>
  );
}

const TILE_LOOK: Record<TileState, { bg: string; border: string }> = {
  idle: { bg: '#DCEAE7', border: colors.primary },
  lit: { bg: colors.accent, border: colors.accent },
  hint: { bg: colors.accentSoft, border: colors.accent },
  done: { bg: colors.goodSoft, border: colors.good },
};

function LightTile({
  label,
  state,
  disabled,
  onPress,
  style,
}: {
  label: string;
  state: TileState;
  disabled: boolean;
  onPress: () => void;
  style: { left: number; top: number; width: number; height: number };
}) {
  const look = TILE_LOOK[state];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        style,
        {
          position: 'absolute',
          borderRadius: radius.md,
          borderWidth: state === 'hint' ? 6 : 3,
          borderColor: look.border,
          backgroundColor: pressed ? colors.accentSoft : look.bg,
          shadowColor: colors.accent,
          shadowOpacity: state === 'lit' ? 0.8 : 0,
          shadowRadius: 14,
        },
      ]}
    />
  );
}

// ---------- mosaic mode ----------

function MosaicRound({
  cells,
  view,
  showMs,
  canReplay,
  onFinish,
}: {
  cells: number[];
  view: MosaicView;
  showMs: number;
  canReplay: boolean;
  onFinish: (ok: boolean) => void;
}) {
  const { t } = useTranslation();
  const uiLang = useStore((s) => s.settings.uiLang);
  const timers = useTimers();
  const W = useBoardWidth(380);
  const [stage, setStage] = useState<'show' | 'hold' | 'input' | 'done'>(view === 'visible' ? 'input' : 'show');
  const [filled, setFilled] = useState<number[]>([]);
  const [missed, setMissed] = useState(false);
  const [hinted, setHinted] = useState(false);

  const hideLater = () =>
    timers.after(showMs, () => {
      if (view === 'delay') {
        setStage('hold');
        timers.after(MOSAIC_DELAY_MS, () => setStage('input'));
      } else setStage('input');
    });

  const show = () => {
    timers.clear();
    setStage('show');
    hideLater();
  };

  useEffect(() => {
    if (view !== 'visible') hideLater();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = (c: number) => {
    if (stage !== 'input' || filled.includes(c)) return;
    if (!cells.includes(c)) {
      // Errorless: nothing is marked wrong; the remaining picture cells start to glow.
      setMissed(true);
      setHinted(true);
      return;
    }
    const next = [...filled, c];
    setFilled(next);
    if (next.length === cells.length) {
      setStage('done');
      timers.after(FEEDBACK_MS, () => onFinish(!missed));
    }
  };

  const prompt =
    stage === 'show'
      ? t('lightPath.mosaicWatch')
      : stage === 'hold'
        ? t('lightPath.mosaicHold')
        : stage === 'done'
          ? missed
            ? t('lightPath.goodHelp')
            : t('lightPath.good')
          : hinted
            ? t('lightPath.mosaicHint')
            : view === 'visible'
              ? t('lightPath.mosaicCopy')
              : t('lightPath.mosaicRecall');
  useAutoSpeak(prompt, uiLang);

  const gap = 8;
  const cell = Math.min(80, Math.floor((W - gap * (MOSAIC_SIDE - 1)) / MOSAIC_SIDE));

  return (
    <>
      <PromptBox text={prompt} good={stage === 'done'} />
      {view === 'visible' && (
        <>
          <Txt variant="small" center color={colors.inkSoft}>
            {t('lightPath.model')}
          </Txt>
          <Grid cell={Math.round(cell * 0.45)} gap={4} look={(c) => (cells.includes(c) ? 'lit' : 'idle')} />
          <Gap size={12} />
        </>
      )}
      <Grid
        cell={cell}
        gap={gap}
        label={(c) => t('lightPath.cell', { n: c + 1 })}
        disabled={stage !== 'input'}
        onPress={tap}
        look={(c) =>
          stage === 'show' ? (cells.includes(c) ? 'lit' : 'idle') : filled.includes(c) ? 'done' : hinted && cells.includes(c) ? 'hint' : 'idle'
        }
      />
      <Gap size={12} />
      {canReplay && view !== 'visible' && stage === 'input' && (
        <BigButton tone="secondary" icon="🔁" label={t('lightPath.showAgain')} onPress={show} />
      )}
    </>
  );
}

/** A fixed 4×4 grid; physical layout, so it never mirrors in RTL. */
function Grid({
  cell,
  gap,
  look,
  label,
  disabled,
  onPress,
}: {
  cell: number;
  gap: number;
  look: (c: number) => TileState;
  label?: (c: number) => string;
  disabled?: boolean;
  onPress?: (c: number) => void;
}) {
  const side = cell * MOSAIC_SIDE + gap * (MOSAIC_SIDE - 1);
  return (
    <NoFlip style={{ width: side, alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', gap }}>
      {Array.from({ length: MOSAIC_SIDE * MOSAIC_SIDE }, (_, c) => {
        const l = TILE_LOOK[look(c)];
        const box = {
          width: cell,
          height: cell,
          borderRadius: Math.max(6, cell * 0.16),
          borderWidth: look(c) === 'hint' ? 5 : 2,
          borderColor: l.border,
          backgroundColor: l.bg,
        };
        if (!onPress) return <View key={c} style={box} />;
        return (
          <Pressable
            key={c}
            accessibilityRole="button"
            accessibilityLabel={label?.(c)}
            disabled={disabled}
            onPress={() => onPress(c)}
            style={({ pressed }) => [box, pressed && { opacity: 0.8 }]}
          />
        );
      })}
    </NoFlip>
  );
}
