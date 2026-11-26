import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { isRTL, type Lang } from '@/lib/lang';
import { useSpeak } from '@/lib/speech';
import { colors, fontBase, minTap, radius, space } from '@/lib/theme';
import { useStore } from '@/state/store';

export function useTextScale() {
  return useStore((s) => s.settings.textScale);
}

type TxtProps = {
  children: ReactNode;
  variant?: keyof typeof fontBase;
  color?: string;
  bold?: boolean;
  center?: boolean;
  style?: StyleProp<TextStyle>;
};

export function Txt({ children, variant = 'body', color = colors.ink, bold, center, style }: TxtProps) {
  const scale = useTextScale();
  const size = fontBase[variant] * scale;
  return (
    <Text
      style={[
        { fontSize: size, lineHeight: size * 1.35, color, fontWeight: bold || variant === 'title' ? '700' : '400' },
        center && { textAlign: 'center' },
        style,
      ]}>
      {children}
    </Text>
  );
}

/** Sets layout direction for a subtree from the language its content is written in. */
export function Dir({ lang, children, style }: { lang: Lang; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ direction: isRTL(lang) ? 'rtl' : 'ltr' }, style]}>{children}</View>;
}

/**
 * Keeps physical layouts (arrows, maps, grids with fixed positions) unmirrored in RTL.
 * Use Dir instead for content whose order follows reading direction.
 */
export function NoFlip({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ direction: 'ltr' }, style]}>{children}</View>;
}

export function Screen({ children, scroll = true, edges = ['top', 'bottom', 'left', 'right'] }: { children: ReactNode; scroll?: boolean; edges?: Edge[] }) {
  const body = <View style={styles.column}>{children}</View>;
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll}>{body}</ScrollView> : <View style={styles.scroll}>{body}</View>}
    </SafeAreaView>
  );
}

export type ButtonTone = 'primary' | 'secondary' | 'quiet' | 'good' | 'hint' | 'selected';

type ButtonProps = {
  label: string;
  onPress: () => void;
  tone?: ButtonTone;
  icon?: string;
  sublabel?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const toneStyles: Record<ButtonTone, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.primary, fg: colors.primaryInk, border: colors.primary },
  secondary: { bg: colors.card, fg: colors.primary, border: colors.primary },
  quiet: { bg: 'transparent', fg: colors.inkSoft, border: 'transparent' },
  good: { bg: colors.goodSoft, fg: colors.good, border: colors.good },
  hint: { bg: colors.hintSoft, fg: colors.hint, border: colors.hint },
  selected: { bg: colors.accentSoft, fg: colors.ink, border: colors.accent },
};

export function BigButton({ label, onPress, tone = 'primary', icon, sublabel, disabled, style }: ButtonProps) {
  const scale = useTextScale();
  const t = toneStyles[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={sublabel ? `${label}. ${sublabel}` : label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { minHeight: minTap * scale, backgroundColor: t.bg, borderColor: t.border, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        style,
      ]}>
      {icon ? <Text style={{ fontSize: 34 * scale }}>{icon}</Text> : null}
      <View style={{ flexShrink: 1, alignItems: icon || sublabel ? 'flex-start' : 'center', flexGrow: 1 }}>
        <Txt color={t.fg} bold>
          {label}
        </Txt>
        {sublabel ? (
          <Txt variant="small" color={tone === 'primary' ? colors.primaryInk : colors.inkSoft}>
            {sublabel}
          </Txt>
        ) : null}
      </View>
    </Pressable>
  );
}

export function SpeakButton({ text, lang }: { text: string; lang: Lang }) {
  const speak = useSpeak();
  const scale = useTextScale();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="🔊"
      onPress={() => speak(text, lang)}
      style={({ pressed }) => [styles.speak, { width: minTap * scale, height: minTap * scale, opacity: pressed ? 0.7 : 1 }]}>
      <Text style={{ fontSize: 28 * scale }}>🔊</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Emoji({ children, size = 96 }: { children: string; size?: number }) {
  const scale = useTextScale();
  return (
    <Text accessibilityElementsHidden importantForAccessibility="no" style={{ fontSize: size * Math.min(scale, 1.2), textAlign: 'center' }}>
      {children}
    </Text>
  );
}

export function Gap({ size = space.md }: { size?: number }) {
  return <View style={{ height: size }} />;
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: space.sm }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: space.md, alignItems: 'center' },
  column: { width: '100%', maxWidth: 640, flexGrow: 1 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.lg,
    borderWidth: 2,
    marginVertical: space.xs,
  },
  speak: {
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
