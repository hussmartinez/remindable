import { describe, expect, it } from '@jest/globals';

import { toolkit as strings } from '@/i18n/games/toolkit';
import {
  EMPTY_TOOLKIT,
  LESSON_ORDER,
  MIX_TOOLS,
  ROOMS,
  chunk,
  digitCount,
  getCurrentTool,
  listLength,
  makeDigits,
  makeList,
  nextLesson,
  recordLesson,
  scoreDigits,
  scoreRecall,
  type LessonRecord,
  type ToolkitData,
} from '../toolkit';
import type { Profile } from '../adaptive';

const done = (data: ToolkitData, profile: Profile): ToolkitData => {
  const { lesson, tool } = nextLesson(data, profile);
  const rec: LessonRecord = { lesson, tool, profile, day: '2026-10-24', predicted: 3, correct: 4, total: 5, helped: true };
  return recordLesson(data, rec);
};

describe('strategy progression', () => {
  it('follows the Keep Sharp order, then keeps mixing tools in rotation', () => {
    let data = EMPTY_TOOLKIT;
    const lessons: string[] = [];
    const tools: string[] = [];
    for (let i = 0; i < 9; i++) {
      const next = nextLesson(data, 'keepSharp');
      lessons.push(next.lesson);
      tools.push(next.tool);
      data = done(data, 'keepSharp');
    }
    expect(lessons.slice(0, 5)).toEqual(['chunking', 'visualise', 'story', 'palace', 'mix']);
    expect(lessons.slice(5)).toEqual(['mix', 'mix', 'mix', 'mix']);
    expect(tools.slice(4)).toEqual([...MIX_TOOLS, MIX_TOOLS[0]]);
  });

  it('starts Rebuild with external aids and cycles its own order', () => {
    let data = EMPTY_TOOLKIT;
    const lessons: string[] = [];
    for (let i = 0; i < 6; i++) {
      lessons.push(nextLesson(data, 'rebuild').lesson);
      data = done(data, 'rebuild');
    }
    expect(lessons).toEqual([...LESSON_ORDER.rebuild, ...LESSON_ORDER.rebuild.slice(0, 2)]);
  });

  it('keeps profiles apart and stores predictions against results', () => {
    let data = done(EMPTY_TOOLKIT, 'keepSharp');
    data = done(data, 'rebuild');
    expect(data.next).toEqual({ keepSharp: 1, rebuild: 1 });
    expect(data.history[0]).toMatchObject({ lesson: 'chunking', predicted: 3, correct: 4, total: 5, helped: true });
    expect(nextLesson(data, 'keepSharp').lesson).toBe('visualise');
  });
});

describe('getCurrentTool', () => {
  it('is null before any lesson', () => {
    expect(getCurrentTool(undefined)).toBeNull();
    expect(getCurrentTool(EMPTY_TOOLKIT)).toBeNull();
  });

  it('returns the most recently taught tool, per profile if asked', () => {
    let data = done(EMPTY_TOOLKIT, 'keepSharp');
    data = done(data, 'keepSharp');
    expect(getCurrentTool(data)).toBe('visualise');
    data = done(data, 'rebuild');
    expect(getCurrentTool(data)).toBe('writeDown');
    expect(getCurrentTool(data, 'keepSharp')).toBe('visualise');
  });

  it('returns the practised tool for a mix lesson', () => {
    let data = EMPTY_TOOLKIT;
    for (let i = 0; i < 5; i++) data = done(data, 'keepSharp');
    expect(data.history[4].lesson).toBe('mix');
    expect(getCurrentTool(data)).toBe(MIX_TOOLS[0]);
  });
});

describe('try-it material', () => {
  it('list length grows with level and stays in 3–8', () => {
    for (const profile of ['keepSharp', 'rebuild'] as Profile[]) {
      let prev = 0;
      for (let l = 1; l <= 10; l++) {
        const n = listLength(l, profile, 'visualise');
        expect(n).toBeGreaterThanOrEqual(prev);
        expect(n).toBeGreaterThanOrEqual(3);
        expect(n).toBeLessThanOrEqual(8);
        expect(listLength(l, profile, 'palace')).toBeLessThanOrEqual(ROOMS.length);
        prev = n;
      }
      expect(digitCount(10, profile)).toBeGreaterThan(digitCount(1, profile));
      expect(digitCount(10, profile)).toBeLessThanOrEqual(8);
    }
    expect(listLength(1, 'rebuild', 'story')).toBe(3);
  });

  it('mixes every target with as many foils, all distinct', () => {
    for (let i = 0; i < 100; i++) {
      const { targets, grid } = makeList(8, i % 2 ? 'writeDown' : 'palace');
      const ids = grid.map((c) => c.id);
      expect(grid).toHaveLength(16);
      expect(new Set(ids).size).toBe(16);
      expect(new Set(grid.map((c) => c.emoji)).size).toBe(16);
      targets.forEach((tg) => expect(ids).toContain(tg.id));
    }
  });

  it('makes digit pairs that read as two-digit numbers', () => {
    for (let i = 0; i < 200; i++) {
      const d = makeDigits(8);
      expect(d).toHaveLength(8);
      chunk(d).forEach((c) => {
        expect(c).toHaveLength(2);
        expect(c[0]).not.toBe('0');
      });
      for (let k = 1; k < d.length; k++) expect(d[k]).not.toBe(d[k - 1]);
    }
    expect(chunk([6, 1, 8, 4, 2, 9])).toEqual(['61', '84', '29']);
  });

  it('scores recall so that tapping everything does not pay', () => {
    expect(scoreRecall(['a', 'b', 'c'], ['a', 'b'])).toMatchObject({ correct: 2, total: 3 });
    expect(scoreRecall(['a', 'b'], ['a', 'b', 'x', 'y'])).toMatchObject({ correct: 0, hits: 2, falseAlarms: 2 });
    expect(scoreDigits([6, 1, 8, 4], [6, 1, 4, 8])).toEqual({ correct: 2, total: 4 });
  });
});

describe('strings', () => {
  const keys = (o: object, prefix = ''): string[] =>
    Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));

  it('has the same keys in every language, with every tool and room named', () => {
    const en = keys(strings.en).sort();
    expect(keys(strings.es).sort()).toEqual(en);
    expect(keys(strings.ar).sort()).toEqual(en);
    for (const id of [...LESSON_ORDER.keepSharp, ...LESSON_ORDER.rebuild]) expect(en).toContain(`name.${id}`);
    for (const r of ROOMS) expect(en).toContain(`palace.rooms.${r.id}`);
  });
});
