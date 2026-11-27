import { createNativeTheme } from '@hussmartinez/ui/native';

/**
 * Remindable's calm, high-contrast palette as a `@hussmartinez/ui/native`
 * theme (ADR 0010). Text pairs meet WCAG 2.2 AA (4.5:1) at body size:
 * text/bg 13.9, muted/bg 7.0, on-accent/accent 7.4, hint text 5.5, success text 5.6.
 * Feedback never uses red: a wrong pick is shown in the `hint` tone.
 */
export const remindableTheme = createNativeTheme({
  extends: 'light',
  tokens: {
    'color-bg': '#fbf7f0',
    'color-surface': '#ffffff',
    'color-surface-raised': '#ffffff',
    'color-text': '#1e2a2a',
    'color-text-muted': '#4a5757',
    'color-border': '#e3dccf',
    'color-border-strong': '#1f5f5b',
    'color-control': '#ffffff',
    'color-control-active': '#f1ece2',
    'color-accent': '#1f5f5b',
    'color-accent-hover': '#174a47',
    'color-accent-active': '#174a47',
    'color-on-accent': '#ffffff',
    'color-accent-subtle': '#e0eeec',
    'color-accent-text': '#1f5f5b',
    'color-success': '#2e7d4f',
    'color-success-subtle': '#e1f2e7',
    'color-success-text': '#236b40',
    'color-hint': '#7a5ba6',
    'color-hint-subtle': '#eee7f7',
    'color-hint-text': '#6b4f94',
    'font-size-small': 18,
    'font-size-body': 22,
    'font-size-title': 30,
    'radius-control': 24,
    'radius-surface': 24,
    'control-height-large': 64,
  },
});

const tk = remindableTheme.tokens;

/** Colours by role, from the theme, plus Remindable's amber highlight, which ui has no token for. */
export const colors = {
  bg: tk['color-bg'],
  card: tk['color-surface'],
  ink: tk['color-text'],
  inkSoft: tk['color-text-muted'],
  primary: tk['color-accent'],
  primaryInk: tk['color-on-accent'],
  good: tk['color-success-text'],
  goodSoft: tk['color-success-subtle'],
  // Gentle "try again" tone. Never red.
  hint: tk['color-hint-text'],
  hintSoft: tk['color-hint-subtle'],
  border: tk['color-border'],
  // App highlight (progress, today, badges): not a ui token.
  accent: '#E8A33D',
  accentSoft: '#FCEFD9',
};

export const radius = { md: 16, lg: tk['radius-surface'], pill: 999 };
export const space = { xs: 6, sm: 12, md: 20, lg: 28, xl: 40 };

// Base sizes; multiplied by the user's text-size setting. `huge` has no ui token.
export const fontBase = { body: tk['font-size-body'], title: tk['font-size-title'], huge: 56, small: tk['font-size-small'] };

export const minTap = tk['control-height-large'];
