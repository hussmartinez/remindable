import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { START_DISPLAY_MS, type Profile } from '@/engine/adaptive';
import { dayKey } from '@/engine/dates';
import type { VaultCard } from '@/engine/srs';
import { migrateState } from './migrations';
import type { VaultItem } from '@/content/vault';
import type { GameId } from '@/games/catalog';
import type { Lang } from '@/lib/lang';

export type Settings = {
  uiLang: Lang;
  trainLangs: Lang[];
  profile: Profile;
  textScale: number;
  autoSpeak: boolean;
};

type State = {
  onboarded: boolean;
  settings: Settings;
  startedOn: string | null;
  sessionDays: string[];
  /** Adaptive level per game id (1–10). Missing means level 1. */
  levels: Record<string, number>;
  /** Free-form persisted state owned by individual games/tools, keyed by their id. */
  gameData: Record<string, unknown>;
  /** Games played in previous sessions, newest first (for rotation). */
  recentGames: GameId[][];
  quickEyeMs: number;
  vaultItems: Record<string, VaultItem>;
  vaultCards: Record<string, VaultCard>;
  recentStories: string[];

  completeOnboarding: (s: Settings) => void;
  updateSettings: (s: Partial<Settings>) => void;
  setLevel: (game: string, level: number) => void;
  setGameData: (key: string, data: unknown) => void;
  setQuickEyeMs: (ms: number) => void;
  saveVault: (items: VaultItem[], cards: VaultCard[]) => void;
  markStory: (id: string) => void;
  finishSession: (games: GameId[]) => void;
  resetProgress: () => void;
};

const defaultSettings: Settings = {
  uiLang: 'es',
  trainLangs: ['es'],
  profile: 'keepSharp',
  textScale: 1,
  autoSpeak: true,
};

const freshProgress = (profile: Profile) => ({
  startedOn: null,
  sessionDays: [] as string[],
  levels: {} as Record<string, number>,
  gameData: {} as Record<string, unknown>,
  recentGames: [] as GameId[][],
  quickEyeMs: START_DISPLAY_MS[profile],
  vaultItems: {} as Record<string, VaultItem>,
  vaultCards: {} as Record<string, VaultCard>,
  recentStories: [] as string[],
});

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      onboarded: false,
      settings: defaultSettings,
      ...freshProgress(defaultSettings.profile),

      completeOnboarding: (settings) =>
        set({ onboarded: true, settings, quickEyeMs: START_DISPLAY_MS[settings.profile] }),

      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

      setLevel: (game, level) => set({ levels: { ...get().levels, [game]: level } }),

      setGameData: (key, data) => set({ gameData: { ...get().gameData, [key]: data } }),

      setQuickEyeMs: (ms) => set({ quickEyeMs: ms }),

      saveVault: (items, cards) => {
        const vaultItems = { ...get().vaultItems };
        const vaultCards = { ...get().vaultCards };
        for (const item of items) vaultItems[item.id] = item;
        for (const c of cards) vaultCards[c.card.itemId] = c;
        set({ vaultItems, vaultCards });
      },

      markStory: (id) => set({ recentStories: [id, ...get().recentStories.filter((s) => s !== id)].slice(0, 4) }),

      finishSession: (games) => {
        const today = dayKey();
        const { sessionDays, startedOn, recentGames } = get();
        set({
          startedOn: startedOn ?? today,
          sessionDays: sessionDays.includes(today) ? sessionDays : [...sessionDays, today],
          recentGames: [games, ...recentGames].slice(0, 10),
        });
      },

      resetProgress: () => set(freshProgress(get().settings.profile)),
    }),
    {
      name: 'remindable',
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
      migrate: (persisted, version) => migrateState(persisted as Record<string, unknown>, version) as unknown as State,
    },
  ),
);

/** True once persisted state has loaded; avoids flashing onboarding on startup. */
export function useHydrated() {
  return useSyncExternalStore(
    (onChange) => useStore.persist.onFinishHydration(onChange),
    () => useStore.persist.hasHydrated(),
    () => false,
  );
}

/** Current adaptive level (1–10) for a game. */
export function useLevel(game: string): number {
  return useStore((s) => s.levels[game] ?? 1);
}

/** Read a game's persisted data, or `fallback` if it has none yet. Write with `setGameData`. */
export function getGameData<T>(key: string, fallback: T): T {
  return (useStore.getState().gameData[key] as T | undefined) ?? fallback;
}
