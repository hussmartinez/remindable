export type Lang = 'es' | 'en' | 'ar';

export const LANGS: Lang[] = ['es', 'en', 'ar'];

export const LANG_NAMES: Record<Lang, string> = {
  es: 'Español',
  en: 'English',
  ar: 'العربية',
};

export const isRTL = (lang: Lang) => lang === 'ar';

export const speechLocale: Record<Lang, string> = {
  es: 'es-ES',
  en: 'en-US',
  ar: 'ar-SA',
};

/** A string available in every supported language. */
export type Localized = Record<Lang, string>;
