import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import i18n from '@/i18n';
import { isRTL, type Lang } from '@/lib/lang';
import { colors } from '@/lib/theme';
import { useHydrated, useStore } from '@/state/store';

export default function RootLayout() {
  const hydrated = useHydrated();
  const uiLang = useStore((s) => s.settings.uiLang);
  const onboarded = useStore((s) => s.onboarded);

  useEffect(() => {
    if (!hydrated || !onboarded) return;
    i18n.changeLanguage(uiLang);
  }, [hydrated, onboarded, uiLang]);

  // Re-renders on language change; during onboarding the language is switched directly on i18n.
  const { i18n: inst } = useTranslation();
  const lang = inst.language as Lang;
  const rtl = isRTL(lang);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.dir = rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  }, [rtl, lang]);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {/* Direction is applied by style rather than I18nManager so switching to Arabic needs no app restart. */}
      <View style={{ flex: 1, direction: rtl ? 'rtl' : 'ltr', backgroundColor: colors.bg }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'fade' }} />
      </View>
    </SafeAreaProvider>
  );
}
