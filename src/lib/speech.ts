import * as Speech from 'expo-speech';
import { useCallback, useEffect } from 'react';

import { useStore } from '@/state/store';
import { speechLocale, type Lang } from './lang';

export function useSpeak() {
  const profile = useStore((s) => s.settings.profile);
  return useCallback(
    (text: string, lang: Lang) => {
      Speech.stop();
      Speech.speak(text, { language: speechLocale[lang], rate: profile === 'rebuild' ? 0.8 : 0.95 });
    },
    [profile],
  );
}

/** Reads `text` aloud when it changes, if the user turned on automatic reading. */
export function useAutoSpeak(text: string | null, lang: Lang) {
  const autoSpeak = useStore((s) => s.settings.autoSpeak);
  const speak = useSpeak();
  useEffect(() => {
    if (autoSpeak && text) speak(text, lang);
  }, [autoSpeak, text, lang, speak]);
  useEffect(() => () => void Speech.stop(), []);
}
