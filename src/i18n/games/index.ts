import type { Lang } from '@/lib/lang';
import { lightPath } from './lightPath';
import { logic } from './logic';
import { oddOneOut } from './oddOneOut';
import { patternPath } from './patternPath';
import { pillBox } from './pillBox';
import { stepByStep } from './stepByStep';
import { toolkit } from './toolkit';
import { tools } from './tools';

/**
 * Per-feature string tables. Each lives in its own file so features can be
 * worked on independently; keys are namespaced by feature, e.g. `pillBox.title`.
 */
const FEATURES = { lightPath, logic, oddOneOut, patternPath, pillBox, stepByStep, toolkit, tools };

export function featureStrings(lang: Lang): Record<string, object> {
  return Object.fromEntries(Object.entries(FEATURES).map(([k, v]) => [k, v[lang]]));
}
