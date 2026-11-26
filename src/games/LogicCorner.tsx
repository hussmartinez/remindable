import { useEffect, useRef, useState } from 'react';

import { Gap, Txt } from '@/components/ui';
import { tIn } from '@/i18n';
import { colors } from '@/lib/theme';
import { getGameData, useLevel, useStore } from '@/state/store';
import { KINDS, makePuzzle, type Kind, type Puzzle } from './logic/adapters';
import { Play } from './logic/Play';
import type { GameProps } from './types';

/**
 * Logic Corner: small generated deduction puzzles (Mini Sudoku, Number Cages,
 * Picture Grid) after Simon Tatham's Portable Puzzle Collection. Every puzzle
 * is unique and solvable step by step without guessing; hints explain the
 * next step in one sentence. No timers. The type rotates across sessions.
 * Evidence is thin for sudoku as training (docs/EXERCISE-CATALOG.md), so this
 * is offered as an enjoyable reasoning exercise, not a core claim.
 */

/** Hints a solve may use and still count as correct (Rebuild is near-errorless). */
const HINT_ALLOWANCE = { keepSharp: 1, rebuild: 3 };

type Saved = { next: number };

export function LogicCorner({ lang, onDone }: GameProps) {
  const level = useLevel('logic');
  const score = useRef({ correct: 0, total: 0 });
  const profile = useStore((s) => s.settings.profile);

  // Small grids (low levels) are quick, so two fit in ~3 minutes; bigger ones get a session each.
  const [start] = useState(() => getGameData<Saved>('logic', { next: 0 }).next);
  const planFor = (lvl: number): Kind[] => Array.from({ length: lvl <= 4 ? 2 : 1 }, (_, k) => KINDS[(start + k) % KINDS.length]);
  const [plan, setPlan] = useState(() => planFor(level));
  const [index, setIndex] = useState(0);
  const [puzzle, setPuzzle] = useState<Puzzle>(() => makePuzzle(plan[0], level, profile));
  const [builtFor, setBuiltFor] = useState(`${level}-${profile}`);

  // The level can arrive after mount (store hydration); rebuild while still on the first puzzle.
  if (builtFor !== `${level}-${profile}` && index === 0) {
    const fresh = planFor(level);
    setBuiltFor(`${level}-${profile}`);
    setPlan(fresh);
    setPuzzle(makePuzzle(fresh[0], level, profile));
  }

  // Idempotent, so a double-run effect in development does not skip a type.
  useEffect(() => {
    useStore.getState().setGameData('logic', { next: (start + plan.length) % KINDS.length });
  }, [start, plan]);

  const solved = (hints: number) => {
    score.current.total += 1;
    if (hints <= HINT_ALLOWANCE[profile]) score.current.correct += 1;
  };

  const next = () => {
    if (index + 1 >= plan.length) {
      onDone(score.current);
      return;
    }
    const lastPicture = puzzle.kind === 'picture' ? puzzle.data.picture.id : undefined;
    setPuzzle(makePuzzle(plan[index + 1], level, profile, lastPicture));
    setIndex(index + 1);
  };

  return (
    <>
      {plan.length > 1 && (
        <Txt variant="small" center color={colors.inkSoft}>
          {tIn(lang)('logic.puzzleOf', { n: index + 1, total: plan.length })}
        </Txt>
      )}
      <Gap size={8} />
      <Play key={`${index}-${builtFor}`} puzzle={puzzle} lang={lang} last={index + 1 >= plan.length} onSolved={solved} onNext={next} />
    </>
  );
}
