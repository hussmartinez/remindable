import type { ReactNode } from 'react';
import {
  Button as UiButton,
  Dir as UiDir,
  NoFlip,
  Text as UiText,
  useTextScale,
  type ButtonVariant,
} from '@hussmartinez/ui/native';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import type { Lang } from '@/lib/lang';
import { useSpeak } from '@/lib/speech';
import { colors, fontBase, minTap, radius, space } from '@/lib/theme';

/** The text scale from `NativeUiProvider` (set from the user's text-size setting in the root layout). */
export { useTextScale };

type TxtProps = {
  children: ReactNode;
  variant?: keyof typeof fontBase;
  color?: string;
  bold?: boolean;
  center?: boolean;
  style?: StyleProp<TextStyle>;
};

/** ui's `Text`, plus a `huge` size for single big words and numbers, which ui has no token for. */
export function Txt({ children, variant = 'body', color = colors.ink, bold, center, style }: TxtProps) {
  const scale = useTextScale();
  const huge = variant === 'huge' && { fontSize: fontBase.huge * scale, lineHeight: fontBase.huge * scale * 1.2 };
  return (
    <UiText variant={variant === 'huge' ? 'body' : variant} color={color} strong={bold} style={[center && { textAlign: 'center' }, huge, style]}>
      {children}
    </UiText>
  );
}

/** Sets layout direction for a subtree from the language its content is written in. */
export function Dir({ lang, children, style }: { lang: Lang; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <UiDir locale={lang} style={style}>
      {children}
    </UiDir>
  );
}

/**
 * Keeps physical layouts (arrows, maps, grids with fixed positions) unmirrored in RTL.
 * Use Dir instead for content whose order follows reading direction.
 */
export { NoFlip };

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

const VARIANT: Record<ButtonTone, ButtonVariant> = {
  primary: 'primary',
  secondary: 'secondary',
  quiet: 'quiet',
  good: 'success',
  hint: 'hint',
  selected: 'selected',
};

/** ui's large (64 dp) `Button`, with an emoji and an optional second line. */
export function BigButton({ label, onPress, tone = 'primary', icon, sublabel, disabled, style }: ButtonProps) {
  const scale = useTextScale();
  return (
    <UiButton
      variant={VARIANT[tone]}
      size="large"
      accessibilityLabel={sublabel ? `${label}. ${sublabel}` : label}
      disabled={disabled}
      onPress={onPress}
      icon={icon ? <Text style={{ fontSize: 34 * scale }}>{icon}</Text> : undefined}
      style={[styles.button, style]}>
      {sublabel ? (
        <View style={{ flexShrink: 1 }}>
          <UiText strong color={tone === 'primary' ? colors.primaryInk : undefined}>
            {label}
          </UiText>
          <UiText variant="small" color={tone === 'primary' ? colors.primaryInk : colors.inkSoft}>
            {sublabel}
          </UiText>
        </View>
      ) : (
        label
      )}
    </UiButton>
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
    <Text aria-hidden style={{ fontSize: size * Math.min(scale, 1.2), textAlign: 'center' }}>
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
  button: { marginVertical: space.xs },
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
