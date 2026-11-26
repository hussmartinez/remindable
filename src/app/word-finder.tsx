import { router } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { BigButton, Card, Emoji, Gap, Row, Screen, SpeakButton, Txt, useTextScale } from '@/components/ui';
import { CATEGORIES, type CategoryId, type Concept } from '@/content/concepts';
import { addPractice, EMPTY_WORD_FINDER, WORD_FINDER_KEY, type WordFinderData } from '@/engine/practiceList';
import { hasClues, PLACE_CLUES, rankConcepts, USE_CLUES, type Query } from '@/engine/reverseDictionary';
import { LANG_NAMES, LANGS, type Lang } from '@/lib/lang';
import { useSpeak } from '@/lib/speech';
import { useRecognizer } from '@/lib/speechRecognition';
import { colors, fontBase, minTap, radius, space } from '@/lib/theme';
import { getGameData, useStore } from '@/state/store';

/**
 * Tip-of-the-tongue rescue. Describing a word by its group, place and use is
 * the same Semantic Feature Analysis used in therapy, so the search itself is
 * also practice. Everything runs offline on the built-in word list.
 */

type Step = 'group' | 'place' | 'use' | 'more' | 'results';
const STEPS: Step[] = ['group', 'place', 'use', 'more', 'results'];

// Partial so a category added to the content later still shows (with a neutral icon).
const CAT_ICONS: Partial<Record<CategoryId, string>> = {
  fruit: '🍎', food: '🍞', animal: '🐶', home: '🏠', tool: '🔨', clothing: '👕', vehicle: '🚗', nature: '🌳', music: '🎵', object: '🔑', body: '👂', place: '📍',
};
const PLACE_ICONS: Record<string, string> = {
  kitchen: '🍳', house: '🛋️', outdoors: '🌳', farm: '🐄', water: '🌊', street: '🚦', onYou: '👤', work: '🧰', town: '🏪',
};
const USE_ICONS: Record<string, string> = {
  eat: '🍴', wear: '👕', open: '🚪', see: '👀', cut: '✂️', light: '💡', travel: '🚲', music: '🎵', measure: '📏', alive: '🐾', yellow: '💛', red: '❤️', long: '↔️',
};

const capital = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1);
const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export default function WordFinder() {
  const { t, i18n } = useTranslation();
  const ui = (LANGS.includes(i18n.language as Lang) ? i18n.language : 'en') as Lang;
  const trainLangs = useStore((s) => s.settings.trainLangs);
  const [step, setStep] = useState<Step>('group');
  const [cats, setCats] = useState<CategoryId[]>([]);
  const [places, setPlaces] = useState<string[]>([]);
  const [uses, setUses] = useState<string[]>([]);
  const [text, setText] = useState('');

  const query: Query = { cats, places, uses, text };
  const goNext = () => setStep(STEPS[STEPS.indexOf(step) + 1]);
  const reset = () => {
    setCats([]);
    setPlaces([]);
    setUses([]);
    setText('');
    setStep('group');
  };

  const clueLabels = [
    ...cats.map((c) => capital(CATEGORIES[c][ui])),
    ...places.map((p) => t(`tools.place.${p}`)),
    ...uses.map((u) => t(`tools.use.${u}`)),
    ...(text.trim() ? [`“${text.trim()}”`] : []),
  ];

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt variant="title" style={{ flexShrink: 1 }}>
          🔎 {t('tools.finderTitle')}
        </Txt>
        <BigButton tone="quiet" label={t('tools.back')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))} />
      </Row>
      {step === 'group' && <Txt color={colors.inkSoft}>{t('tools.finderIntro')}</Txt>}
      <Gap />

      {step === 'group' && (
        <Question title={t('tools.qGroup')}>
          {(Object.keys(CATEGORIES) as CategoryId[]).map((c) => (
            <Chip key={c} icon={CAT_ICONS[c] ?? '🔹'} label={capital(CATEGORIES[c][ui])} selected={cats.includes(c)} onPress={() => setCats(toggle(cats, c))} />
          ))}
        </Question>
      )}
      {step === 'place' && (
        <Question title={t('tools.qPlace')}>
          {PLACE_CLUES.map((c) => (
            <Chip key={c.id} icon={PLACE_ICONS[c.id]} label={t(`tools.place.${c.id}`)} selected={places.includes(c.id)} onPress={() => setPlaces(toggle(places, c.id))} />
          ))}
        </Question>
      )}
      {step === 'use' && (
        <Question title={t('tools.qUse')}>
          {USE_CLUES.map((c) => (
            <Chip key={c.id} icon={USE_ICONS[c.id]} label={t(`tools.use.${c.id}`)} selected={uses.includes(c.id)} onPress={() => setUses(toggle(uses, c.id))} />
          ))}
        </Question>
      )}
      {step === 'more' && <Describe lang={ui} text={text} onChange={setText} />}

      {step !== 'results' && (
        <>
          <Gap size={12} />
          {step === 'more' ? (
            <BigButton label={t('tools.showMe')} disabled={!hasClues(query)} onPress={goNext} />
          ) : (
            <>
              <BigButton label={t('tools.next')} onPress={goNext} />
              {hasClues(query) && <BigButton tone="secondary" label={t('tools.showMe')} onPress={() => setStep('results')} />}
              <BigButton
                tone="quiet"
                label={t('tools.notSure')}
                onPress={() => {
                  if (step === 'group') setCats([]);
                  if (step === 'place') setPlaces([]);
                  if (step === 'use') setUses([]);
                  goNext();
                }}
              />
            </>
          )}
        </>
      )}

      {step === 'results' && (
        <Results query={query} langs={trainLangs} clues={clueLabels} onChangeClues={() => setStep('group')} onStartOver={reset} />
      )}
    </Screen>
  );
}

function Question({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <Txt bold>{title}</Txt>
      <Gap size={8} />
      <Row style={{ flexWrap: 'wrap', gap: space.xs }}>{children}</Row>
    </>
  );
}

function Chip({ icon, label, selected, onPress }: { icon: string; label: string; selected: boolean; onPress: () => void }) {
  const scale = useTextScale();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.xs,
        minHeight: minTap * scale,
        paddingHorizontal: space.sm,
        borderRadius: radius.lg,
        borderWidth: 2,
        borderColor: selected ? colors.accent : colors.border,
        backgroundColor: selected ? colors.accentSoft : colors.card,
        opacity: pressed ? 0.8 : 1,
      })}>
      <Txt>{icon}</Txt>
      <Txt bold={selected}>{label}</Txt>
      {selected ? <Txt color={colors.good}>✓</Txt> : null}
    </Pressable>
  );
}

function Describe({ lang, text, onChange }: { lang: Lang; text: string; onChange: (s: string) => void }) {
  const { t } = useTranslation();
  const scale = useTextScale();
  const rec = useRecognizer({ lang, onFinal: (alts) => onChange(text ? `${text} ${alts[0]}` : alts[0]) });
  return (
    <>
      <Txt bold>{t('tools.qMore')}</Txt>
      <Gap size={8} />
      <TextInput
        value={rec.interim ? `${text} ${rec.interim}`.trim() : text}
        onChangeText={onChange}
        placeholder={t('tools.typeHere')}
        placeholderTextColor={colors.inkSoft}
        multiline
        accessibilityLabel={t('tools.typeHere')}
        style={{
          minHeight: minTap * scale * 1.5,
          fontSize: fontBase.body * scale,
          color: colors.ink,
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 2,
          borderRadius: radius.md,
          padding: space.sm,
          textAlignVertical: 'top',
        }}
      />
      {rec.available &&
        (rec.listening ? (
          <BigButton tone="selected" icon="🎤" label={t('tools.stopListening')} sublabel={t('tools.sayItSub')} onPress={rec.stop} />
        ) : (
          <BigButton tone="secondary" icon="🎤" label={t('tools.speakDescription')} onPress={() => rec.start()} />
        ))}
    </>
  );
}

function Results({
  query,
  langs,
  clues,
  onChangeClues,
  onStartOver,
}: {
  query: Query;
  langs: Lang[];
  clues: string[];
  onChangeClues: () => void;
  onStartOver: () => void;
}) {
  const { t } = useTranslation();
  const speak = useSpeak();
  // Ranked once per visit to this step; the query does not change while results are shown.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const candidates = useMemo(() => rankConcepts(query), []);
  const [selected, setSelected] = useState<string | null>(null);
  const [practice, setPractice] = useState(() => getGameData<WordFinderData>(WORD_FINDER_KEY, EMPTY_WORD_FINDER).practice);

  const choose = (c: Concept) => {
    setSelected(c.id);
    speak(c.word[langs[0]], langs[0]);
  };
  const addToPractice = (id: string) => {
    const data = addPractice(getGameData<WordFinderData>(WORD_FINDER_KEY, EMPTY_WORD_FINDER), id);
    useStore.getState().setGameData(WORD_FINDER_KEY, data);
    setPractice(data.practice);
  };

  return (
    <>
      {clues.length > 0 && (
        <Txt variant="small" color={colors.inkSoft}>
          {t('tools.yourClues')}: {clues.join(' · ')}
        </Txt>
      )}
      <Gap size={12} />
      {candidates.length === 0 ? (
        <Card style={{ alignItems: 'center' }}>
          <Emoji size={64}>🤔</Emoji>
          <Txt bold center>
            {t('tools.noneMatch')}
          </Txt>
          <Txt center color={colors.inkSoft}>
            {t('tools.noneMatchSub')}
          </Txt>
        </Card>
      ) : (
        <>
          <Txt bold>{t('tools.isItOne')}</Txt>
          <Gap size={8} />
          {candidates.map(({ concept: c }) => {
            const isSel = selected === c.id;
            return (
              <View
                key={c.id}
                style={{
                  backgroundColor: isSel ? colors.accentSoft : colors.card,
                  borderColor: isSel ? colors.accent : colors.border,
                  borderWidth: 2,
                  borderRadius: radius.lg,
                  padding: space.sm,
                  marginVertical: space.xs,
                }}>
                <Pressable accessibilityRole="button" accessibilityLabel={langs.map((l) => c.word[l]).join(', ')} onPress={() => choose(c)}>
                  <Row>
                    <Emoji size={isSel ? 96 : 72}>{c.emoji}</Emoji>
                    <View style={{ flexShrink: 1, flexGrow: 1 }}>
                      {/* Single words: Unicode bidi orders them; a per-word Dir would push them to opposite edges. */}
                      {langs.map((l, i) => (
                        <Txt key={l} variant={i === 0 ? 'title' : 'body'} color={i === 0 ? colors.primary : colors.ink}>
                          {c.word[l]}
                        </Txt>
                      ))}
                    </View>
                  </Row>
                </Pressable>
                {isSel && (
                  <>
                    <Row style={{ flexWrap: 'wrap' }}>
                      {langs.map((l) => (
                        <Row key={l} style={{ gap: space.xs }}>
                          <SpeakButton text={c.word[l]} lang={l} />
                          <Txt variant="small" color={colors.inkSoft}>
                            {LANG_NAMES[l]}
                          </Txt>
                        </Row>
                      ))}
                    </Row>
                    {practice.includes(c.id) ? (
                      <Txt bold center color={colors.good}>
                        ✓ {t('tools.practiseAdded')}
                      </Txt>
                    ) : (
                      <BigButton tone="good" icon="🌱" label={t('tools.practise')} onPress={() => addToPractice(c.id)} />
                    )}
                  </>
                )}
              </View>
            );
          })}
        </>
      )}
      <Gap />
      <BigButton tone="secondary" label={candidates.length ? t('tools.noneOfThese') : t('tools.tryAgain')} onPress={onChangeClues} />
      <BigButton tone="quiet" label={t('tools.startOver')} onPress={onStartOver} />
    </>
  );
}
