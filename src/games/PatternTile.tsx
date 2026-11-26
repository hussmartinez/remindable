import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { EMOJI, type ColorKey, type Tile, type TileKind } from '@/engine/patterns';
import { colors } from '@/lib/theme';

/** Pattern Path tile colours: distinct in hue and lightness, none of them red. */
export const TILE_COLORS: Record<ColorKey, string> = {
  blue: '#2F6DB5',
  orange: '#E07A1F',
  green: '#2E8B57',
  purple: '#8A4FC0',
};

const SIZE_FACTOR = [0.42, 0.68, 0.94];

/** Dice-face positions on a 3×3 grid, so counts up to 9 can be seen at a glance (subitizing). */
const DICE: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
  7: [0, 2, 3, 4, 5, 6, 8],
  8: [0, 1, 2, 3, 5, 6, 7, 8],
  9: [0, 1, 2, 3, 4, 5, 6, 7, 8],
};

/** Draws one tile with plain Views (no SVG): shapes, dice-style dots or an emoji object. */
export function PatternTile({ tile, kind, box }: { tile: Tile; kind: TileKind; box: number }) {
  const s = box * SIZE_FACTOR[tile.size];
  const fill = TILE_COLORS[tile.color];
  let body: ReactNode;

  if (kind === 'emoji') {
    body = <Text style={{ fontSize: s * 0.8, lineHeight: s, textAlign: 'center' }}>{tile.emoji ? EMOJI[tile.emoji] : ''}</Text>;
  } else if (kind === 'dots') {
    const card = box * 0.94;
    const cell = (card - 4) / 3;
    const dot = cell * 0.62;
    body = (
      <View style={{ width: card, height: card, borderRadius: card * 0.16, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, direction: 'ltr' }}>
        {(DICE[tile.dots] ?? []).map((p) => (
          <View
            key={p}
            style={{
              position: 'absolute',
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              backgroundColor: fill,
              left: (p % 3) * cell + (cell - dot) / 2,
              top: Math.floor(p / 3) * cell + (cell - dot) / 2,
            }}
          />
        ))}
      </View>
    );
  } else if (tile.shape === 'circle') {
    body = <View style={{ width: s, height: s, borderRadius: s / 2, backgroundColor: fill }} />;
  } else if (tile.shape === 'square') {
    body = <View style={{ width: s * 0.86, height: s * 0.86, borderRadius: s * 0.08, backgroundColor: fill }} />;
  } else if (tile.shape === 'diamond') {
    body = <View style={{ width: s * 0.68, height: s * 0.68, backgroundColor: fill, transform: [{ rotate: '45deg' }] }} />;
  } else {
    body = (
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: s / 2,
          borderRightWidth: s / 2,
          borderBottomWidth: s * 0.88,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: fill,
        }}
      />
    );
  }

  return <View style={{ width: box, height: box, alignItems: 'center', justifyContent: 'center' }}>{body}</View>;
}
