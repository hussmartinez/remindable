import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Platform, Pressable, View } from 'react-native';

import { Emoji, Row, SpeakButton, Txt, useTextScale } from '@/components/ui';
import type { Concept } from '@/content/concepts';
import { tIn } from '@/i18n';
import type { Lang } from '@/lib/lang';
import { useAutoSpeak } from '@/lib/speech';
import { colors, radius, space } from '@/lib/theme';

export type Translate = (key: string, opts?: Record<string, string | number>) => string;

export const tFor = (lang: Lang): Translate => {
  const tl = tIn(lang);
  return (key, opts) => tl(key, opts) as string;
};

/** Gentle fade-and-grow entrance; slow enough to read as calm, not flashy. */
export function FadeIn({ children }: { children: ReactNode }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [v]);
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  return <Animated.View style={{ opacity: v, transform: [{ scale }] }}>{children}</Animated.View>;
}

/** A line of lesson text with a 🔊 button; read aloud on mount when `auto`. */
export function Say({ text, lang, auto = true, bold }: { text: string; lang: Lang; auto?: boolean; bold?: boolean }) {
  useAutoSpeak(auto ? text : null, lang);
  return (
    <Row style={{ marginVertical: space.xs }}>
      <Txt bold={bold} style={{ flexShrink: 1, flexGrow: 1 }}>
        {text}
      </Txt>
      <SpeakButton text={text} lang={lang} />
    </Row>
  );
}

export type TileState = 'idle' | 'selected' | 'good' | 'missed' | 'faded';

const tileLook: Record<TileState, { bg: string; border: string; opacity: number; width: number }> = {
  idle: { bg: colors.card, border: colors.border, opacity: 1, width: 2 },
  selected: { bg: colors.accentSoft, border: colors.accent, opacity: 1, width: 4 },
  good: { bg: colors.goodSoft, border: colors.good, opacity: 1, width: 4 },
  missed: { bg: colors.hintSoft, border: colors.hint, opacity: 1, width: 4 },
  faded: { bg: colors.card, border: colors.border, opacity: 0.45, width: 2 },
};

/** A tappable picture in the recall grid. */
export function Tile({ concept, lang, state, width, onPress, showName }: { concept: Concept; lang: Lang; state: TileState; width: `${number}%`; onPress?: () => void; showName?: boolean }) {
  const scale = useTextScale();
  const look = tileLook[state];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={concept.word[lang]}
      accessibilityState={{ selected: state === 'selected' }}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        width,
        minHeight: 84 * Math.min(scale, 1.3),
        borderRadius: radius.md,
        borderWidth: look.width,
        borderColor: look.border,
        backgroundColor: look.bg,
        opacity: pressed ? 0.8 : look.opacity,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
      })}>
      <Emoji size={46}>{concept.emoji}</Emoji>
      {showName && (
        <Txt variant="small" center>
          {concept.word[lang]}
        </Txt>
      )}
    </Pressable>
  );
}

export function Grid({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.xs }}>{children}</View>;
}

/** Big centred picture line (emoji or digits) for lesson illustrations. */
export function Picture({ children, size = 56 }: { children: string; size?: number }) {
  return (
    <View style={{ alignItems: 'center', marginVertical: space.xs }}>
      <Emoji size={size}>{children}</Emoji>
    </View>
  );
}

/** Pictures in reading order with arrows between them; a flex row, so it follows the Dir direction. */
export function Sequence({ items, rtl, size = 52, arrows = true }: { items: string[]; rtl: boolean; size?: number; arrows?: boolean }) {
  return (
    <Row style={{ justifyContent: 'center', marginVertical: space.xs }}>
      {items.map((it, i) => (
        <Row key={i}>
          {i > 0 && arrows && (
            <Txt variant="title" color={colors.inkSoft}>
              {rtl ? '←' : '→'}
            </Txt>
          )}
          <Emoji size={size}>{it}</Emoji>
        </Row>
      ))}
    </Row>
  );
}
