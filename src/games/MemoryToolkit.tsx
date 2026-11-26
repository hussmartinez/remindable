import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { BigButton, Dir, Emoji, Gap, NoFlip, Row, Txt } from '@/components/ui';
import { dayKey } from '@/engine/dates';
import { EMPTY_TOOLKIT, TOOL_ICON, nextLesson, recordLesson, type LessonId, type ToolId, type ToolkitData } from '@/engine/toolkit';
import { isRTL, type Lang } from '@/lib/lang';
import { colors, radius, space } from '@/lib/theme';
import { getGameData, useLevel, useStore } from '@/state/store';
import { FadeIn, Picture, Say, Sequence, tFor, type Translate } from './toolkit/parts';
import { TryIt, type TryResult } from './toolkit/TryIt';
import type { GameProps } from './types';

type Phase = 'learn' | 'try' | 'reflect';

/**
 * Memory Toolkit: one strategy a week in three short screens (learn, try, reflect).
 * Predicting before and comparing after is the self-monitoring step that
 * metacognitive training relies on (INCOG 2.0).
 */
export function MemoryToolkit({ lang, onDone }: GameProps) {
  const profile = useStore((s) => s.settings.profile);
  const level = useLevel('toolkit');
  const tl = useMemo(() => tFor(lang), [lang]);
  // Profile only changes between sessions (and when the dev harness applies its params).
  const { lesson, tool } = useMemo(() => nextLesson(getGameData<ToolkitData>('toolkit', EMPTY_TOOLKIT), profile), [profile]);
  const [phase, setPhase] = useState<Phase>('learn');
  const [result, setResult] = useState<TryResult | null>(null);

  const finish = (helped: boolean) => {
    if (!result) return;
    const data = getGameData<ToolkitData>('toolkit', EMPTY_TOOLKIT);
    useStore.getState().setGameData('toolkit', recordLesson(data, { lesson, tool, profile, day: dayKey(), ...result, helped }));
    onDone({ correct: result.correct, total: result.total });
  };

  return (
    <Dir lang={lang}>
      <Row>
        <Emoji size={40}>{TOOL_ICON[lesson]}</Emoji>
        <View style={{ flexShrink: 1 }}>
          <Txt variant="small" color={colors.inkSoft}>
            {tl('toolkit.weekTool')}
          </Txt>
          <Txt variant="title">{tl(`toolkit.name.${lesson}`)}</Txt>
        </View>
      </Row>
      <Steps phase={phase} tl={tl} />
      <Gap size={space.sm} />
      {phase === 'learn' && <Learn key={lesson} lesson={lesson} tool={tool} lang={lang} tl={tl} onDone={() => setPhase('try')} />}
      {phase === 'try' && (
        <TryIt
          tool={tool}
          lang={lang}
          level={level}
          profile={profile}
          onDone={(r) => {
            setResult(r);
            setPhase('reflect');
          }}
        />
      )}
      {phase === 'reflect' && result && <Reflect result={result} lang={lang} tl={tl} onAnswer={finish} />}
    </Dir>
  );
}

/** Learn → Try it → Reflect, in reading order. */
function Steps({ phase, tl }: { phase: Phase; tl: Translate }) {
  const all: Phase[] = ['learn', 'try', 'reflect'];
  const current = all.indexOf(phase);
  return (
    <Row style={{ marginTop: space.sm }}>
      {all.map((p, i) => (
        <View
          key={p}
          style={{
            flex: 1,
            paddingVertical: 6,
            borderRadius: radius.pill,
            alignItems: 'center',
            backgroundColor: i === current ? colors.primary : i < current ? colors.goodSoft : colors.card,
            borderWidth: 1,
            borderColor: i === current ? colors.primary : colors.border,
          }}>
          <Txt variant="small" bold={i === current} color={i === current ? colors.primaryInk : colors.inkSoft}>
            {tl(`toolkit.${p}`)}
          </Txt>
        </View>
      ))}
    </Row>
  );
}

type Step = { visual: ReactNode; text: string } | { quiz: true };

function lessonSteps(lesson: LessonId, tool: ToolId, lang: Lang, tl: Translate): Step[] {
  const rtl = isRTL(lang);
  const s = (key: string) => tl(`toolkit.${lesson}.${key}`);
  const digits = (text: string) => (
    <NoFlip>
      <Picture size={44}>{text}</Picture>
    </NoFlip>
  );
  switch (lesson) {
    case 'chunking':
      return [
        { visual: digits('6 1 8 4 2 9'), text: s('s1') },
        { visual: digits('61   84   29'), text: s('s2') },
        { visual: digits('📞 61 84 29'), text: s('s3') },
      ];
    case 'visualise':
      return [
        { visual: <Picture>🍌</Picture>, text: s('s1') },
        { visual: <BananaOnSofa />, text: s('s2') },
        { visual: <Picture>✨🍌✨</Picture>, text: s('s3') },
      ];
    case 'story':
      return [
        { visual: <Sequence items={['🔑', '🐶', '☂️']} rtl={rtl} arrows={false} />, text: s('s1') },
        { visual: <Sequence items={['🐶🔑', '☂️']} rtl={rtl} />, text: s('s2') },
        { visual: <Sequence items={['🔑', '🐶', '☂️']} rtl={rtl} />, text: s('s3') },
      ];
    case 'palace':
      return [
        { visual: <Picture>🚪 🛋️ 📺 🍽️</Picture>, text: s('s1') },
        { visual: <Picture size={40}>🚪🍞 🛋️🧀 📺🍎 🍽️🥛</Picture>, text: s('s2') },
        { visual: <Picture>🚶 🏠</Picture>, text: s('s3') },
      ];
    case 'writeDown':
      return [
        { visual: <Picture>📝 📋 ⏰ 📅</Picture>, text: s('s1') },
        { visual: <Sequence items={['👂', '📝']} rtl={rtl} />, text: s('s2') },
        { quiz: true },
      ];
    case 'stopThink':
      return [
        { visual: <Picture size={72}>🛑</Picture>, text: s('s1') },
        { visual: <Picture size={72}>🤔</Picture>, text: s('s2') },
        { visual: <Picture size={72}>✅</Picture>, text: s('s3') },
      ];
    case 'mix':
      return [
        { visual: <Picture>🔢 🎨 📖 🏠</Picture>, text: s('s1') },
        {
          visual: <Picture size={72}>{TOOL_ICON[tool]}</Picture>,
          text: tl('toolkit.mix.s2', { tool: tl(`toolkit.name.${tool}`), tip: tl(`toolkit.tip.${tool}`) }),
        },
      ];
  }
}

/** Illustrated example, revealed one step at a time; earlier steps stay on screen. */
function Learn({ lesson, tool, lang, tl, onDone }: { lesson: LessonId; tool: ToolId; lang: Lang; tl: Translate; onDone: () => void }) {
  const { t } = useTranslation();
  const steps = useMemo(() => lessonSteps(lesson, tool, lang, tl), [lesson, tool, lang, tl]);
  const [shown, setShown] = useState(1);
  const [quizDone, setQuizDone] = useState(false);
  const last = shown >= steps.length;
  const waiting = last && 'quiz' in steps[shown - 1] && !quizDone;

  return (
    <>
      {steps.slice(0, shown).map((st, i) => (
        <FadeIn key={i}>
          {'quiz' in st ? (
            <WriteQuiz lang={lang} tl={tl} onDone={() => setQuizDone(true)} />
          ) : (
            <View style={{ opacity: i < shown - 1 ? 0.7 : 1 }}>
              {st.visual}
              <Say text={st.text} lang={lang} auto={i === shown - 1} />
            </View>
          )}
        </FadeIn>
      ))}
      <Gap size={space.sm} />
      {!waiting && (
        <BigButton label={last ? tl('toolkit.try') : t('common.next')} onPress={() => (last ? onDone() : setShown(shown + 1))} />
      )}
    </>
  );
}

function BananaOnSofa() {
  return (
    <View style={{ alignItems: 'center', marginVertical: space.xs }}>
      <View style={{ transform: [{ rotate: '-15deg' }], marginBottom: -36, zIndex: 1 }}>
        <Emoji size={96}>🍌</Emoji>
      </View>
      <Emoji size={72}>🛋️</Emoji>
    </View>
  );
}

/** Rebuild's external-aid practice: "Which one would you write down?" Errorless: the answer is always shown. */
function WriteQuiz({ lang, tl, onDone }: { lang: Lang; tl: Translate; onDone: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const options = [
    { key: 'o1', icon: '👨‍⚕️' },
    { key: 'o2', icon: '☁️' },
    { key: 'o3', icon: '📺' },
  ];
  return (
    <>
      <Say text={tl('toolkit.writeDown.ask')} lang={lang} bold />
      {options.map((o) => (
        <BigButton
          key={o.key}
          icon={o.icon}
          label={tl(`toolkit.writeDown.${o.key}`)}
          tone={picked === null ? 'secondary' : o.key === 'o1' ? 'good' : o.key === picked ? 'hint' : 'secondary'}
          onPress={() => {
            if (picked) return;
            setPicked(o.key);
            onDone();
          }}
        />
      ))}
      {picked && <Say text={tl(picked === 'o1' ? 'toolkit.writeDown.right' : 'toolkit.writeDown.reveal')} lang={lang} />}
    </>
  );
}

function Reflect({ result, lang, tl, onAnswer }: { result: TryResult; lang: Lang; tl: Translate; onAnswer: (helped: boolean) => void }) {
  const { predicted: p, correct: c } = result;
  const comment = c > p ? tl('toolkit.better') : c === p ? tl('toolkit.same') : tl('toolkit.less');
  return (
    <>
      <FadeIn>
        <Row style={{ justifyContent: 'center', gap: space.lg, marginVertical: space.md }}>
          <Bubble label="🤔" value={p} />
          <Bubble label="✅" value={c} />
        </Row>
      </FadeIn>
      <Say text={`${tl('toolkit.reflectLine', { p, c })} ${comment}`} lang={lang} bold />
      <Gap size={space.sm} />
      <Txt bold center>
        {tl('toolkit.helped')}
      </Txt>
      <BigButton icon="👍" label={tl('toolkit.yes')} tone="secondary" onPress={() => onAnswer(true)} />
      <BigButton icon="🤷" label={tl('toolkit.notSure')} tone="secondary" onPress={() => onAnswer(false)} />
    </>
  );
}

function Bubble({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: space.md, minWidth: 96 }}>
      <Emoji size={36}>{label}</Emoji>
      <Txt variant="huge" bold color={colors.primary}>
        {value}
      </Txt>
    </View>
  );
}
