import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { BigButton, Card, Emoji, Gap, NoFlip, Row, Txt, useTextScale } from '@/components/ui';
import type { Profile } from '@/engine/adaptive';
import {
  ROOMS,
  chunk,
  digitCount,
  listLength,
  makeDigits,
  makeList,
  scoreDigits,
  scoreRecall,
  type ToolId,
} from '@/engine/toolkit';
import { isRTL, type Lang } from '@/lib/lang';
import { colors, minTap, radius, space } from '@/lib/theme';
import { FadeIn, Grid, Say, Tile, tFor, type TileState } from './parts';

export type TryResult = { predicted: number; correct: number; total: number };

type Phase = 'predict' | 'study' | 'pause' | 'recall' | 'check' | 'result';

type Props = { tool: ToolId; lang: Lang; level: number; profile: Profile; onDone: (r: TryResult) => void };

/** Try it: predict, study with the tool, recall by tapping, then see the result. Self-paced, no timers. */
export function TryIt({ tool, lang, level, profile, onDone }: Props) {
  const { t } = useTranslation();
  const tl = useMemo(() => tFor(lang), [lang]);
  const digits = useMemo(() => (tool === 'chunking' ? makeDigits(digitCount(level, profile)) : []), [tool, level, profile]);
  const list = useMemo(() => makeList(listLength(level, profile, tool), tool), [tool, level, profile]);
  const n = tool === 'chunking' ? digits.length : list.targets.length;

  const [phase, setPhase] = useState<Phase>('predict');
  const [predicted, setPredicted] = useState(0);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [entered, setEntered] = useState<number[]>([]);
  const [note, setNote] = useState<string[]>([]);

  const targetIds = list.targets.map((c) => c.id);
  const score = tool === 'chunking' ? scoreDigits(digits, entered) : scoreRecall(targetIds, picked);
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  if (phase === 'predict') {
    return (
      <>
        <Say text={`${tl('toolkit.predict')} ${tl('toolkit.outOf', { n })}`} lang={lang} bold />
        <Gap size={space.sm} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.sm }}>
          {Array.from({ length: n }, (_, i) => i + 1).map((k) => (
            <NumberKey
              key={k}
              label={String(k)}
              onPress={() => {
                setPredicted(k);
                setPhase('study');
              }}
            />
          ))}
        </View>
      </>
    );
  }

  if (phase === 'study' && tool === 'chunking') {
    const chunks = chunk(digits);
    return (
      <>
        <Say text={tl('toolkit.chunking.study')} lang={lang} />
        <FadeIn>
          <NoFlip style={{ flexDirection: 'row', justifyContent: 'center', gap: space.md, marginVertical: space.lg }}>
            {chunks.map((c, i) => (
              <Card key={i} style={{ paddingHorizontal: space.md }}>
                <Txt variant="huge" bold color={colors.primary}>
                  {c}
                </Txt>
              </Card>
            ))}
          </NoFlip>
        </FadeIn>
        <Say text={chunks.join(', ')} lang={lang} auto={false} />
        <BigButton label={tl('toolkit.ready')} onPress={() => setPhase('recall')} />
      </>
    );
  }

  if (phase === 'study' && tool === 'writeDown') {
    const all = note.length === n;
    return (
      <>
        <Say text={tl('toolkit.writeDown.study')} lang={lang} />
        <Grid>
          {list.targets.map((c) => (
            <Tile
              key={c.id}
              concept={c}
              lang={lang}
              width="30%"
              showName
              state={note.includes(c.id) ? 'faded' : 'idle'}
              onPress={() => setNote((x) => (x.includes(c.id) ? x : [...x, c.id]))}
            />
          ))}
        </Grid>
        <Gap size={space.sm} />
        <Note ids={note} list={list.targets} lang={lang} title={tl('toolkit.writeDown.note')} />
        <BigButton label={tl('toolkit.ready')} disabled={!all} onPress={() => setPhase('recall')} />
      </>
    );
  }

  if (phase === 'study') {
    const c = list.targets[step];
    const prev = step > 0 ? list.targets[step - 1] : null;
    const word = c.word[lang];
    const room = ROOMS[step];
    const text =
      tool === 'visualise'
        ? tl('toolkit.visualise.study', { word })
        : tool === 'story'
          ? tl(prev ? 'toolkit.story.link' : 'toolkit.story.first', { word })
          : tool === 'palace'
            ? tl('toolkit.palace.study', { room: tl(`toolkit.palace.rooms.${room.id}`), word })
            : tl('toolkit.stopThink.study', { word });
    const arrow = isRTL(lang) ? '←' : '→';
    return (
      <>
        <Txt variant="small" color={colors.inkSoft}>
          {step + 1} / {n}
        </Txt>
        <FadeIn key={step}>
          <Row style={{ justifyContent: 'center', marginVertical: space.md }}>
            {tool === 'palace' && <Emoji size={64}>{room.emoji}</Emoji>}
            {tool === 'story' && prev && (
              <>
                <Emoji size={56}>{prev.emoji}</Emoji>
                <Txt variant="title" color={colors.inkSoft}>
                  {arrow}
                </Txt>
              </>
            )}
            <Emoji size={tool === 'visualise' ? 140 : 110}>{c.emoji}</Emoji>
          </Row>
        </FadeIn>
        <Say key={`say${step}`} text={text} lang={lang} />
        <BigButton
          label={t('common.next')}
          onPress={() => {
            if (step + 1 < n) setStep(step + 1);
            else setPhase(tool === 'stopThink' ? 'pause' : 'recall');
          }}
        />
      </>
    );
  }

  if (phase === 'pause') {
    return (
      <>
        <FadeIn>
          <Emoji size={72}>🛑</Emoji>
        </FadeIn>
        <Say text={`${tl('toolkit.stopThink.stop')} ${tl('toolkit.stopThink.think')} ${tl('toolkit.stopThink.checkFirst')}`} lang={lang} />
        <BigButton label={tl('toolkit.ready')} onPress={() => setPhase('recall')} />
      </>
    );
  }

  if (tool === 'chunking' && (phase === 'recall' || phase === 'result')) {
    const done = phase === 'result';
    return (
      <>
        <Say text={done ? tl('toolkit.result', { correct: score.correct, total: score.total }) : tl('toolkit.recallDigits')} lang={lang} bold={done} />
        <DigitSlots digits={digits} entered={entered} reveal={done} />
        {done && (
          <NoFlip style={{ flexDirection: 'row', justifyContent: 'center', gap: space.md }}>
            {chunk(digits).map((c, i) => (
              <Txt key={i} variant="title" color={colors.good} bold>
                {c}
              </Txt>
            ))}
          </NoFlip>
        )}
        {!done && (
          <Keypad
            onDigit={(d) => entered.length < n && setEntered([...entered, d])}
            onDelete={() => setEntered(entered.slice(0, -1))}
            deleteLabel={tl('toolkit.delete')}
          />
        )}
        <Gap size={space.sm} />
        {done ? (
          <BigButton label={t('common.continue')} onPress={() => onDone({ predicted, correct: score.correct, total: score.total })} />
        ) : (
          <BigButton label={tl('toolkit.done')} disabled={entered.length < n} onPress={() => setPhase('result')} />
        )}
      </>
    );
  }

  // Picture recall, the Stop–Think–Check review, and the result.
  const done = phase === 'result';
  const stateOf = (id: string): TileState => {
    const isTarget = targetIds.includes(id);
    const on = picked.includes(id);
    if (!done) return on ? 'selected' : 'idle';
    if (isTarget) return on ? 'good' : 'missed';
    return 'faded';
  };
  const recallHint =
    tool === 'visualise' || tool === 'story' || tool === 'palace' ? tl(`toolkit.${tool}.recall`) : tool === 'writeDown' ? tl('toolkit.writeDown.recall') : null;
  const prompt = done
    ? `${tl('toolkit.result', { correct: score.correct, total: score.total })} ${tl('toolkit.resultLegend')}`
    : phase === 'check'
      ? tl('toolkit.stopThink.check')
      : [tl('toolkit.recallPictures'), recallHint].filter(Boolean).join(' ');
  const cols = list.grid.length > 9 ? '23%' : '30%';

  return (
    <>
      <Say key={phase} text={prompt} lang={lang} bold={done} />
      {tool === 'palace' && (
        <Row style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          {ROOMS.slice(0, n).map((r) => (
            <Emoji key={r.id} size={34}>
              {r.emoji}
            </Emoji>
          ))}
        </Row>
      )}
      {tool === 'writeDown' && <Note ids={note} list={list.targets} lang={lang} title={tl('toolkit.writeDown.note')} />}
      <Gap size={space.xs} />
      <Grid>
        {list.grid.map((c) => (
          <Tile key={c.id} concept={c} lang={lang} width={cols} state={stateOf(c.id)} showName={done} onPress={done ? undefined : () => toggle(c.id)} />
        ))}
      </Grid>
      <Gap size={space.sm} />
      {done ? (
        <BigButton label={t('common.continue')} onPress={() => onDone({ predicted, correct: score.correct, total: score.total })} />
      ) : phase === 'check' ? (
        <BigButton label={tl('toolkit.stopThink.sure')} onPress={() => setPhase('result')} />
      ) : (
        <BigButton label={tl('toolkit.done')} disabled={!picked.length} onPress={() => setPhase(tool === 'stopThink' ? 'check' : 'result')} />
      )}
    </>
  );
}

/** The user's own shopping note: an external memory aid they build themselves. */
function Note({ ids, list, lang, title }: { ids: string[]; list: { id: string; emoji: string; word: Record<Lang, string> }[]; lang: Lang; title: string }) {
  return (
    <Card style={{ backgroundColor: colors.accentSoft, marginVertical: space.xs }}>
      <Txt bold>📝 {title}</Txt>
      {ids.map((id) => {
        const c = list.find((x) => x.id === id)!;
        return (
          <Txt key={id}>
            {c.emoji} {c.word[lang]}
          </Txt>
        );
      })}
    </Card>
  );
}

function NumberKey({ label, onPress, accessibilityLabel }: { label: string; onPress: () => void; accessibilityLabel?: string }) {
  const scale = useTextScale();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: minTap * 1.2 * scale,
        height: minTap * 1.2 * scale,
        borderRadius: radius.md,
        borderWidth: 2,
        borderColor: colors.primary,
        backgroundColor: pressed ? colors.accentSoft : colors.card,
        alignItems: 'center',
        justifyContent: 'center',
      })}>
      <Txt variant="title" color={colors.primary}>
        {label}
      </Txt>
    </Pressable>
  );
}

/** Phone-style keypad. Fixed physical layout, so it never mirrors. */
function Keypad({ onDigit, onDelete, deleteLabel }: { onDigit: (d: number) => void; onDelete: () => void; deleteLabel: string }) {
  const rows = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  return (
    <NoFlip style={{ alignItems: 'center', gap: space.xs, marginTop: space.sm }}>
      {rows.map((r) => (
        <View key={r[0]} style={{ flexDirection: 'row', gap: space.xs }}>
          {r.map((d) => (
            <NumberKey key={d} label={String(d)} onPress={() => onDigit(d)} />
          ))}
        </View>
      ))}
      <View style={{ flexDirection: 'row', gap: space.xs }}>
        <View style={{ width: minTap * 1.2 }} />
        <NumberKey label="0" onPress={() => onDigit(0)} />
        <NumberKey label="⌫" accessibilityLabel={deleteLabel} onPress={onDelete} />
      </View>
    </NoFlip>
  );
}

/** Entered digits in pairs, matching how they were studied. */
function DigitSlots({ digits, entered, reveal }: { digits: number[]; entered: number[]; reveal: boolean }) {
  return (
    <NoFlip style={{ flexDirection: 'row', justifyContent: 'center', gap: space.md, marginVertical: space.sm }}>
      {chunk(digits).map((_, ci) => (
        <View key={ci} style={{ flexDirection: 'row', gap: 4 }}>
          {[0, 1].map((k) => {
            const i = ci * 2 + k;
            if (i >= digits.length) return null;
            const d = entered[i];
            const color = !reveal || d === undefined ? colors.ink : d === digits[i] ? colors.good : colors.hint;
            return (
              <View
                key={k}
                style={{
                  width: 40,
                  height: 52,
                  borderBottomWidth: 3,
                  borderColor: reveal ? color : colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Txt variant="title" bold color={color}>
                  {d ?? ''}
                </Txt>
              </View>
            );
          })}
        </View>
      ))}
    </NoFlip>
  );
}
