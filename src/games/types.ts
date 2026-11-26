import type { GameResult } from '@/engine/session';
import type { Lang } from '@/lib/lang';

export type GameProps = {
  /** Language the exercise content is shown in (rotates across practice languages). */
  lang: Lang;
  onDone: (result: GameResult) => void;
};
