import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { BigButton, Dir, Emoji, Gap, Row, SpeakButton, Txt, useTextScale } from '@/components/ui';
import type { Concept } from '@/content/concepts';
import { buildItems, explainAnalogy, explainOdd, type AnalogyItem, type OddItem } from '@/engine/oddOneOut';
import { tIn } from '@/i18n';
import { isRTL, type Lang } from '@/lib/lang';
import { useAutoSpeak, useSpeak } from '@/lib/speech';
import { colors, radius, space } from '@/lib/theme';
import { useLevel, useStore } from '@/state/store';
import type { GameProps } from './types';

type Translate = (key: string, opts?: Record<string, string>) => string;
type CardState = 'idle' | 'right' | 'missed' | 'faded';

const tFor = (lang: Lang): Translate => {
  const tl = tIn(lang);
  return (key, opts) => tl(key, opts) as string;
};

/**
 * Odd One Out & Links: semantic categorisation and picture analogies.
 * Rebuild sees 3 cards from clearly different categories, can hear each name,
 * and gets a feature clue before the answer is shown (errorless).
 */
export function OddOneOut({ lang, onDone }: GameProps) {
  const profile = useStore((s) => s.settings.profile);
  const level = useLevel('oddOneOut');
  // Level and profile only change between sessions (and when the dev harness applies its params).
  const items = useMemo(() => buildItems(level, profile), [level, profile]);
  const [index, setIndex] = useState(0);
  const score = useRef({ correct: 0, total: 0 });

  useEffect(() => {
    if (!items.length) onDone({ correct: 0, total: 0 });
  }, [items, onDone]);

  const item = items[index];
  if (!item) return null;

  const next = (correct: boolean) => {
    score.current.total += 1;
    if (correct) score.current.correct += 1;
    if (index + 1 >= items.length) onDone(score.current);
    else setIndex(index + 1);
  };

  return (
    <>
      <Txt variant="small" color={colors.inkSoft}>
        {index + 1} / {items.length}
      </Txt>
      {item.mode === 'odd' ? (
        <OddRound key={index} item={item} lang={lang} rebuild={profile === 'rebuild'} onNext={next} />
      ) : (
        <AnalogyRound key={index} item={item} lang={lang} onNext={next} />
      )}
    </>
  );
}

function OddRound({ item, lang, rebuild, onNext }: { item: OddItem; lang: Lang; rebuild: boolean; onNext: (correct: boolean) => void }) {
  const tl = useMemo(() => tFor(lang), [lang]);
  const [misses, setMisses] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [named, setNamed] = useState<string[]>([]);

  const ask = tl('oddOneOut.ask');
  useAutoSpeak(ask, lang);

  const choose = (c: Concept) => {
    if (done || misses.includes(c.id)) return;
    if (c.id === item.oddId) {
      // Rebuild: solving it after one clue still counts, as Word Garden counts named-with-hints.
      setCorrect(misses.length === 0 || (rebuild && misses.length === 1));
      setDone(true);
      return;
    }
    const nextMisses = [...misses, c.id];
    setMisses(nextMisses);
    if (!rebuild || nextMisses.length >= 2) setDone(true);
  };

  const lastMiss = misses.length ? item.cards.find((c) => c.id === misses[misses.length - 1]) : undefined;
  const clue = !done && lastMiss ? tl('oddOneOut.clue', { word: lastMiss.word[lang], feature: lastMiss.feature[lang], place: lastMiss.place[lang] }) : null;

  const stateOf = (c: Concept): CardState => {
    if (done && c.id === item.oddId) return 'right';
    if (misses.includes(c.id)) return 'missed';
    return done ? 'faded' : 'idle';
  };

  return (
    <Dir lang={lang}>
      <Txt variant="title" center>
        {ask}
      </Txt>
      <Txt variant="small" center color={colors.inkSoft}>
        {tl('oddOneOut.hold')}
      </Txt>
      <Gap size={space.sm} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.sm }}>
        {item.cards.map((c) => (
          <PictureCard
            key={c.id}
            concept={c}
            lang={lang}
            width={item.cards.length === 4 ? '46%' : '30%'}
            state={stateOf(c)}
            showName={done || named.includes(c.id)}
            speakButton={rebuild}
            onPress={() => choose(c)}
            onNamed={() => setNamed((n) => (n.includes(c.id) ? n : [...n, c.id]))}
          />
        ))}
      </View>
      <Gap size={space.sm} />
      {clue && <Feedback text={`${clue} ${tl('oddOneOut.lookAgain')}`} lang={lang} tone="hint" />}
      {done && (
        <>
          <Feedback
            text={`${correct ? `${tl('oddOneOut.right')} ` : ''}${explainOdd(item, lang, tl)}`}
            lang={lang}
            tone={correct ? 'good' : 'hint'}
          />
          <NextButton onPress={() => onNext(correct)} />
        </>
      )}
    </Dir>
  );
}

function AnalogyRound({ item, lang, onNext }: { item: AnalogyItem; lang: Lang; onNext: (correct: boolean) => void }) {
  const tl = useMemo(() => tFor(lang), [lang]);
  const [picked, setPicked] = useState<string | null>(null);
  const [named, setNamed] = useState<string[]>([]);
  const ask = tl('oddOneOut.askAnalogy');
  useAutoSpeak(ask, lang);

  const done = picked !== null;
  const correct = picked === item.answerId;
  const answer = item.options.find((o) => o.id === item.answerId)!;
  const arrow = isRTL(lang) ? '←' : '→';
  const name = (id: string) => setNamed((n) => (n.includes(id) ? n : [...n, id]));

  const pair = (a: Concept, b: Concept | null) => (
    <Row style={{ justifyContent: 'center', marginVertical: space.xs }}>
      <PictureCard concept={a} lang={lang} width={110} state="idle" showName={done || named.includes(a.id)} onNamed={() => name(a.id)} />
      <Txt variant="title" color={colors.inkSoft}>
        {arrow}
      </Txt>
      {b ? (
        <PictureCard concept={b} lang={lang} width={110} state={b.id === answer.id ? 'right' : 'idle'} showName={done || named.includes(b.id)} onNamed={() => name(b.id)} />
      ) : (
        <View style={{ width: 110, minHeight: 110, borderRadius: radius.lg, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
          <Txt variant="huge" color={colors.inkSoft}>
            ?
          </Txt>
        </View>
      )}
    </Row>
  );

  return (
    <Dir lang={lang}>
      <Txt variant="title" center>
        {ask}
      </Txt>
      <Gap size={space.sm} />
      {pair(item.a1, item.b1)}
      {pair(item.a2, done ? answer : null)}
      <Gap size={space.sm} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: space.sm }}>
        {item.options.map((o) => (
          <PictureCard
            key={o.id}
            concept={o}
            lang={lang}
            width="30%"
            state={!done ? 'idle' : o.id === item.answerId ? 'right' : o.id === picked ? 'missed' : 'faded'}
            showName={done || named.includes(o.id)}
            onPress={() => !done && setPicked(o.id)}
            onNamed={() => name(o.id)}
          />
        ))}
      </View>
      <Gap size={space.sm} />
      {done && (
        <>
          <Feedback text={`${correct ? `${tl('oddOneOut.right')} ` : ''}${explainAnalogy(item, lang)}`} lang={lang} tone={correct ? 'good' : 'hint'} />
          <NextButton onPress={() => onNext(correct)} />
        </>
      )}
    </Dir>
  );
}

const cardColors: Record<CardState, { bg: string; border: string; opacity: number }> = {
  idle: { bg: colors.card, border: colors.border, opacity: 1 },
  right: { bg: colors.goodSoft, border: colors.good, opacity: 1 },
  missed: { bg: colors.hintSoft, border: colors.hint, opacity: 1 },
  faded: { bg: colors.card, border: colors.border, opacity: 0.6 },
};

type CardProps = {
  concept: Concept;
  lang: Lang;
  width: number | `${number}%`;
  state: CardState;
  showName: boolean;
  /** Rebuild: a visible 🔊 as well as touch-and-hold, for word-finding support. */
  speakButton?: boolean;
  onPress?: () => void;
  onNamed: () => void;
};

/** A picture card. Touch-and-hold says its name in the content language and shows it. */
function PictureCard({ concept, lang, width, state, showName, speakButton, onPress, onNamed }: CardProps) {
  const speak = useSpeak();
  const scale = useTextScale();
  const look = cardColors[state];
  const word = concept.word[lang];
  const sayName = () => {
    speak(word, lang);
    onNamed();
  };
  return (
    <View style={{ width, alignItems: 'center', opacity: look.opacity }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={showName ? word : concept.emoji}
        onPress={onPress}
        onLongPress={sayName}
        delayLongPress={450}
        style={({ pressed }) => ({
          width: '100%',
          minHeight: 110 * Math.min(scale, 1.3),
          borderRadius: radius.lg,
          borderWidth: state === 'idle' || state === 'faded' ? 2 : 4,
          borderColor: look.border,
          backgroundColor: look.bg,
          alignItems: 'center',
          justifyContent: 'center',
          padding: space.xs,
          opacity: pressed ? 0.8 : 1,
        })}>
        <Emoji size={64}>{concept.emoji}</Emoji>
        {showName && (
          <Txt variant="small" center bold>
            {word}
          </Txt>
        )}
      </Pressable>
      {speakButton && (
        <View style={{ marginTop: space.xs }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`🔊 ${word}`}
            onPress={sayName}
            style={({ pressed }) => ({ minWidth: 64 * scale, minHeight: 64 * scale, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
            <Txt>🔊</Txt>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Feedback({ text, lang, tone }: { text: string; lang: Lang; tone: 'good' | 'hint' }) {
  useAutoSpeak(text, lang);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
        backgroundColor: tone === 'good' ? colors.goodSoft : colors.hintSoft,
        borderRadius: radius.md,
        padding: space.sm,
        marginVertical: space.xs,
      }}>
      <Txt style={{ flexShrink: 1, flexGrow: 1 }} color={colors.ink}>
        {text}
      </Txt>
      <SpeakButton text={text} lang={lang} />
    </View>
  );
}

function NextButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return <BigButton label={t('common.next')} onPress={onPress} />;
}
