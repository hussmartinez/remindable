import { describe, expect, it } from '@jest/globals';

import {
  backwardAllowed,
  BOARD,
  BOARD_HEIGHT,
  checkTap,
  expectedOrder,
  makeMosaic,
  makeSequence,
  maxSpan,
  mosaicCellsFor,
  mosaicViewFor,
  ROUNDS,
  spanFor,
  TILE,
  timing,
  tipBefore,
  tipFor,
} from '../lightPath';
import { stepStair } from '../patterns';

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

describe('light path board', () => {
  it('has 9 non-overlapping tiles inside the board', () => {
    expect(BOARD).toHaveLength(9);
    for (const [x, y] of BOARD) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x + TILE).toBeLessThanOrEqual(1);
      expect(y + TILE).toBeLessThanOrEqual(BOARD_HEIGHT);
    }
    for (let i = 0; i < BOARD.length; i++)
      for (let j = i + 1; j < BOARD.length; j++) {
        const [a, b] = [BOARD[i], BOARD[j]];
        const apart = Math.abs(a[0] - b[0]) >= TILE + 0.03 || Math.abs(a[1] - b[1]) >= TILE + 0.03;
        expect(apart).toBe(true);
      }
  });
});

describe('light path sequences', () => {
  it('uses distinct tiles of the requested length', () => {
    for (let span = 2; span <= 7; span++) {
      for (let k = 0; k < 50; k++) {
        const s = makeSequence(span);
        expect(s).toHaveLength(span);
        expect(new Set(s).size).toBe(span);
        expect(s.every((t) => t >= 0 && t < 9)).toBe(true);
      }
    }
  });

  it('scores taps forward and backward', () => {
    const seq = [4, 1, 7];
    expect(checkTap(seq, 0, 4)).toBe('next');
    expect(checkTap(seq, 1, 7)).toBe('wrong');
    expect(checkTap(seq, 2, 7)).toBe('done');
    const back = expectedOrder(seq, true);
    expect(back).toEqual([7, 1, 4]);
    expect(seq).toEqual([4, 1, 7]);
    expect(checkTap(back, 0, 4)).toBe('wrong');
  });

  it('grows span with level: Keep Sharp 2→7, Rebuild 2–4 forward only', () => {
    expect(spanFor(1, 'keepSharp')).toBe(2);
    expect(spanFor(10, 'keepSharp')).toBe(7);
    for (const p of ['keepSharp', 'rebuild'] as const) {
      for (let l = 2; l <= 10; l++) expect(spanFor(l, p)).toBeGreaterThanOrEqual(spanFor(l - 1, p));
    }
    for (const l of LEVELS) {
      expect(spanFor(l, 'rebuild')).toBeGreaterThanOrEqual(2);
      expect(spanFor(l, 'rebuild')).toBeLessThanOrEqual(maxSpan('rebuild'));
      expect(backwardAllowed(l, 'rebuild')).toBe(false);
      expect(backwardAllowed(l, 'keepSharp')).toBe(l >= 6);
    }
  });

  it('presents slowly at low levels and never faster for Rebuild', () => {
    expect(timing(1, 'keepSharp').onMs).toBeGreaterThan(timing(10, 'keepSharp').onMs);
    expect(timing(10, 'rebuild').onMs).toBeGreaterThanOrEqual(timing(1, 'keepSharp').onMs);
  });

  it('adjusts span within the session and respects the caps', () => {
    let s = { level: 2, up: 0, down: 0 };
    s = stepStair(stepStair(s, true, 'rebuild', 2, 4), true, 'rebuild', 2, 4);
    expect(s.level).toBe(3);
    s = stepStair(stepStair({ level: 4, up: 1, down: 0 }, true, 'rebuild', 2, 4), true, 'rebuild', 2, 4);
    expect(s.level).toBe(4);
    expect(stepStair({ level: 2, up: 0, down: 0 }, false, 'rebuild', 2, 4).level).toBe(2);
  });
});

describe('light path mosaic', () => {
  it('makes 3–8 distinct cells on a 4×4 grid, growing with level', () => {
    for (const l of LEVELS) {
      const ks = mosaicCellsFor(l, 'keepSharp');
      expect(ks).toBeGreaterThanOrEqual(3);
      expect(ks).toBeLessThanOrEqual(8);
      if (l > 1) expect(ks).toBeGreaterThanOrEqual(mosaicCellsFor(l - 1, 'keepSharp'));
      const m = makeMosaic(ks);
      expect(new Set(m).size).toBe(ks);
      expect(m.every((c) => c >= 0 && c < 16)).toBe(true);
      expect(mosaicCellsFor(l, 'rebuild')).toBeLessThanOrEqual(5);
    }
    expect(mosaicCellsFor(10, 'keepSharp')).toBe(8);
  });

  it('goes from model visible, to brief view, to delay', () => {
    expect(mosaicViewFor(1, 'rebuild')).toBe('visible');
    expect(mosaicViewFor(8, 'rebuild')).toBe('brief');
    expect(mosaicViewFor(1, 'keepSharp')).toBe('brief');
    expect(mosaicViewFor(9, 'keepSharp')).toBe('delay');
    for (const l of LEVELS) expect(mosaicViewFor(l, 'rebuild')).not.toBe('delay');
  });
});

describe('light path session plan', () => {
  it('mixes modes and gives strategy tips every few rounds', () => {
    expect(ROUNDS.filter((r) => r === 'mosaic').length).toBeGreaterThanOrEqual(2);
    const tips = ROUNDS.map((_, i) => i).filter(tipBefore);
    expect(tips.length).toBeGreaterThanOrEqual(2);
    expect(tipFor(1, 'sequence', false)).toBe('shape');
    expect(tipFor(1, 'sequence', true)).toBe('backward');
    expect(tipFor(4, 'sequence', true)).toBe('shape');
    expect(tipFor(4, 'sequence', false)).toBe('say');
    expect(tipFor(7, 'mosaic', false)).toBe('picture');
  });
});
