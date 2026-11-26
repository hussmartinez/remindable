import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Choices } from '@/components/Choices';
import { BigButton, Dir, Gap, Row, SpeakButton, Txt } from '@/components/ui';
import {
  cellKey,
  checkFill,
  expectedFill,
  makeQuestion,
  makeRound,
  pillConfig,
  sameSet,
  weekOrder,
  type Day,
  type Fill,
  type PillConfig,
  type Round,
  type Slot,
} from '@/engine/pillbox';
import { tIn } from '@/i18n';
import type { Lang } from '@/lib/lang';
import { useAutoSpeak } from '@/lib/speech';
import { colors } from '@/lib/theme';
import { useLevel, useStore } from '@/state/store';
import { cap, Organizer, PillTray, Prescription, wording, type CellLook } from './pillBoxParts';
import type { GameProps } from './types';

type Score = { correct: number; total: number };

/**
 * Pill Box: read a plain prescription, fill a weekly organiser, then answer
 * "It's Wednesday at noon. Which pills?" (ACTIVE everyday-problem style).
 * Rebuild is errorless: a wrong compartment does not take the pill and the
 * right one pulses instead.
 */
export function PillBox(props: GameProps) {
  const level = useLevel('pillBox');
  const profile = useStore((s) => s.settings.profile);
  // Restart if level or profile change before play (the session adapts the level from onDone).
  return <Game key={`${level}-${profile}`} {...props} cfg={pillConfig(level, profile)} />;
}

function Game({ lang, onDone, cfg }: GameProps & { cfg: PillConfig }) {
  const order = useMemo(() => weekOrder(lang), [lang]);
  const [roundNo, setRoundNo] = useState(0);
  const [round, setRound] = useState(() => makeRound(cfg, order));
  const score = useRef<Score>({ correct: 0, total: 0 });

  const add = (correct: number, total: number) => {
    score.current.correct += correct;
    score.current.total += total;
  };

  const nextRound = () => {
    if (roundNo + 1 >= cfg.rounds) return onDone(score.current);
    setRoundNo(roundNo + 1);
    setRound(makeRound(cfg, order));
  };

  return (
    <RoundView
      key={roundNo}
      cfg={cfg}
      round={round}
      lang={lang}
      label={`${roundNo + 1} / ${cfg.rounds}`}
      onScore={add}
      onFinish={nextRound}
    />
  );
}

type Phase = 'study' | 'fill' | 'checked' | 'question';

function RoundView({
  cfg,
  round,
  lang,
  label,
  onScore,
  onFinish,
}: {
  cfg: PillConfig;
  round: Round;
  lang: Lang;
  label: string;
  onScore: (correct: number, total: number) => void;
  onFinish: () => void;
}) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>(cfg.hideCard ? 'study' : 'fill');
  const [qNo, setQNo] = useState(0);
  const questions = useMemo(
    () => Array.from({ length: cfg.questions }, () => makeQuestion(round, cfg.pills >= 3 ? 4 : 3)),
    [round, cfg],
  );

  // The icon sits in its own Text: info symbols count as Latin letters and would force Arabic text LTR.
  const disclaimer = (
    <Row style={{ justifyContent: 'center', gap: 6 }}>
      <Txt variant="small">ℹ️</Txt>
      <Txt variant="small" color={colors.inkSoft} style={{ flexShrink: 1 }}>
        {t('pillBox.disclaimer')}
      </Txt>
    </Row>
  );
  const showCard = !cfg.hideCard || phase === 'study';

  return (
    <>
      <Txt variant="small" center color={colors.inkSoft}>
        {label}
      </Txt>
      {disclaimer}
      <Gap size={8} />
      {showCard && <Prescription round={round} lang={lang} />}
      <Gap size={12} />
      {phase === 'study' && (
        <>
          <Txt center>{t('pillBox.study')}</Txt>
          <Gap size={8} />
          <BigButton label={t('pillBox.ready')} onPress={() => setPhase('fill')} />
        </>
      )}
      {(phase === 'fill' || phase === 'checked') && (
        <FillStage
          cfg={cfg}
          round={round}
          lang={lang}
          onChecked={(correct, total) => {
            onScore(correct, total);
            setPhase('checked');
          }}
          onNext={() => setPhase('question')}
        />
      )}
      {phase === 'question' && (
        <QuestionStage
          key={qNo}
          round={round}
          lang={lang}
          q={questions[qNo]}
          onAnswer={(ok) => {
            onScore(ok ? 1 : 0, 1);
            if (qNo + 1 >= questions.length) onFinish();
            else setQNo(qNo + 1);
          }}
        />
      )}
    </>
  );
}

function FillStage({
  cfg,
  round,
  lang,
  onChecked,
  onNext,
}: {
  cfg: PillConfig;
  round: Round;
  lang: Lang;
  onChecked: (correct: number, total: number) => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const want = useMemo(() => expectedFill(round), [round]);
  const [fill, setFill] = useState<Fill>({});
  const [selected, setSelected] = useState(round.pills[0].id);
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const [pulse, setPulse] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<Record<string, boolean> | null>(null);
  useAutoSpeak(tIn(lang)('pillBox.tapPill'), lang);

  const has = (f: Fill, key: string, id: string) => (f[key] ?? []).includes(id);
  const pillDone = (f: Fill, id: string) => Object.keys(want).every((k) => !want[k].includes(id) || has(f, k, id));
  const done = new Set(round.pills.filter((p) => pillDone(fill, p.id)).map((p) => p.id));
  const allDone = cfg.errorless && done.size === round.pills.length;

  const tap = (day: Day, slot: Slot) => {
    const key = cellKey(day, slot);
    if (result || allDone) return;
    if (!cfg.errorless) {
      const cur = fill[key] ?? [];
      setFill({ ...fill, [key]: cur.includes(selected) ? cur.filter((x) => x !== selected) : [...cur, selected] });
      return;
    }
    if (has(fill, key, selected)) return;
    if (!want[key].includes(selected)) {
      // Errorless: the pill stays out and the right compartments glow.
      setMissed(new Set(missed).add(selected));
      setPulse(new Set(Object.keys(want).filter((k) => want[k].includes(selected) && !has(fill, k, selected))));
      return;
    }
    const next = { ...fill, [key]: [...(fill[key] ?? []), selected] };
    setFill(next);
    setPulse(new Set());
    if (pillDone(next, selected)) {
      const remaining = round.pills.find((p) => !pillDone(next, p.id));
      if (remaining) setSelected(remaining.id);
      else onChecked(round.pills.filter((p) => !missed.has(p.id)).length, round.pills.length);
    }
  };

  const check = () => {
    const r = checkFill(round, fill);
    setResult(r);
    onChecked(Object.values(r).filter(Boolean).length, round.pills.length);
  };

  const look = (key: string): CellLook => {
    if (!result) return 'plain';
    return sameSetOrEmpty(fill[key], want[key]) ? (want[key].length ? 'good' : 'plain') : 'hint';
  };
  const nRight = result ? Object.values(result).filter(Boolean).length : 0;

  return (
    <>
      {!result && !allDone && (
        <>
          <Txt bold center>
            {cfg.hideCard ? t('pillBox.fromMemory') + ' ' : ''}
            {t('pillBox.tapPill')}
          </Txt>
          <Gap size={8} />
          <PillTray round={round} lang={lang} selected={selected} done={cfg.errorless ? done : undefined} onSelect={setSelected} />
          <Gap size={12} />
        </>
      )}
      <Organizer round={round} lang={lang} fill={result ? want : fill} onTap={result || allDone ? undefined : tap} look={look} pulse={pulse} />
      <Gap size={12} />
      {pulse.size > 0 && (
        <Txt center color={colors.hint}>
          {t('pillBox.tryHere')}
        </Txt>
      )}
      {result && (
        <Txt bold center color={nRight === round.pills.length ? colors.good : colors.hint}>
          {nRight === round.pills.length ? t('pillBox.allRight') : t('pillBox.someRight', { n: nRight, total: round.pills.length })}
        </Txt>
      )}
      {allDone && (
        <Txt bold center color={colors.good}>
          {t('pillBox.allSet')}
        </Txt>
      )}
      <Gap size={8} />
      {!cfg.errorless && !result && <BigButton label={t('pillBox.check')} onPress={check} />}
      {(result || allDone) && <BigButton label={t('common.next')} onPress={onNext} />}
    </>
  );
}

const sameSetOrEmpty = (a: string[] | undefined, b: string[]) => sameSet(a ?? [], b);

function QuestionStage({
  round,
  lang,
  q,
  onAnswer,
}: {
  round: Round;
  lang: Lang;
  q: ReturnType<typeof makeQuestion>;
  onAnswer: (ok: boolean) => void;
}) {
  const w = wording(lang);
  const tl = tIn(lang);
  const prompt = w.k('question', { day: w.day(q.day), at: w.at(q.slot, false) });
  useAutoSpeak(prompt, lang);
  const label = (ids: string[]) =>
    ids.length ? cap(w.list(ids.map((id) => w.name(round.pills.find((p) => p.id === id)!)))) : w.k('none');
  const choices = q.options.map((ids, i) => ({ key: String(i), label: label(ids) }));
  const correctKey = String(q.options.findIndex((o) => sameSet(o, q.answer)));
  return (
    <Dir lang={lang}>
      <Row style={{ justifyContent: 'center' }}>
        <Txt bold center style={{ flexShrink: 1 }}>
          {prompt}
        </Txt>
        <SpeakButton text={prompt} lang={lang} />
      </Row>
      <Gap size={8} />
      <Choices
        choices={choices}
        correctKey={correctKey}
        correctText={tl('vault.right')}
        revealText={tl('vault.itWas', { answer: label(q.answer) })}
        onAnswer={onAnswer}
      />
    </Dir>
  );
}
