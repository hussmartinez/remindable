export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function sample<T>(items: readonly T[], n: number): T[] {
  return shuffle(items).slice(0, n);
}

/** `correct` plus `n - 1` distractors from `pool`, shuffled. */
export function choicesWith<T>(correct: T, pool: readonly T[], n: number, same = (a: T, b: T) => a === b): T[] {
  const others = sample(pool.filter((p) => !same(p, correct)), n - 1);
  return shuffle([correct, ...others]);
}
