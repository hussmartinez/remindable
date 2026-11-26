import * as Speech from 'expo-speech';
import type { ExpoSpeechRecognitionModule as ModuleType, ExpoSpeechRecognitionOptions } from 'expo-speech-recognition';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { speechLocale, type Lang } from './lang';

/**
 * Speech-to-text through `expo-speech-recognition`: the platform recogniser
 * on iOS/Android (needs a development build, not Expo Go) and the Web Speech
 * API in the browser. Everything degrades to `available = false`, and the
 * features using it keep their tap-based flow.
 *
 * Privacy: on-device recognition is requested whenever the device supports it.
 * `onDevice` tells the UI whether that is actually the case, so it never claims
 * more privacy than it gives (Chrome on the web, for one, sends audio to Google).
 */

type Module = typeof ModuleType;

let cached: Module | null | undefined;

/** The native module throws on import where it is not compiled in (Expo Go), so load it lazily. */
function loadModule(): Module | null {
  if (cached !== undefined) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = (require('expo-speech-recognition') as { ExpoSpeechRecognitionModule: Module }).ExpoSpeechRecognitionModule;
  } catch {
    cached = null;
  }
  return cached;
}

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/** True when a recogniser exists on this device or browser (permission not yet asked). */
export function recognitionSupported(): boolean {
  const m = loadModule();
  return !!m && safe(() => m.isRecognitionAvailable(), false);
}

export type RecognizerOptions = {
  lang: Lang;
  /** Keep listening across pauses (conversation). Restarts itself if the platform stops. */
  continuous?: boolean;
  /** Words to bias recognition towards, e.g. the target word and the options on screen. */
  contextualStrings?: string[];
  /** Every final result, with the recogniser's alternatives (best first). */
  onFinal?: (alternatives: string[]) => void;
  onError?: (error: RecognizerError) => void;
};

export type RecognizerError = 'not-allowed' | 'no-speech' | 'network' | 'unavailable' | 'other';

export type Recognizer = {
  available: boolean;
  listening: boolean;
  /** Whether audio is being processed on the device only. */
  onDevice: boolean;
  start: () => Promise<void>;
  stop: () => void;
  /** Final text: the last result, or everything since start() when continuous. */
  transcript: string;
  /** Words being recognised right now, not final yet. */
  interim: string;
  error: RecognizerError | null;
};

const MAX_QUICK_RESTARTS = 4;

export function useRecognizer(options: RecognizerOptions): Recognizer {
  const [available, setAvailable] = useState(recognitionSupported);
  const [listening, setListening] = useState(false);
  const [onDevice, setOnDevice] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<RecognizerError | null>(null);

  const opts = useRef(options);
  const owner = useRef(false); // this hook started the current session (the module is a global singleton)
  const wanted = useRef(false); // the user still wants to listen
  const preferOnDevice = useRef(true);
  const retryPending = useRef(false);
  const restarts = useRef({ count: 0, at: 0 });

  useEffect(() => {
    opts.current = options;
  });

  const report = useCallback((e: RecognizerError) => {
    setError(e);
    opts.current.onError?.(e);
  }, []);

  const begin = useCallback(() => {
    const m = loadModule();
    if (!m) return;
    const o = opts.current;
    const device = Platform.OS !== 'web' && preferOnDevice.current && safe(() => m.supportsOnDeviceRecognition(), false);
    setOnDevice(device);
    const config: ExpoSpeechRecognitionOptions = {
      lang: speechLocale[o.lang],
      interimResults: true,
      continuous: !!o.continuous,
      maxAlternatives: o.continuous ? 1 : 5,
      requiresOnDeviceRecognition: device,
      addsPunctuation: device,
      contextualStrings: o.contextualStrings,
      iosTaskHint: o.continuous ? 'dictation' : 'search',
    };
    try {
      m.start(config);
    } catch {
      wanted.current = false;
      setAvailable(false);
      setError('unavailable');
    }
  }, []);

  useEffect(() => {
    const m = loadModule();
    if (!m) return;
    if (Platform.OS !== 'web') {
      m.getPermissionsAsync()
        .then((p) => !p.granted && !p.canAskAgain && setAvailable(false))
        .catch(() => setAvailable(false));
    }

    const subs = [
      m.addListener('start', () => owner.current && setListening(true)),
      m.addListener('end', () => {
        if (!owner.current) return;
        setListening(false);
        setInterim('');
        if (retryPending.current && wanted.current) {
          retryPending.current = false;
          begin();
          return;
        }
        if (!wanted.current || !opts.current.continuous) {
          wanted.current = false;
          owner.current = false;
          return;
        }
        // Platforms end continuous sessions after silence or a time limit; carry on, but not in a tight loop.
        const now = Date.now();
        const r = restarts.current;
        r.count = now - r.at < 3000 ? r.count + 1 : 0;
        r.at = now;
        if (r.count < MAX_QUICK_RESTARTS) begin();
        else wanted.current = false;
      }),
      m.addListener('result', (e) => {
        if (!owner.current) return;
        const texts = e.results.map((r) => r.transcript.trim()).filter(Boolean);
        if (!e.isFinal) {
          setInterim(texts[0] ?? '');
          return;
        }
        setInterim('');
        if (!texts.length) return;
        setTranscript((prev) => (opts.current.continuous && prev ? `${prev} ${texts[0]}` : texts[0]));
        opts.current.onFinal?.(texts);
      }),
      m.addListener('error', (e) => {
        if (!owner.current || e.error === 'aborted') return;
        if (e.error === 'language-not-supported' && preferOnDevice.current && Platform.OS !== 'web') {
          // The on-device model for this language is not installed: fall back to the platform service.
          preferOnDevice.current = false;
          retryPending.current = true;
          return;
        }
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'language-not-supported') {
          wanted.current = false;
          setAvailable(false);
          report(e.error === 'not-allowed' ? 'not-allowed' : 'unavailable');
          return;
        }
        if (e.error === 'no-speech' || e.error === 'speech-timeout') {
          if (!opts.current.continuous) report('no-speech');
          return;
        }
        if (e.error === 'network') wanted.current = false;
        report(e.error === 'network' ? 'network' : 'other');
      }),
      m.addListener('nomatch', () => owner.current && !opts.current.continuous && report('no-speech')),
    ];

    return () => {
      subs.forEach((s) => s.remove());
      if (owner.current) {
        wanted.current = false;
        owner.current = false;
        safe(() => m.abort(), undefined);
      }
    };
  }, [begin, report]);

  const start = useCallback(async () => {
    const m = loadModule();
    if (!m) return;
    Speech.stop(); // don't transcribe our own voice
    setError(null);
    setInterim('');
    setTranscript('');
    if (Platform.OS !== 'web') {
      const p = await m.requestPermissionsAsync().catch(() => null);
      if (!p?.granted) {
        setAvailable(false);
        setError('not-allowed');
        return;
      }
    }
    owner.current = true;
    wanted.current = true;
    restarts.current = { count: 0, at: 0 };
    begin();
  }, [begin]);

  const stop = useCallback(() => {
    wanted.current = false;
    const m = loadModule();
    if (m && owner.current) safe(() => m.stop(), undefined);
  }, []);

  return { available, listening, onDevice, start, stop, transcript, interim, error };
}
