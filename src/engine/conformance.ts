import {
  arabicProfile,
  createFsrsScheduler,
  dueItems,
  englishProfile,
  matchTolerantly,
  normalizeForGrading,
  parseProgress,
  spanishProfile,
  type LanguageProfile,
  type Rating,
  type SchedulingState,
} from '@hussmartinez/learn-sdk';

/**
 * Runs learn-sdk's conformance vectors (scheduling, due items, matching) with
 * the SDK as Remindable bundles it. Jest runs them in Node; the dev screen
 * `/dev/conformance` runs them on a phone, where the code runs on Hermes
 * (sdk-core ADR 0069 asks for that check). The rules follow learn-sdk's
 * `docs/formats/conformance.md`.
 */

type Case = { name: string; input: unknown; expected: unknown; tolerance?: number };
export type ConformanceDoc = { subject: string; cases: Case[] };
export type SubjectResult = { subject: string; passed: number; skipped: number; failed: { name: string; detail: string }[] };

const PROFILES: Record<string, LanguageProfile> = { es: spanishProfile, en: englishProfile, ar: arabicProfile };

function profileOf(name: unknown): LanguageProfile | undefined {
  if (name === undefined) return undefined;
  const p = PROFILES[name as string];
  if (!p) throw new Error(`unknown profile ${String(name)}`);
  return p;
}

type ScheduleInput = {
  scheduler: 'fsrs' | 'fake';
  options?: { desiredRetention?: number; weights?: readonly number[] };
  reviews: { rating: Rating; at: number }[];
  start?: number;
  state?: SchedulingState;
};

const RUNNERS: Record<string, (input: never) => unknown> = {
  'hm-learn-scheduling': (input: ScheduleInput) => {
    const scheduler = createFsrsScheduler(input.options);
    const states = input.start !== undefined ? [scheduler.initial(input.start)] : [];
    let state = input.state ?? states[0].state;
    for (const { rating, at } of input.reviews) {
      const next = scheduler.review(state, rating, at);
      states.push(next);
      state = next.state;
    }
    return states;
  },
  'hm-learn-due-items': (input: { progress: unknown; now: number; limit?: number }) =>
    dueItems(parseProgress(input.progress), input.now, input.limit === undefined ? {} : { limit: input.limit }).map((c) => c.itemId),
  'hm-learn-matching': (input: {
    profile?: string;
    normalize?: string;
    given?: string | string[];
    accepted?: string[];
    others?: string[];
    maxDistance?: number;
  }) => {
    const profile = profileOf(input.profile);
    if (input.normalize !== undefined) return normalizeForGrading(input.normalize, profile as LanguageProfile);
    return matchTolerantly(input.given as string[], input.accepted as string[], {
      ...(profile ? { profile } : {}),
      ...(input.others ? { others: input.others } : {}),
      ...(input.maxDistance === undefined ? {} : { maxDistance: input.maxDistance }),
    });
  },
};

/** JSON equality, with numbers compared within `tolerance`. */
export function conforms(actual: unknown, expected: unknown, tolerance = 0): boolean {
  if (typeof expected === 'number' && typeof actual === 'number') return Math.abs(actual - expected) <= tolerance;
  if (Array.isArray(expected)) {
    return Array.isArray(actual) && actual.length === expected.length && expected.every((e, i) => conforms(actual[i], e, tolerance));
  }
  if (expected && typeof expected === 'object') {
    if (!actual || typeof actual !== 'object' || Array.isArray(actual)) return false;
    const a = actual as Record<string, unknown>;
    const e = expected as Record<string, unknown>;
    const keys = new Set([...Object.keys(a), ...Object.keys(e)].filter((k) => a[k] !== undefined || e[k] !== undefined));
    return [...keys].every((k) => conforms(a[k], e[k], tolerance));
  }
  return actual === expected;
}

export function runConformance(doc: ConformanceDoc): SubjectResult {
  const run = RUNNERS[doc.subject];
  const result: SubjectResult = { subject: doc.subject, passed: 0, skipped: 0, failed: [] };
  if (!run) throw new Error(`no runner for ${doc.subject}`);
  for (const c of doc.cases) {
    // The fake scheduler lives in learn-sdk/testing, which apps don't bundle.
    if ((c.input as { scheduler?: string }).scheduler === 'fake') {
      result.skipped += 1;
      continue;
    }
    const expectedError = (c.expected as { error?: { code: string; reason?: string } } | null)?.error;
    try {
      // Round-trip through JSON, as a port would read the result.
      const actual = JSON.parse(JSON.stringify(run(c.input as never)));
      if (expectedError) result.failed.push({ name: c.name, detail: `expected ${expectedError.code}, got a result` });
      else if (conforms(actual, c.expected, c.tolerance ?? 0)) result.passed += 1;
      else result.failed.push({ name: c.name, detail: `got ${JSON.stringify(actual).slice(0, 200)}` });
    } catch (err) {
      const e = err as { code?: string; details?: { reason?: string }; message?: string };
      const ok = expectedError && e.code === expectedError.code && (!expectedError.reason || e.details?.reason === expectedError.reason);
      if (ok) result.passed += 1;
      else result.failed.push({ name: c.name, detail: `threw ${e.code ?? ''} ${e.message ?? ''}`.trim() });
    }
  }
  return result;
}
