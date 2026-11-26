import type { ComponentType } from 'react';

import type { GameId } from './catalog';
import { LightPath } from './LightPath';
import { LogicCorner } from './LogicCorner';
import { MemoryToolkit } from './MemoryToolkit';
import { OddOneOut } from './OddOneOut';
import { PatternPath } from './PatternPath';
import { PillBox } from './PillBox';
import { QuickEye } from './QuickEye';
import { StepByStep } from './StepByStep';
import { StoryThread } from './StoryThread';
import type { GameProps } from './types';
import { WordGarden } from './WordGarden';

export const GAME_COMPONENTS: Record<GameId, ComponentType<GameProps>> = {
  wordGarden: WordGarden,
  quickEye: QuickEye,
  story: StoryThread,
  patternPath: PatternPath,
  lightPath: LightPath,
  pillBox: PillBox,
  stepByStep: StepByStep,
  oddOneOut: OddOneOut,
  toolkit: MemoryToolkit,
  logic: LogicCorner,
};
