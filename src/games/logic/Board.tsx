import { Pressable, Text, View } from 'react-native';

import { NoFlip, useTextScale } from '@/components/ui';
import { colors, radius } from '@/lib/theme';
import { cageLabel, edges, symbol, type Puzzle } from './adapters';

/**
 * The puzzle grid. Grids are physical layouts, so they never mirror in RTL.
 * Mistakes found by "check" get the soft hint tone, never red.
 */

const THICK = 3;
const THIN = 1;
/** Givens sit on a slightly darker paper so they read as "already there" (fruit can't change colour). */
const GIVEN_BG = '#EFE8DA';

type Props = {
  puzzle: Puzzle;
  grid: readonly number[];
  fixed: readonly boolean[];
  selected: number;
  wrong: ReadonlySet<number>;
  /** Square just filled by a hint. */
  flash: number;
  /** Show the picture in its own colour once solved. */
  reveal?: boolean;
  width: number;
  onTap: (i: number) => void;
};

export function Board({ puzzle, grid, fixed, selected, wrong, flash, reveal, width, onTap }: Props) {
  const scale = useTextScale();
  const n = puzzle.n;
  const pic = puzzle.kind === 'picture' ? puzzle.data : null;
  const clueFont = Math.round(Math.min(18 * scale, n >= 8 ? 15 : 18));
  const sideW = pic ? Math.max(...pic.rowClues.map((c) => Math.max(1, c.length))) * clueFont * 1.15 + 10 : 0;
  const topH = pic ? Math.max(...pic.colClues.map((c) => Math.max(1, c.length))) * clueFont * 1.3 + 6 : 0;
  const cell = Math.floor(Math.min((width - sideW - 2 * THICK) / n, 76 * scale));
  const valueFont = Math.round(cell * (puzzle.kind === 'sudoku' && puzzle.data.symbols === 'fruit' ? 0.55 : 0.5));
  const fill = reveal && pic ? pic.picture.color : colors.primary;

  return (
    <NoFlip style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'flex-end' }}>
      {pic && (
        <View style={{ width: sideW, marginBottom: THICK }}>
          {pic.rowClues.map((c, r) => (
            <View key={r} style={{ height: cell, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 6 }}>
              <Text style={{ fontSize: clueFont, color: colors.ink, fontWeight: '600' }}>{c.length ? c.join(' ') : '0'}</Text>
            </View>
          ))}
        </View>
      )}
      <View>
        {pic && (
          <View style={{ flexDirection: 'row', height: topH, marginLeft: THICK }}>
            {pic.colClues.map((c, k) => (
              <View key={k} style={{ width: cell, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 4 }}>
                {(c.length ? c : [0]).map((v, j) => (
                  <Text key={j} style={{ fontSize: clueFont, lineHeight: clueFont * 1.3, color: colors.ink, fontWeight: '600' }}>
                    {v}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}
        <View
          style={{
            width: cell * n + 2 * THICK,
            flexDirection: 'row',
            flexWrap: 'wrap',
            borderWidth: THICK,
            borderColor: colors.ink,
            borderRadius: 6,
            backgroundColor: colors.card,
            overflow: 'hidden',
          }}>
          {grid.map((v, i) => {
            const e = edges(puzzle, i);
            const label = cageLabel(puzzle, i);
            const isWrong = wrong.has(i);
            const bg =
              pic && v === 1
                ? isWrong
                  ? colors.hint
                  : fill
                : isWrong
                  ? colors.hintSoft
                  : i === flash
                    ? colors.goodSoft
                    : i === selected
                      ? colors.accentSoft
                      : fixed[i]
                        ? GIVEN_BG
                        : colors.card;
            const r = Math.floor(i / n);
            const c = i % n;
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={`${r + 1}, ${c + 1}${v ? `: ${pic ? (v === 1 ? '■' : '·') : symbol(puzzle, v)}` : ''}`}
                accessibilityState={{ selected: i === selected, disabled: fixed[i] }}
                onPress={() => onTap(i)}
                style={{
                  width: cell,
                  height: cell,
                  backgroundColor: bg,
                  borderRightWidth: c === n - 1 ? 0 : e.right ? THICK : THIN,
                  borderBottomWidth: r === n - 1 ? 0 : e.bottom ? THICK : THIN,
                  borderColor: e.right || e.bottom ? colors.ink : colors.border,
                  borderRightColor: e.right ? colors.ink : colors.border,
                  borderBottomColor: e.bottom ? colors.ink : colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {(pic ? i === flash : i === selected) && (
                  <View
                    pointerEvents="none"
                    style={{ position: 'absolute', top: 2, left: 2, right: 2, bottom: 2, borderWidth: 3, borderColor: colors.accent, borderRadius: radius.md / 2 }}
                  />
                )}
                {isWrong && (
                  <View
                    pointerEvents="none"
                    style={{ position: 'absolute', top: 2, left: 2, right: 2, bottom: 2, borderWidth: 2, borderColor: colors.hint, borderRadius: radius.md / 2, borderStyle: 'dashed' }}
                  />
                )}
                {label ? (
                  <Text style={{ position: 'absolute', top: 1, left: 3, fontSize: Math.max(12, Math.round(cell * 0.22)), fontWeight: '700', color: colors.inkSoft }}>
                    {label}
                  </Text>
                ) : null}
                {pic ? (
                  v === 2 ? <Text style={{ fontSize: valueFont, color: colors.inkSoft }}>·</Text> : null
                ) : (
                  <Text
                    style={{
                      fontSize: valueFont,
                      marginTop: label ? cell * 0.12 : 0,
                      color: fixed[i] ? colors.ink : colors.primary,
                      fontWeight: fixed[i] ? '700' : '600',
                    }}>
                    {symbol(puzzle, v)}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </NoFlip>
  );
}
