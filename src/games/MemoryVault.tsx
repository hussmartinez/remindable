import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Choices, type Choice } from '@/components/Choices';
import { BigButton, Card, Dir, Emoji, Gap, Row, SpeakButton, Txt } from '@/components/ui';
import { MAX_LEVEL } from '@/engine/adaptive';
import { dayKey } from '@/engine/dates';
import { choicesWith, pick, shuffle } from '@/engine/random';
import { dueItems, newReviewState, review, type ReviewState } from '@/engine/srs';
import { PEOPLE, SPOTS, THINGS, type VaultItem } from '@/content/vault';
import { tIn } from '@/i18n';
import type { Lang } from '@/lib/lang';
import { useAutoSpeak } from '@/lib/speech';
import { colors } from '@/lib/theme';
import { useStore } from '@/state/store';
import type { GameProps } from './types';

type CardStep = { type: 'study'; item: VaultItem } | { type: 'recall'; item: VaultItem; scheduled: boolean };

type Props = GameProps & {
  mode: 'learn' | 'later';
  /** For `later`: the items learned earlier in this session. */
  todaysItems?: VaultItem[];
  onLearned?: (items: VaultItem[]) => void;
};

/**
 * Memory Vault: spaced retrieval of everyday associations.
 * `learn` reviews items due from earlier days, then teaches new ones with an
 * immediate check. `later` re-tests today's items after a delay filled by other games.
 */
export function MemoryVault({ lang, mode, todaysItems = [], onLearned, onDone }: Props) {
  const { t } = useTranslation();
  const store = useStore.getState();
  const today = dayKey();

  const plan = useMemo(() => {
    if (mode === 'later') return { steps: shuffle(todaysItems).map((item): CardStep => ({ type: 'recall', item, scheduled: false })), fresh: [] };
    const due = dueItems(store.vaultReviews, today, 4)
      .map((r) => store.vaultItems[r.id])
      .filter(Boolean);
    const fresh = createItems(newItemCount(store.settings.profile, store.levels.vault ?? 1), store.vaultItems, store.vaultReviews);
    const steps: CardStep[] = [
      ...due.map((item): CardStep => ({ type: 'recall', item, scheduled: true })),
      ...fresh.map((item): CardStep => ({ type: 'study', item })),
      ...fresh.map((item): CardStep => ({ type: 'recall', item, scheduled: false })),
    ];
    return { steps, fresh };
    // Plan once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [index, setIndex] = useState(0);
  const score = useRef({ correct: 0, total: 0 });
  const reviews = useRef<ReviewState[]>([]);

  const finish = () => {
    if (mode === 'learn') {
      useStore.getState().saveVault(plan.fresh, [...reviews.current, ...plan.fresh.map((i) => newReviewState(i.id, today))]);
      onLearned?.(plan.fresh);
    }
    onDone(score.current);
  };

  const advance = () => (index + 1 >= plan.steps.length ? finish() : setIndex(index + 1));

  const empty = plan.steps.length === 0;
  useEffect(() => {
    if (empty) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empty]);
  if (empty) return null;

  const step = plan.steps[index];
  const onAnswer = (correct: boolean) => {
    score.current.total += 1;
    if (correct) score.current.correct += 1;
    if (step.type === 'recall' && step.scheduled) {
      const prev = useStore.getState().vaultReviews[step.item.id];
      if (prev) reviews.current.push(review(prev, correct, today));
    }
    advance();
  };

  const title =
    step.type === 'study' ? t('vault.learnTitle') : mode === 'later' ? t('vault.laterTitle') : t('vault.reviewTitle');

  return (
    <>
      <Txt variant="title" center>
        {title}
      </Txt>
      <Gap />
      {step.type === 'study' ? (
        <StudyCard key={index} item={step.item} lang={lang} onNext={advance} />
      ) : (
        <RecallCard key={index} item={step.item} lang={lang} onAnswer={onAnswer} />
      )}
    </>
  );
}

function newItemCount(profile: 'keepSharp' | 'rebuild', level: number) {
  const base = profile === 'rebuild' ? 1 : 2;
  return Math.min(4, base + Math.floor((level - 1) / (MAX_LEVEL / 3)));
}

/**
 * Alternate people and places, skipping anything already learned. Once an
 * object's place is well learned it can be "moved" to a new spot, which keeps
 * the pool from running out and practises updating a memory.
 */
function createItems(count: number, existing: Record<string, VaultItem>, reviews: Record<string, ReviewState>): VaultItem[] {
  const people = shuffle(PEOPLE.filter((p) => !existing[`person:${p.id}`]));
  const things = shuffle(
    THINGS.filter((th) => {
      const id = `place:${th.id}`;
      return !existing[id] || (reviews[id]?.stage ?? 0) >= 4;
    }),
  );
  const out: VaultItem[] = [];
  for (let i = 0; out.length < count && (people.length || things.length); i++) {
    const usePerson = (i % 2 === 0 && people.length) || !things.length;
    if (usePerson) {
      const p = people.pop()!;
      out.push({ id: `person:${p.id}`, kind: 'person', personId: p.id });
    } else {
      const th = things.pop()!;
      const old = existing[`place:${th.id}`];
      const oldSpot = old?.kind === 'place' ? old.spotId : null;
      out.push({ id: `place:${th.id}`, kind: 'place', thingId: th.id, spotId: pick(SPOTS.filter((sp) => sp.id !== oldSpot)).id });
    }
  }
  return out;
}

function describe(item: VaultItem, lang: Lang) {
  const tl = tIn(lang);
  if (item.kind === 'person') {
    const p = PEOPLE.find((x) => x.id === item.personId)!;
    return { emoji: p.emoji, sentence: tl('vault.meet', { name: p.name[lang], job: p.job[lang] }) };
  }
  const th = THINGS.find((x) => x.id === item.thingId)!;
  const spot = SPOTS.find((x) => x.id === item.spotId)!;
  return { emoji: th.emoji, sentence: tl('vault.putAway', { thing: th.name[lang], spot: spot.name[lang] }) };
}

function StudyCard({ item, lang, onNext }: { item: VaultItem; lang: Lang; onNext: () => void }) {
  const { t } = useTranslation();
  const { emoji, sentence } = describe(item, lang);
  useAutoSpeak(sentence, lang);
  return (
    <>
      <Card style={{ alignItems: 'center' }}>
        <Emoji size={110}>{emoji}</Emoji>
        <Gap size={12} />
        <Dir lang={lang} style={{ alignSelf: 'stretch' }}>
          <Row style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <Txt variant="title" center style={{ flexShrink: 1 }}>
              {sentence}
            </Txt>
            <SpeakButton text={sentence} lang={lang} />
          </Row>
        </Dir>
      </Card>
      <Gap size={12} />
      <Txt center color={colors.inkSoft}>
        {t('vault.sayIt')}
      </Txt>
      <Gap />
      <BigButton label={t('common.continue')} onPress={onNext} />
    </>
  );
}

function RecallCard({ item, lang, onAnswer }: { item: VaultItem; lang: Lang; onAnswer: (c: boolean) => void }) {
  const tl = tIn(lang);
  const profile = useStore((s) => s.settings.profile);
  const n = profile === 'rebuild' ? 3 : 4;

  const q = useMemo(() => {
    if (item.kind === 'person') {
      const p = PEOPLE.find((x) => x.id === item.personId)!;
      const choices = choicesWith(p, PEOPLE.filter((x) => x.gender === p.gender), n, (a, b) => a.id === b.id).map((x): Choice => ({ key: x.id, label: x.name[lang] }));
      return { emoji: p.emoji, question: tl('vault.whoIs'), choices, correctKey: p.id };
    }
    const th = THINGS.find((x) => x.id === item.thingId)!;
    const spot = SPOTS.find((x) => x.id === item.spotId)!;
    const choices = choicesWith(spot, SPOTS, n, (a, b) => a.id === b.id).map((x): Choice => ({ key: x.id, label: x.name[lang] }));
    return { emoji: th.emoji, question: tl('vault.whereIs', { thing: th.name[lang] }), choices, correctKey: spot.id };
  }, [item, lang, n, tl]);

  return (
    <>
      <Emoji size={110}>{q.emoji}</Emoji>
      <Dir lang={lang}>
        <Txt bold center>
          {q.question}
        </Txt>
        <Gap size={12} />
        <Choices choices={q.choices} correctKey={q.correctKey} onAnswer={onAnswer} />
      </Dir>
    </>
  );
}
