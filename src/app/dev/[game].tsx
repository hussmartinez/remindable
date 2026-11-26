import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { BigButton, Gap, Screen, Txt } from '@/components/ui';
import type { Profile } from '@/engine/adaptive';
import { GAMES, type GameId } from '@/games/catalog';
import { GAME_COMPONENTS } from '@/games/registry';
import i18n from '@/i18n';
import { LANGS, type Lang } from '@/lib/lang';
import { useStore } from '@/state/store';

/**
 * Development harness: /dev/<gameId>?lang=es&ui=en&profile=rebuild&level=3
 * Renders one game on its own, for building and screenshot testing.
 */
export default function DevGame() {
  const params = useLocalSearchParams<{ game: string; lang?: string; ui?: string; profile?: string; level?: string }>();
  const id = params.game as GameId;
  const lang = (LANGS.includes(params.lang as Lang) ? params.lang : 'en') as Lang;
  const ui = (LANGS.includes(params.ui as Lang) ? params.ui : lang) as Lang;
  const [result, setResult] = useState<string | null>(null);
  const [run, setRun] = useState(0);
  // Games read settings when they mount, so apply the URL's settings before the first render.
  useState(() => {
    const s = useStore.getState();
    s.updateSettings({
      uiLang: ui,
      trainLangs: [lang, ...LANGS.filter((l) => l !== lang)].slice(0, 2),
      profile: (params.profile === 'rebuild' ? 'rebuild' : 'keepSharp') as Profile,
      autoSpeak: false,
    });
    if (params.level) s.setLevel(id, Number(params.level));
    i18n.changeLanguage(ui);
    return true;
  });

  if (!GAMES[id]) {
    return (
      <Screen>
        <Txt>Unknown game: {id}</Txt>
      </Screen>
    );
  }
  const Game = GAME_COMPONENTS[id];

  return (
    <Screen>
      {result ? (
        <>
          <Txt variant="title" center>
            DONE {result}
          </Txt>
          <Gap />
          <BigButton
            label="Again"
            onPress={() => {
              setResult(null);
              setRun(run + 1);
            }}
          />
        </>
      ) : (
        <Game key={run} lang={lang} onDone={(r) => setResult(`${r.correct}/${r.total}`)} />
      )}
    </Screen>
  );
}
