import type { TFunction } from 'i18next';

import type { Hint } from '@/engine/logic/solver';
import { cageClue, symbol, type Puzzle } from './adapters';

/** "1, 2 and 4" in the content language. */
function list(items: string[], t: TFunction): string {
  if (items.length < 2) return items.join('');
  return items.slice(0, -1).join(t('logic.listSep')) + t('logic.listAnd') + items[items.length - 1];
}

/** One short sentence explaining a hint, e.g. "This row already has 1, 2 and 4, so this must be 3." */
export function hintText(p: Puzzle, h: Hint, t: TFunction): string {
  const value = symbol(p, h.value);
  const r = h.reason;
  switch (r.kind) {
    case 'lastInUnit':
      return t(`logic.hintLast_${r.unit}`, { seen: list(r.seen.map((v) => symbol(p, v)), t), value });
    case 'naked':
      return t(r.withBox ? 'logic.hintNakedBox' : 'logic.hintNaked', { seen: list(r.seen.map((v) => symbol(p, v)), t), value });
    case 'hidden':
      return t(`logic.hintHidden_${r.unit}`, { value });
    case 'cageOne':
      return t('logic.hintCageOne', { value });
    case 'cageLast':
      return t(`logic.hintCageLast_${r.op}`, { target: r.target, value });
    case 'cageFit':
      return t('logic.hintCageFit', { clue: cageClue(r.target, r.op), value });
    case 'lineFull':
      return t(`logic.hintLineFull_${h.value === 1 ? 1 : 0}`, { line: t(`logic.${r.line}`) });
    case 'lineEmpty':
      return t('logic.hintLineEmpty', { line: t(`logic.${r.line}`) });
    case 'lineDone':
      return t('logic.hintLineDone', { line: t(`logic.${r.line}`) });
    case 'lineOverlap':
      return t('logic.hintLineOverlap', { line: t(`logic.${r.line}`) });
    case 'lineGap':
      return t('logic.hintLineGap', { line: t(`logic.${r.line}`) });
  }
}
