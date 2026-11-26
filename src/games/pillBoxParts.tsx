import { useEffect, useState } from 'react';
import { Animated, Platform, Pressable, View } from 'react-native';

import { Card, Dir, Row, SpeakButton, Txt, useTextScale } from '@/components/ui';
import { SLOTS, cellKey, type Day, type Fill, type Pill, type PillColor, type Round, type Rule, type Slot } from '@/engine/pillbox';
import { tIn } from '@/i18n';
import type { Lang } from '@/lib/lang';
import { colors, minTap, radius, space } from '@/lib/theme';

/** Pill colours chosen to stay distinguishable; shape is always a second cue. */
const PILL_HEX: Record<PillColor, string> = {
  blue: '#4A7FD4',
  white: '#FFFFFF',
  yellow: '#F2C94C',
  pink: '#F29BB8',
  green: '#5DB075',
  orange: '#F2994A',
};

export const SLOT_EMOJI: Record<Slot, string> = { morning: '🌅', noon: '☀️', night: '🌙' };

export function PillIcon({ pill, size = 26 }: { pill: Pill; size?: number }) {
  const dims =
    pill.shape === 'round'
      ? { width: size, height: size, borderRadius: size / 2 }
      : pill.shape === 'square'
        ? { width: size, height: size, borderRadius: size * 0.2 }
        : { width: size * 1.7, height: size * 0.8, borderRadius: size * 0.4 };
  return <View style={[dims, { backgroundColor: PILL_HEX[pill.color], borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.35)' }]} />;
}

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Plain-language wording of pills, rules and times in the content language. */
export function wording(lang: Lang) {
  const tl = tIn(lang);
  const k = (key: string, o?: Record<string, string>) => tl(`pillBox.${key}`, o);
  const list = (items: string[]) =>
    items.length <= 1 ? (items[0] ?? '') : items.slice(0, -1).join(k('comma')) + k('and') + items[items.length - 1];
  const name = (p: Pill, definite = false) =>
    k(definite ? 'pillThe' : 'pill', { color: k(`color_${p.color}`), shape: k(`shape_${p.shape}`) });
  const day = (d: Day) => k(`day${d}`);
  const at = (s: Slot, food: boolean) => (food ? k('withMeal', { meals: k(`meal_${s}`) }) : k(`at_${s}`));

  const ruleLines = (rule: Rule, pill: Pill): string[] => {
    const when = rule.withFood ? k('withMeal', { meals: list(rule.slots.map((s) => k(`meal_${s}`))) }) : list(rule.slots.map((s) => k(`time_${s}`)));
    const days =
      rule.days.kind === 'daily'
        ? k('daily')
        : rule.days.kind === 'everyOther'
          ? k('everyOther', { day: day(rule.days.start) })
          : k(rule.days.days.length === 1 ? 'onlyOne' : 'onlyMany', { days: list(rule.days.days.map(day)) });
    const lines = [cap(k('rule', { pill: name(pill), when, days }))];
    const c = rule.change;
    if (c?.kind === 'stop') lines.push(k('stop', { day: day(c.from), pill: name(pill, true) }));
    if (c?.kind === 'add') lines.push(k('add', { day: day(c.from), pill: name(pill, true), at: at(c.slot, rule.withFood) }));
    return lines;
  };

  return { k, list, name, day, at, ruleLines };
}

export function Prescription({ round, lang }: { round: Round; lang: Lang }) {
  const w = wording(lang);
  const rows = round.rules.map((r) => {
    const pill = round.pills.find((p) => p.id === r.pill)!;
    return { pill, lines: w.ruleLines(r, pill) };
  });
  const changes = rows.flatMap((r) => r.lines.slice(1).map((line) => ({ pill: r.pill, line })));
  const all = [...rows.map((r) => r.lines[0]), ...changes.map((c) => c.line)].join(' ');
  return (
    <Dir lang={lang}>
      <Card style={{ borderColor: colors.primary, borderWidth: 2 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt bold>📋 {w.k('card')}</Txt>
          <SpeakButton text={all} lang={lang} />
        </Row>
        {rows.map(({ pill, lines }) => (
          <Row key={pill.id} style={{ marginTop: space.xs }}>
            <View style={{ width: 48, alignItems: 'center' }}>
              <PillIcon pill={pill} />
            </View>
            <Txt style={{ flex: 1 }}>{lines[0]}</Txt>
          </Row>
        ))}
        {changes.map(({ pill, line }) => (
          <Row key={`c-${pill.id}`} style={{ marginTop: space.sm, backgroundColor: colors.accentSoft, borderRadius: radius.md, padding: space.xs }}>
            <Txt>👨‍⚕️</Txt>
            <Txt bold style={{ flex: 1 }}>
              {line}
            </Txt>
          </Row>
        ))}
      </Card>
    </Dir>
  );
}

export type CellLook = 'plain' | 'good' | 'hint';

type GridProps = {
  round: Round;
  lang: Lang;
  fill: Fill;
  onTap?: (day: Day, slot: Slot) => void;
  look?: (key: string) => CellLook;
  pulse?: Set<string>;
};

/**
 * Weekly organiser with days as rows and morning/noon/night as columns, so a
 * full week fits a phone without sideways scrolling. Days and times follow
 * reading direction.
 */
export function Organizer({ round, lang, fill, onTap, look, pulse }: GridProps) {
  const w = wording(lang);
  const scale = useTextScale();
  const [glow] = useState(() => new Animated.Value(0));
  const pulsing = !!pulse && pulse.size > 0;

  useEffect(() => {
    if (!pulsing) return;
    const native = Platform.OS !== 'web';
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 550, useNativeDriver: native }),
        Animated.timing(glow, { toValue: 0, duration: 550, useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulsing, glow]);

  const byId = (id: string) => round.pills.find((p) => p.id === id)!;
  const cellH = minTap * scale;

  return (
    <Dir lang={lang}>
      <Row style={{ gap: 4 }}>
        <View style={{ width: 92 * Math.min(scale, 1.3) }} />
        {SLOTS.map((s) => (
          <View key={s} style={{ flex: 1, alignItems: 'center' }}>
            <Txt variant="small" center>
              {SLOT_EMOJI[s]}
            </Txt>
            <Txt variant="small" center color={colors.inkSoft}>
              {w.k(`slot_${s}`)}
            </Txt>
          </View>
        ))}
      </Row>
      {round.days.map((d) => (
        <Row key={d} style={{ gap: 4, marginTop: 4 }}>
          <View style={{ width: 92 * Math.min(scale, 1.3) }}>
            <Txt variant="small" bold>
              {cap(w.day(d))}
            </Txt>
          </View>
          {SLOTS.map((s) => {
            const key = cellKey(d, s);
            const state = look?.(key) ?? 'plain';
            const glowing = pulse?.has(key);
            const bg = state === 'good' ? colors.goodSoft : state === 'hint' ? colors.hintSoft : colors.card;
            const border = state === 'good' ? colors.good : state === 'hint' ? colors.hint : colors.border;
            const ids = fill[key] ?? [];
            const label = `${w.day(d)}, ${w.k(`slot_${s}`)}${ids.length ? ': ' + ids.map((id) => w.name(byId(id))).join(', ') : ''}`;
            return (
              <Pressable
                key={s}
                accessibilityRole="button"
                accessibilityLabel={label}
                disabled={!onTap}
                onPress={() => onTap?.(d, s)}
                style={{ flex: 1, minHeight: cellH }}>
                <View
                  style={{
                    flex: 1,
                    borderRadius: radius.md,
                    borderWidth: 2,
                    borderColor: border,
                    backgroundColor: bg,
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    alignContent: 'center',
                    justifyContent: 'center',
                    gap: 3,
                    padding: 4,
                  }}>
                  {ids.map((id) => (
                    <PillIcon key={id} pill={byId(id)} size={16 * Math.min(scale, 1.3)} />
                  ))}
                </View>
                {glowing && (
                  <Animated.View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                      borderRadius: radius.md,
                      borderWidth: 4,
                      borderColor: colors.accent,
                      backgroundColor: colors.accentSoft,
                      opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.95] }),
                    }}
                  />
                )}
              </Pressable>
            );
          })}
        </Row>
      ))}
    </Dir>
  );
}

/** Pill chooser for the organiser: one pill is always selected. */
export function PillTray({
  round,
  lang,
  selected,
  done,
  onSelect,
}: {
  round: Round;
  lang: Lang;
  selected: string;
  done?: Set<string>;
  onSelect: (id: string) => void;
}) {
  const w = wording(lang);
  const scale = useTextScale();
  return (
    <Dir lang={lang} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
      {round.pills.map((p) => {
        const on = p.id === selected;
        const finished = done?.has(p.id);
        return (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            accessibilityLabel={w.name(p)}
            accessibilityState={{ selected: on }}
            onPress={() => onSelect(p.id)}
            style={{
              minHeight: minTap * scale,
              flexGrow: 1,
              flexBasis: '45%',
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.xs,
              paddingHorizontal: space.sm,
              borderRadius: radius.lg,
              borderWidth: on ? 3 : 2,
              borderColor: on ? colors.accent : finished ? colors.good : colors.border,
              backgroundColor: on ? colors.accentSoft : finished ? colors.goodSoft : colors.card,
            }}>
            <PillIcon pill={p} />
            <Txt variant="small" bold={on} style={{ flexShrink: 1 }}>
              {cap(w.name(p))}
              {finished ? ' ✓' : ''}
            </Txt>
          </Pressable>
        );
      })}
    </Dir>
  );
}
