import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Choices, type Choice } from '@/components/Choices';
import { BigButton, Dir, Gap, Row, SpeakButton, Txt } from '@/components/ui';
import { pick, shuffle } from '@/engine/random';
import { STORIES, type Story } from '@/content/stories';
import { tIn } from '@/i18n';
import type { Lang } from '@/lib/lang';
import { useAutoSpeak } from '@/lib/speech';
import { colors, radius, space } from '@/lib/theme';
import { useStore } from '@/state/store';
import type { GameProps } from './types';

type Question = { prompt: string; quote?: string; choices: Choice[]; correctKey: string };

function buildQuestions(story: Story, lang: Lang): Question[] {
  const tl = tIn(lang);
  const topic: Question = {
    prompt: tl('story.topic'),
    choices: shuffle([story.topic, ...story.wrongTopics].map((x, i) => ({ key: String(i), label: x[lang] }))),
    correctKey: '0',
  };

  const line = pick(story.lines);
  const who: Question = {
    prompt: tl('story.whoSaid'),
    quote: line.text[lang],
    choices: story.speakers.map((s, i) => ({ key: String(i), label: s.name[lang], icon: s.emoji })),
    correctKey: String(line.s),
  };

  const [a, b] = shuffle(story.events.map((_, i) => i)).slice(0, 2).sort((x, y) => x - y);
  const order: Question = {
    prompt: tl('story.first'),
    choices: shuffle([a, b]).map((i) => ({ key: String(i), label: story.events[i][lang] })),
    correctKey: String(a),
  };

  return [topic, who, order];
}

/**
 * Story Thread: follow a short conversation, then answer questions about its
 * topic, who said what, and the order of events. Rebuild users can reopen the
 * conversation while answering.
 */
export function StoryThread({ lang, onDone }: GameProps) {
  const { t } = useTranslation();
  const tl = tIn(lang);
  const profile = useStore((s) => s.settings.profile);

  const { story, questions } = useMemo(() => {
    const recent = useStore.getState().recentStories;
    const fresh = STORIES.filter((s) => !recent.includes(s.id));
    const chosen = pick(fresh.length ? fresh : STORIES);
    useStore.getState().markStory(chosen.id);
    return { story: chosen, questions: buildQuestions(chosen, lang) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [shown, setShown] = useState(1);
  const [qIndex, setQIndex] = useState(-1);
  const [peek, setPeek] = useState(false);
  const score = useRef({ correct: 0, total: 0 });

  const reading = qIndex < 0;
  const [a, b] = story.speakers;

  if (reading || peek) {
    const visible = peek ? story.lines : story.lines.slice(0, shown);
    return (
      <Dir lang={lang}>
        <Txt center color={colors.inkSoft}>
          {tl('story.intro', { a: a.name[lang], b: b.name[lang] })}
        </Txt>
        <Gap size={12} />
        {visible.map((l, i) => (
          <Bubble key={i} story={story} line={l} lang={lang} speak={!peek && i === visible.length - 1} />
        ))}
        <Gap size={12} />
        {peek ? (
          <BigButton label={t('common.continue')} onPress={() => setPeek(false)} />
        ) : shown < story.lines.length ? (
          <BigButton label={t('common.next')} onPress={() => setShown(shown + 1)} />
        ) : (
          <BigButton label={t('common.continue')} onPress={() => setQIndex(0)} />
        )}
      </Dir>
    );
  }

  const q = questions[qIndex];
  return (
    <Dir lang={lang}>
      <Txt variant="small" center color={colors.inkSoft}>
        {qIndex + 1} / {questions.length}
      </Txt>
      <Txt bold center>
        {q.prompt}
      </Txt>
      {q.quote && (
        <View style={{ backgroundColor: colors.accentSoft, borderRadius: radius.md, padding: space.sm, marginTop: space.sm }}>
          <Txt center>“{q.quote}”</Txt>
        </View>
      )}
      <Gap size={12} />
      <Choices
        key={qIndex}
        choices={q.choices}
        correctKey={q.correctKey}
        correctText={tl('vault.right')}
        revealText={tl('vault.itWas', { answer: q.choices.find((c) => c.key === q.correctKey)?.label })}
        onAnswer={(ok) => {
          score.current.total += 1;
          if (ok) score.current.correct += 1;
          if (qIndex + 1 >= questions.length) onDone(score.current);
          else setQIndex(qIndex + 1);
        }}
      />
      {profile === 'rebuild' && <BigButton tone="quiet" label={tl('story.showAgain')} onPress={() => setPeek(true)} />}
    </Dir>
  );
}

function Bubble({ story, line, lang, speak }: { story: Story; line: Story['lines'][number]; lang: Lang; speak: boolean }) {
  const speaker = story.speakers[line.s];
  const text = line.text[lang];
  useAutoSpeak(speak ? text : null, lang);
  const mine = line.s === 1;
  return (
    <Row style={{ alignSelf: mine ? 'flex-end' : 'flex-start', width: '94%', marginVertical: space.xs, flexDirection: mine ? 'row-reverse' : 'row' }}>
      <Txt variant="title">{speaker.emoji}</Txt>
      <View
        style={{
          flex: 1,
          backgroundColor: mine ? colors.hintSoft : colors.card,
          borderRadius: radius.md,
          padding: space.sm,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
        <Txt variant="small" bold color={colors.inkSoft}>
          {speaker.name[lang]}
        </Txt>
        <Txt>{text}</Txt>
      </View>
      <SpeakButton text={text} lang={lang} />
    </Row>
  );
}
