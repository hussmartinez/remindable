import { describe, expect, it } from '@jest/globals';

import { VECTORS } from '@/dev/conformance';
import { conforms, runConformance } from '../conformance';

describe('learn-sdk conformance vectors', () => {
  for (const doc of VECTORS) {
    it(`${doc.subject} passes`, () => {
      const r = runConformance(doc);
      expect(r.failed).toEqual([]);
      expect(r.passed).toBeGreaterThan(0);
    });
  }

  it('compares numbers within the tolerance only', () => {
    expect(conforms({ a: [1, 2.0000000001] }, { a: [1, 2] }, 1e-9)).toBe(true);
    expect(conforms({ a: 2.1 }, { a: 2 }, 1e-9)).toBe(false);
    expect(conforms({ a: 1, b: 2 }, { a: 1 })).toBe(false);
  });
});
