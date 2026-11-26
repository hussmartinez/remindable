import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Platform, Pressable, View, useWindowDimensions } from 'react-native';

import { BigButton, Card, Dir, Gap, SpeakButton, Txt } from '@/components/ui';
import {
  generatePattern,
  optionCount,
  ruleExample,
  sameTile,
  stepStair,
  whyChoices,
  type PatternItem,
  type RuleKind,
  type Stair,
  type Tile,
} from '@/engine/patterns';
import { tIn } from '@/i18n';
import type { Lang } from '@/lib/lang';
import { isRTL } from '@/lib/lang';
import { useAutoSpeak, useSpeak } from '@/lib/speech';
import { colors, radius, space } from '@/lib/theme';
import { useLevel, useStore } from '@/state/store';
import { PatternTile } from './PatternTile';
import type { GameProps } from './types';

/**
 * Pattern Path: series completion, the task trained in the ACTIVE reasoning
 * arm (effects still visible at 10 years). Every 5th item adds a "Why?" step
 * so the user names the rule: the find–check–apply strategy ACTIVE taught.
 */

const ITEMS = 8;
const WHY_EVERY = 5;
/** Rebuild reads the row tile by tile at this pace. */
const READ_MS = 900;

type Phase = 'intro' | 'item' | 'why';

export function PatternPath({ lang, onDone }: GameProps) {
  const { t } = useTranslation();
  const profile = useStore((s) => s.settings.profile);
  const uiLang = useStore((s) => s.settings.uiLang);
  const startLevel = useLevel('patternPath');
  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [item, setItem] = useState<PatternItem | null>(null);
  const stair = useRef<Stair>({ level: startLevel, up: 0, down: 0 });
  const score = useRef({ correct: 0, total: 0 });

  useAutoSpeak(phase === 'intro' ? t('patternPath.intro') : null, uiLang);

  const nextItem = () => setItem(generatePattern(stair.current.level, optionCount(stair.current.level, profile)));

  const advance = () => {
    const n = index + 1;
    if (n >= ITEMS) return onDone(score.current);
    setIndex(n);
    nextItem();
    setPhase('item');
  };

  const finishItem = (firstTry: boolean) => {
    score.current.total += 1;
    if (firstTry) score.current.correct += 1;
    stair.current = stepStair(stair.current, firstTry, profile);
    if ((index + 1) % WHY_EVERY === 0) setPhase('why');
    else advance();
  };

  const finishWhy = (ok: boolean) => {
    score.current.total += 1;
    if (ok) score.current.correct += 1;
    advance();
  };

  if (phase === 'intro') {
    return (
      <>
        <Card style={{ alignItems: 'center' }}>
          <IntroExample lang={lang} />
          <Gap size={12} />
          <Txt center>{t('patternPath.intro')}</Txt>
          <Gap size={8} />
          <SpeakButton text={t('patternPath.intro')} lang={uiLang} />
        </Card>
        <Gap />
        <BigButton
          label={t('patternPath.start')}
          onPress={() => {
            stair.current = { level: startLevel, up: 0, down: 0 };
            nextItem();
            setPhase('item');
          }}
        />
      </>
    );
  }
  if (!item) return null;

  return (
    <>
      <Txt variant="small" center color={colors.inkSoft}>
        {t('patternPath.progress', { n: index + 1, total: ITEMS })}
      </Txt>
      <Gap size={8} />
      {phase === 'item' ? (
        <ItemView key={index} item={item} lang={lang} uiLang={uiLang} rebuild={profile === 'rebuild'} onFinish={finishItem} />
      ) : (
        <WhyView key={`why${index}`} item={item} lang={lang} uiLang={uiLang} n={profile === 'rebuild' ? 2 : 3} onFinish={finishWhy} />
      )}
    </>
  );
}

// ---------- speech ----------

type Tr = ReturnType<typeof tIn>;

/** Spoken name of a tile, mentioning only what changes along the row (plus the shape noun, which carries gender). */
function describe(tile: Tile, item: PatternItem, tr: Tr): string {
  if (item.kind === 'emoji') return tr(`patternPath.emoji.${tile.emoji}`);
  const showColor = item.varying.includes('color');
  if (item.kind === 'dots') {
    return showColor
      ? tr('patternPath.dotsColorDesc', { n: tile.dots, color: tr(`patternPath.color.${tile.color}`) })
      : tr('patternPath.dotsDesc', { n: tile.dots });
  }
  const context = tr(`patternPath.gender.${tile.shape}`) === 'f' ? 'f' : undefined;
  return tr('patternPath.tileDesc', {
    shape: tr(`patternPath.shape.${tile.shape}`),
    color: showColor ? tr(`patternPath.color.${tile.color}`, { context }) : '',
    size: item.varying.includes('size') ? tr(`patternPath.size.${tile.size}`, { context }) : '',
  })
    .replace(/\s+/g, ' ')
    .trim();
}

const describeRow = (tiles: Tile[], item: PatternItem, lang: Lang) => {
  const tr = tIn(lang);
  return tiles.map((x) => describe(x, item, tr)).join(isRTL(lang) ? '، ' : ', ');
};

// ---------- one series item ----------

type ItemState = 'ask' | 'retry' | 'done';

function useTileBox(count: number, max: number) {
  const { width } = useWindowDimensions();
  const avail = Math.min(width, 640) - space.md * 2 - space.sm * 2;
  return Math.max(34, Math.min(max, Math.floor(avail / count) - 6));
}

function ItemView({
  item,
  lang,
  uiLang,
  rebuild,
  onFinish,
}: {
  item: PatternItem;
  lang: Lang;
  uiLang: Lang;
  rebuild: boolean;
  onFinish: (firstTry: boolean) => void;
}) {
  const { t } = useTranslation();
  const speak = useSpeak();
  const autoSpeak = useStore((s) => s.settings.autoSpeak);
  const [state, setState] = useState<ItemState>('ask');
  const [picked, setPicked] = useState<number | null>(null);
  const [missed, setMissed] = useState(false);
  const [removed, setRemoved] = useState<number[]>([]);
  const [reading, setReading] = useState<number | null>(rebuild ? 0 : null);
  const [readRun, setReadRun] = useState(rebuild ? 1 : 0);
  const box = useTileBox(item.series.length + 1, 76);
  const optBox = Math.min(110, box * 1.6);

  const seriesText = useMemo(() => describeRow(item.series, item, lang), [item, lang]);
  const fullText = useMemo(() => describeRow([...item.series, item.answer], item, lang), [item, lang]);
  const ruleText = t('patternPath.ruleIs', { rule: t(`patternPath.rules.${item.rule}`) });

  // Rebuild: the row is "read" tile by tile, then the ? is highlighted. Input is never blocked or timed.
  useEffect(() => {
    if (!readRun) return;
    if (autoSpeak || readRun > 1) speak(seriesText, lang);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      if (i > item.series.length) {
        clearInterval(timer);
        setReading(null);
      } else setReading(i);
    }, READ_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readRun]);

  useAutoSpeak(state === 'done' ? fullText : !rebuild && state === 'ask' ? t('patternPath.ask') : null, state === 'done' ? lang : uiLang);

  const answerIdx = item.options.findIndex((o) => sameTile(o, item.answer));
  const solved = state === 'done';

  const choose = (i: number) => {
    if (state !== 'ask') return;
    setPicked(i);
    setReading(null);
    if (i === answerIdx) return setState('done');
    // Rebuild gets one errorless retry: show the rule, drop the wrong card, ask again.
    if (rebuild && !missed) {
      setMissed(true);
      setState('retry');
    } else {
      setMissed(true);
      setState('done');
    }
  };

  const readAgain = () => {
    setReading(0);
    setReadRun((r) => r + 1);
  };

  const retry = () => {
    if (picked !== null) setRemoved([...removed, picked]);
    setPicked(null);
    setState('ask');
    readAgain();
  };

  return (
    <>
      <Row2 center>
        <Txt bold center>
          {t('patternPath.ask')}
        </Txt>
        <SpeakButton text={rebuild ? seriesText : t('patternPath.ask')} lang={rebuild ? lang : uiLang} />
      </Row2>
      <Gap size={8} />
      <SeriesRow item={item} lang={lang} box={box} reading={reading} solved={solved} />
      <Gap size={12} />

      {state === 'ask' && rebuild && (
        <BigButton tone="quiet" icon="🔊" label={t('patternPath.readAgain')} onPress={readAgain} />
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.sm, alignSelf: 'center', maxWidth: item.options.length === 4 ? 2 * (optBox + space.sm * 2 + 6) + space.sm : undefined }}>
        {item.options.map((o, i) => {
          if (removed.includes(i)) return null;
          const tone =
            state === 'ask' ? 'idle' : i === answerIdx && state === 'done' ? 'good' : i === picked ? 'hint' : 'idle';
          return (
            <OptionCard
              key={i}
              tone={tone}
              disabled={state !== 'ask'}
              label={describe(o, item, tIn(lang))}
              onPress={() => choose(i)}>
              <PatternTile tile={o} kind={item.kind} box={optBox} />
            </OptionCard>
          );
        })}
      </View>
      <Gap size={12} />

      {state === 'retry' && (
        <Card style={{ backgroundColor: colors.hintSoft, borderColor: colors.hint }}>
          <Txt bold center color={colors.hint}>
            {ruleText}
          </Txt>
          <Txt center>{t('patternPath.retry')}</Txt>
          <Gap size={8} />
          <BigButton label={t('patternPath.tryAgain')} onPress={retry} />
        </Card>
      )}

      {state === 'done' && (
        <>
          <Txt bold center color={picked === answerIdx ? colors.good : colors.hint}>
            {picked === answerIdx ? t('patternPath.right') : t('patternPath.reveal')}
          </Txt>
          <Txt center>{ruleText}</Txt>
          <Gap size={8} />
          <BigButton label={t('common.next')} onPress={() => onFinish(!missed)} />
        </>
      )}
    </>
  );
}

function Row2({ children, center }: { children: ReactNode; center?: boolean }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: center ? 'center' : 'flex-start', gap: space.sm }}>{children}</View>;
}

/** The row of tiles plus the "?" slot, in reading direction (so the ? sits on the left in Arabic). */
function SeriesRow({ item, lang, box, reading, solved }: { item: PatternItem; lang: Lang; box: number; reading: number | null; solved: boolean }) {
  const { t } = useTranslation();
  const [pop] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!solved) return;
    pop.setValue(0.4);
    Animated.spring(pop, { toValue: 1, friction: 5, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [solved, pop]);

  const frame = (i: number) => ({
    borderRadius: radius.md,
    borderWidth: 3,
    borderColor: reading === i ? colors.accent : 'transparent',
    backgroundColor: reading === i ? colors.accentSoft : 'transparent',
  });

  return (
    <Dir lang={lang}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 2, backgroundColor: colors.card, borderRadius: radius.lg, padding: space.xs, borderWidth: 1, borderColor: colors.border }}>
        {item.series.map((tile, i) => (
          <View key={i} style={frame(i)}>
            <PatternTile tile={tile} kind={item.kind} box={box} />
          </View>
        ))}
        <View
          accessibilityLabel={t('patternPath.missing')}
          style={[
            frame(item.series.length),
            {
              borderStyle: solved ? 'solid' : 'dashed',
              borderColor: reading === item.series.length ? colors.accent : solved ? colors.good : colors.primary,
              backgroundColor: solved ? colors.goodSoft : reading === item.series.length ? colors.accentSoft : colors.bg,
            },
          ]}>
          {solved ? (
            <Animated.View style={{ transform: [{ scale: pop }] }}>
              <PatternTile tile={item.answer} kind={item.kind} box={box} />
            </Animated.View>
          ) : (
            <View style={{ width: box, height: box, alignItems: 'center', justifyContent: 'center' }}>
              <Txt variant="title" color={colors.primary}>
                ?
              </Txt>
            </View>
          )}
        </View>
      </View>
    </Dir>
  );
}

type OptTone = 'idle' | 'good' | 'hint' | 'selected';

function OptionCard({
  tone,
  disabled,
  label,
  onPress,
  children,
  wide,
}: {
  tone: OptTone;
  disabled?: boolean;
  label: string;
  onPress: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const border = tone === 'good' ? colors.good : tone === 'hint' ? colors.hint : tone === 'selected' ? colors.accent : colors.border;
  const bg = tone === 'good' ? colors.goodSoft : tone === 'hint' ? colors.hintSoft : colors.card;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minWidth: 72,
        minHeight: 72,
        width: wide ? '100%' : undefined,
        padding: space.sm,
        borderRadius: radius.lg,
        borderWidth: 3,
        borderColor: border,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.8 : 1,
      })}>
      {children}
    </Pressable>
  );
}

// ---------- "Why?" step ----------

function WhyView({ item, lang, uiLang, n, onFinish }: { item: PatternItem; lang: Lang; uiLang: Lang; n: number; onFinish: (ok: boolean) => void }) {
  const { t } = useTranslation();
  const choices = useMemo(() => whyChoices(item.rule, n), [item, n]);
  const examples = useMemo(() => Object.fromEntries(choices.map((r) => [r, ruleExample(r).slice(0, 4)])) as Record<RuleKind, Tile[]>, [choices]);
  const [picked, setPicked] = useState<RuleKind | null>(null);
  const box = useTileBox(item.series.length + 1, 52);
  useAutoSpeak(picked ? null : t('patternPath.whyAsk'), uiLang);

  return (
    <>
      <SeriesRow item={item} lang={lang} box={box} reading={null} solved />
      <Gap size={12} />
      <Row2 center>
        <Txt bold center>
          {t('patternPath.whyAsk')}
        </Txt>
        <SpeakButton text={t('patternPath.whyAsk')} lang={uiLang} />
      </Row2>
      <Gap size={8} />
      {choices.map((r) => {
        const tone: OptTone = picked === null ? 'idle' : r === item.rule ? 'good' : r === picked ? 'hint' : 'idle';
        const label = t(`patternPath.rules.${r}`);
        return (
          <View key={r} style={{ marginVertical: space.xs }}>
            <OptionCard wide tone={tone} disabled={picked !== null} label={label} onPress={() => setPicked(r)}>
              <RuleExample tiles={examples[r]} lang={lang} />
              <Txt bold center>
                {label}
              </Txt>
            </OptionCard>
          </View>
        );
      })}
      {picked && (
        <>
          <Gap size={8} />
          <Txt bold center color={picked === item.rule ? colors.good : colors.hint}>
            {picked === item.rule ? t('patternPath.whyRight') : t('patternPath.whyReveal')}
          </Txt>
          <Gap size={8} />
          <BigButton label={t('common.next')} onPress={() => onFinish(picked === item.rule)} />
        </>
      )}
    </>
  );
}

/** Mini example row on a rule card; the tile kind follows from the tiles themselves. */
function RuleExample({ tiles, lang }: { tiles: Tile[]; lang: Lang }) {
  const k = tiles[0].emoji ? 'emoji' : tiles[0].dots > 0 ? 'dots' : 'shape';
  return (
    <Dir lang={lang}>
      <View style={{ flexDirection: 'row', gap: 4, marginBottom: space.xs }}>
        {tiles.map((x, i) => (
          <PatternTile key={i} tile={x} kind={k} box={40} />
        ))}
        <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
          <Txt bold color={colors.inkSoft}>
            …
          </Txt>
        </View>
      </View>
    </Dir>
  );
}

function IntroExample({ lang }: { lang: Lang }) {
  const tiles = useMemo(() => ruleExample('repeat2').slice(0, 4), []);
  return <RuleExample tiles={tiles} lang={lang} />;
}
