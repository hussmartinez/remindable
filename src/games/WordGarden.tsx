import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Choices } from '@/components/Choices';
import { BigButton, Card, Dir, Emoji, Gap, Row, SpeakButton, Txt } from '@/components/ui';
import { CATEGORIES, CONCEPTS, type Concept } from '@/content/concepts';
import { EMPTY_WORD_FINDER, preferPractice, removePractice, WORD_FINDER_KEY, type WordFinderData } from '@/engine/practiceList';
import { choicesWith, shuffle } from '@/engine/random';
import { matchSpoken, targetsFor } from '@/engine/wordMatch';
import { tIn } from '@/i18n';
import type { Lang } from '@/lib/lang';
import { useAutoSpeak } from '@/lib/speech';
import { useRecognizer } from '@/lib/speechRecognition';
import { colors, radius, space } from '@/lib/theme';
import { getGameData, useLevel, useStore } from '@/state/store';
import type { GameProps } from './types';

type Round = { concept: Concept; lang: Lang };
type Phase = 'ask' | 'check' | 'choices' | 'sayIt' | 'heard';
type SpeechNote = 'tryHint' | 'noSpeech' | null;

/** Words named with at most this many hints count as a success for difficulty tuning. */
const SUCCESS_MAX_HINTS = 2;

function tiersForLevel(level: number): Concept['tier'][] {
  if (level <= 3) return [1];
  if (level <= 6) return [1, 2];
  return [2, 3];
}

/**
 * Hint ladder: Semantic Feature Analysis cues first (group, feature, place),
 * then phonological cues (first letter, first half), then a cross-language
 * cue when the user practises more than one language.
 */
function buildHints(c: Concept, lang: Lang, otherLang: Lang | null): string[] {
  const tl = tIn(lang);
  const letters = Array.from(c.word[lang]);
  const hints = [
    tl('word.group', { v: CATEGORIES[c.cat][lang] }),
    c.feature[lang],
    tl('word.place', { v: c.place[lang] }),
    tl('word.first', { v: letters[0].toLocaleUpperCase(lang) }),
    tl('word.begins', { v: letters.slice(0, Math.ceil(letters.length / 2)).join('') }),
  ];
  if (otherLang) hints.push(tl('word.other', { lang: tl(`langs.${otherLang}`), v: c.word[otherLang] }));
  return hints;
}

export function WordGarden({ lang, onDone }: GameProps) {
  const { t } = useTranslation();
  const { profile, trainLangs } = useStore((s) => s.settings);
  const level = useLevel('wordGarden');

  const rounds = useMemo<Round[]>(() => {
    const tiers = tiersForLevel(level);
    const pool = CONCEPTS.filter((c) => tiers.includes(c.tier));
    const start = Math.max(0, trainLangs.indexOf(lang));
    // Words rescued in Word Finder come first, whatever their tier: the user needed them in real life.
    const practice = getGameData<WordFinderData>(WORD_FINDER_KEY, EMPTY_WORD_FINDER).practice;
    const picked = preferPractice(practice, CONCEPTS, shuffle(pool), profile === 'rebuild' ? 5 : 6);
    // Rotating the language each word is a light language-switching exercise for multilingual users.
    return shuffle(picked).map((concept, i) => ({
      concept,
      lang: trainLangs[(start + i) % trainLangs.length],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('ask');
  const [hintCount, setHintCount] = useState(0);
  const [showGarden, setShowGarden] = useState(false);
  const score = useRef({ correct: 0, total: 0 });
  const [leaves, setLeaves] = useState<number[]>([]);
  const [note, setNote] = useState<SpeechNote>(null);
  const [heard, setHeard] = useState('');

  const round = rounds[index];
  const otherLang = trainLangs.find((l) => l !== round?.lang) ?? null;
  const hints = useMemo(() => (round ? buildHints(round.concept, round.lang, otherLang) : []), [round, otherLang]);
  const options = useMemo(() => {
    if (!round) return [];
    const c = round.concept;
    const pool = CONCEPTS.filter((x) => x.cat === c.cat || x.tier === c.tier);
    return choicesWith(c, pool, 3, (a, b) => a.id === b.id).map((x) => ({ key: x.id, label: x.word[round.lang] }));
  }, [round]);

  const nextHint = () => (hintCount < hints.length ? setHintCount(hintCount + 1) : setPhase('choices'));

  /**
   * Saying the word aloud is the actual naming exercise; the app only checks it.
   * A miss is never marked wrong: it simply opens the next hint (errorless learning).
   */
  const onHeard = (alternatives: string[]) => {
    if (!round || phase !== 'ask') return;
    const others = options.filter((o) => o.key !== round.concept.id).map((o) => o.label);
    const targets = targetsFor(round.concept.id, round.concept.word[round.lang], round.lang);
    setHeard(alternatives[0] ?? '');
    if (matchSpoken(alternatives, targets, round.lang, others).match) {
      setNote(null);
      record(hintCount <= SUCCESS_MAX_HINTS);
      setPhase('heard');
    } else {
      setNote('tryHint');
      nextHint();
    }
  };

  const rec = useRecognizer({
    lang: round?.lang ?? lang,
    contextualStrings: round ? [round.concept.word[round.lang], ...options.map((o) => o.label)] : [],
    onFinal: onHeard,
    onError: (e) => e === 'no-speech' && setNote('noSpeech'),
  });

  const record = (success: boolean) => {
    score.current.total += 1;
    if (success) score.current.correct += 1;
    setLeaves((l) => [...l, hintCount]);
    if (success) {
      const data = getGameData<WordFinderData>(WORD_FINDER_KEY, EMPTY_WORD_FINDER);
      if (data.practice.includes(round.concept.id)) useStore.getState().setGameData(WORD_FINDER_KEY, removePractice(data, round.concept.id));
    }
  };

  const nextRound = () => {
    if (index + 1 >= rounds.length) {
      setShowGarden(true);
      return;
    }
    rec.stop();
    setIndex(index + 1);
    setPhase('ask');
    setHintCount(0);
    setNote(null);
    setHeard('');
  };

  if (showGarden) {
    return (
      <>
        <Txt variant="title" center>
          {t('word.garden')}
        </Txt>
        <Gap />
        <Card>
          <Row style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            {rounds.map((r, i) => (
              <View key={r.concept.id} style={{ alignItems: 'center', margin: space.xs }}>
                <Emoji size={56}>{r.concept.emoji}</Emoji>
                <Txt variant="small">{'🍃'.repeat(Math.min(3, (leaves[i] ?? 0) + 1))}</Txt>
                <Txt variant="small" color={colors.inkSoft}>
                  {r.concept.word[r.lang]}
                </Txt>
              </View>
            ))}
          </Row>
        </Card>
        <Gap />
        <BigButton label={t('common.continue')} onPress={() => onDone(score.current)} />
      </>
    );
  }

  const { concept } = round;
  const tl = tIn(round.lang);
  const word = concept.word[round.lang];

  return (
    <>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt variant="small" color={colors.inkSoft}>
          {index + 1} / {rounds.length}
        </Txt>
        <View style={{ backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: space.sm, paddingVertical: 4 }}>
          <Txt variant="small" bold>
            {t('word.inLang', { lang: t(`langs.${round.lang}`) })}
          </Txt>
        </View>
      </Row>
      <Emoji size={130}>{concept.emoji}</Emoji>

      <Dir lang={round.lang}>
        {phase === 'ask' && <Prompt text={tl('word.prompt')} lang={round.lang} />}

        {hints.slice(0, hintCount).map((h) => (
          <View key={h} style={{ flexDirection: 'row', gap: space.xs, backgroundColor: colors.hintSoft, borderRadius: radius.md, padding: space.sm, marginTop: space.xs }}>
            <Txt>🍃</Txt>
            <Txt style={{ flexShrink: 1 }} color={colors.ink}>
              {h}
            </Txt>
          </View>
        ))}
        <Gap size={12} />

        {phase === 'ask' && note && (
          <View style={{ backgroundColor: colors.hintSoft, borderRadius: radius.md, padding: space.sm, marginBottom: space.xs }}>
            {note === 'tryHint' && heard ? (
              <Txt variant="small" color={colors.inkSoft}>
                {tl('tools.heardYou', { v: heard })}
              </Txt>
            ) : null}
            <Txt bold color={colors.hint}>
              {tl(note === 'tryHint' ? 'tools.tryHint' : 'tools.noSpeech')}
            </Txt>
          </View>
        )}

        {phase === 'ask' && rec.available && (
          rec.listening ? (
            <View style={{ alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.lg, padding: space.sm, marginVertical: space.xs }}>
              <Txt bold center>
                🎤 {tl('tools.listening')}
              </Txt>
              {rec.interim ? (
                <Txt center color={colors.inkSoft}>
                  {rec.interim}
                </Txt>
              ) : null}
              <BigButton tone="secondary" label={tl('tools.stopListening')} onPress={rec.stop} style={{ alignSelf: 'stretch' }} />
            </View>
          ) : (
            <BigButton
              icon="🎤"
              label={tl('tools.sayIt')}
              sublabel={tl('tools.sayItSub')}
              onPress={() => {
                setNote(null);
                rec.start();
              }}
            />
          )
        )}

        {phase === 'ask' && (
          <>
            <BigButton
              tone={rec.available ? 'secondary' : 'primary'}
              label={tl('word.iKnow')}
              onPress={() => {
                rec.stop();
                setPhase('check');
              }}
            />
            <BigButton
              tone="hint"
              label={tl('word.hint')}
              onPress={() => {
                setNote(null);
                nextHint();
              }}
            />
          </>
        )}

        {phase === 'heard' && (
          <>
            <WordReveal word={word} lang={round.lang} />
            <Txt bold center color={colors.good}>
              {tl('tools.rightSaid')}
            </Txt>
            <Gap size={8} />
            <BigButton label={t('common.next')} onPress={nextRound} />
          </>
        )}

        {phase === 'check' && (
          <>
            <WordReveal word={word} lang={round.lang} />
            <Txt bold center>
              {tl('word.didYou')}
            </Txt>
            <Gap size={8} />
            <BigButton
              tone="good"
              label={tl('word.gotIt')}
              onPress={() => {
                record(hintCount <= SUCCESS_MAX_HINTS);
                nextRound();
              }}
            />
            <BigButton
              tone="secondary"
              label={tl('word.notQuite')}
              onPress={() => {
                record(false);
                setPhase('sayIt');
              }}
            />
          </>
        )}

        {phase === 'choices' && (
          <>
            <Txt bold center>
              {tl('word.choose')}
            </Txt>
            <Choices
              choices={options}
              correctKey={concept.id}
              onAnswer={() => {
                record(false);
                setPhase('sayIt');
              }}
              correctText={tl('vault.right')}
              revealText={tl('vault.itWas', { answer: word })}
            />
          </>
        )}

        {phase === 'sayIt' && (
          <>
            <WordReveal word={word} lang={round.lang} />
            <Txt center>{tl('word.sayItOut', { word })}</Txt>
            <Gap size={8} />
            <BigButton label={t('common.next')} onPress={nextRound} />
          </>
        )}
      </Dir>
    </>
  );
}

function Prompt({ text, lang }: { text: string; lang: Lang }) {
  useAutoSpeak(text, lang);
  return (
    <Txt center color={colors.inkSoft}>
      {text}
    </Txt>
  );
}

function WordReveal({ word, lang }: { word: string; lang: Lang }) {
  useAutoSpeak(word, lang);
  return (
    <Row style={{ justifyContent: 'center', marginVertical: space.sm }}>
      <Txt variant="huge" bold color={colors.primary}>
        {word}
      </Txt>
      <SpeakButton text={word} lang={lang} />
    </Row>
  );
}
