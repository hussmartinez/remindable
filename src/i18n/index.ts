import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { LANGS, type Lang } from '@/lib/lang';
import { ar } from './ar';
import { en } from './en';
import { es } from './es';
import { featureStrings } from './games';

export function deviceLang(): Lang {
  const code = getLocales()[0]?.languageCode;
  return LANGS.includes(code as Lang) ? (code as Lang) : 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: { ...en, ...featureStrings('en') } },
    es: { translation: { ...es, ...featureStrings('es') } },
    ar: { translation: { ...ar, ...featureStrings('ar') } },
  },
  lng: deviceLang(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

/** Fixed-language translator, for showing content in a practice language other than the UI language. */
export const tIn = (lang: Lang) => i18n.getFixedT(lang);

export default i18n;
