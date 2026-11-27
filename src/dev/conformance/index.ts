import type { ConformanceDoc } from '@/engine/conformance';
import dueItems from './hm-learn-due-items.json';
import matching from './hm-learn-matching.json';
import scheduling from './hm-learn-scheduling.json';
import source from './source.json';

/** learn-sdk's conformance vectors (Apache-2.0), copied by `scripts/sync-conformance.mjs`. */
export const VECTORS = [scheduling, dueItems, matching] as unknown as ConformanceDoc[];
export const VECTOR_SOURCE = source;
