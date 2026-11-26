import {
  CONCEPTS,
  SUB_PARENT,
  TAG_KIND,
  conceptById,
  type CategoryId,
  type Concept,
  type GroupTag,
  type RelationType,
  type SubTag,
} from '@/content/concepts';
import type { Lang, Localized } from '@/lib/lang';
import type { Profile } from './adaptive';
import { pick, sample, shuffle } from './random';

/**
 * Odd One Out & Links (docs/EXERCISE-CATALOG.md §2.3).
 * Mode A: n picture cards, exactly one does not share the group.
 * Mode B: picture analogies built only from relations written in concepts.ts.
 */

/** Grouping difficulty, easiest first: perceptual, taxonomic, subcategory, thematic, abstract. */
export type Kind = 'colour' | 'taxo' | 'sub' | 'theme' | 'abstract';
export const KIND_ORDER: Kind[] = ['colour', 'taxo', 'sub', 'theme', 'abstract'];

/** A group label: a CategoryId (taxonomic) or a GroupTag. Also the i18n key under `oddOneOut.g`. */
export type Group = CategoryId | GroupTag;

/** Categories that read naturally as "these are all X". `object`, `nature` and `place` are too loose. */
const TAXO_GROUPS: CategoryId[] = ['fruit', 'food', 'animal', 'tool', 'clothing', 'vehicle', 'music', 'body'];
/** Can name the odd card ("the spoon is a household object") but is too loose to be a group. */
const TAXO_ODD_ONLY: CategoryId[] = ['home'];
/** Category pairs that overlap in everyday speech; never contrasted with each other. */
const CLOSE: [CategoryId, CategoryId][] = [
  ['fruit', 'food'],
  ['tool', 'home'],
];

const isClose = (a: CategoryId, b: CategoryId) => a === b || CLOSE.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
const atypical = (c: Concept) => !!c.tags?.includes('atypical');

export function kindOf(g: Group): Kind {
  return g in TAG_KIND ? TAG_KIND[g as GroupTag] : 'taxo';
}

/** Every group a concept clearly belongs to, including its category. */
export function groupsOf(c: Concept): Group[] {
  return [c.cat, ...((c.tags ?? []).filter((t) => t !== 'atypical') as GroupTag[])];
}

/** Clear groups plus borderline ones: anything a reasonable person could say it belongs to. */
function looseGroupsOf(c: Concept): Group[] {
  return [...groupsOf(c), ...(c.borderline ?? [])];
}

export type OddItem = {
  mode: 'odd';
  kind: Kind;
  group: Group;
  cards: Concept[];
  oddId: string;
  /** The group that names the odd card in the feedback ("the hammer is a tool"). */
  contrast: Group;
};

export type AnalogyItem = {
  mode: 'analogy';
  type: RelationType;
  a1: Concept;
  b1: Concept;
  a2: Concept;
  answerId: string;
  options: Concept[];
  why: [Localized, Localized];
};

export type Item = OddItem | AnalogyItem;

/**
 * True if some other card could also be "the odd one": a group (clear or
 * borderline) that exactly n − 1 cards share, and that includes the intended odd card.
 */
export function isAmbiguous(cards: Concept[], oddId: string): boolean {
  const groups = new Set(cards.flatMap(looseGroupsOf));
  for (const g of groups) {
    const holders = cards.filter((c) => looseGroupsOf(c).includes(g));
    if (holders.length === cards.length - 1 && holders.some((h) => h.id === oddId)) return true;
  }
  return false;
}

/** A group the odd card has and no member has even loosely, used to explain the answer. */
export function contrastFor(odd: Concept, members: Concept[], kind: Kind): Group | null {
  const taken = new Set(members.flatMap(looseGroupsOf));
  const free = groupsOf(odd).filter((g) => !taken.has(g));
  const catOk = !atypical(odd) && [...TAXO_GROUPS, ...TAXO_ODD_ONLY].includes(odd.cat) && free.includes(odd.cat);
  if (kind === 'taxo') return catOk ? odd.cat : null;
  const sameKind = free.find((g) => g !== odd.cat && kindOf(g) === kind);
  if (sameKind) return sameKind;
  if (kind === 'theme' || kind === 'abstract') return catOk ? odd.cat : null;
  return null;
}

type OddOptions = { tiers?: Concept['tier'][]; pool?: Concept[] };

function membersOf(g: Group, kind: Kind, pool: Concept[]): Concept[] {
  return pool.filter((c) => groupsOf(c).includes(g) && !(kind === 'taxo' && atypical(c)));
}

function oddCandidates(g: Group, kind: Kind, pool: Concept[]): Concept[] {
  return pool.filter((c) => {
    if (looseGroupsOf(c).includes(g)) return false;
    if (kind === 'colour') return groupsOf(c).some((x) => kindOf(x) === 'colour');
    if (kind === 'taxo') return !atypical(c) && [...TAXO_GROUPS, ...TAXO_ODD_ONLY].includes(c.cat) && !isClose(c.cat, g as CategoryId);
    if (kind === 'sub') return c.cat === SUB_PARENT[g as SubTag] && groupsOf(c).some((x) => x !== g && kindOf(x) === 'sub');
    return true;
  });
}

export function groupsForKind(kind: Kind): Group[] {
  if (kind === 'taxo') return TAXO_GROUPS;
  return (Object.keys(TAG_KIND) as GroupTag[]).filter((t) => TAG_KIND[t] === kind);
}

/** One odd-one-out item, or null if this kind cannot fill n cards from the pool. */
export function makeOddItem(kind: Kind, n: number, opts: OddOptions = {}): OddItem | null {
  const pool = (opts.pool ?? CONCEPTS).filter((c) => !opts.tiers || opts.tiers.includes(c.tier));
  const groups = groupsForKind(kind).filter((g) => membersOf(g, kind, pool).length >= n - 1);
  if (!groups.length) return null;
  for (let tries = 0; tries < 400; tries++) {
    const group = pick(groups);
    const members = sample(membersOf(group, kind, pool), n - 1);
    const candidates = oddCandidates(group, kind, pool);
    if (!candidates.length) continue;
    const odd = pick(candidates);
    const contrast = contrastFor(odd, members, kind);
    if (!contrast) continue;
    const cards = shuffle([...members, odd]);
    if (isAmbiguous(cards, odd.id)) continue;
    return { mode: 'odd', kind, group, cards, oddId: odd.id, contrast };
  }
  return null;
}

// ---- Analogies ----

/** Difficulty tier of each relation: part–whole, object–location, function, cause–effect. */
export const RELATION_TIER: Record<RelationType, 1 | 2 | 3 | 4> = {
  partOf: 1,
  livesIn: 2,
  goesOn: 2,
  wornOn: 2,
  usedFor: 3,
  gives: 3,
  becomes: 4,
};

type Pair = { from: Concept; to: Concept; type: RelationType; why: Localized; lure?: string; avoid: string[] };

export function relationPairs(): Pair[] {
  return CONCEPTS.flatMap((from) =>
    (from.relations ?? []).flatMap((r) => {
      const to = conceptById(r.to);
      return to ? [{ from, to, type: r.type, why: r.why, lure: r.lure, avoid: r.avoid ?? [] }] : [];
    }),
  );
}

/** Concept ids linked to `id` by any relation, in either direction. */
function linkedTo(id: string, pairs: Pair[]): Set<string> {
  const s = new Set<string>();
  for (const p of pairs) {
    if (p.from.id === id) s.add(p.to.id);
    if (p.to.id === id) s.add(p.from.id);
  }
  return s;
}

/**
 * "a1 → b1, as a2 → ?" with 3 choices. Distractors are answers of the same
 * relation that do not fit a2 (or, at higher levels, a hand-written lure), so
 * only one choice completes the relation.
 */
export function makeAnalogy(type: RelationType, lures: boolean, usedA2: ReadonlySet<string> = new Set()): AnalogyItem | null {
  const pairs = relationPairs();
  const ofType = pairs.filter((p) => p.type === type);
  const targets = shuffle(ofType.filter((p) => !usedA2.has(p.from.id)));
  for (const p2 of targets) {
    const examples = ofType.filter((p) => p.from.id !== p2.from.id && p.to.id !== p2.to.id);
    if (!examples.length) continue;
    const p1 = pick(examples);
    const linked = linkedTo(p2.from.id, pairs);
    const shown = new Set([p1.from.id, p1.to.id, p2.from.id, p2.to.id, ...p2.avoid]);
    const ok = (c: Concept) => !shown.has(c.id) && !(linked.has(c.id) && c.id !== p2.lure);
    const distractors: Concept[] = [];
    const lure = lures && p2.lure ? conceptById(p2.lure) : undefined;
    if (lure && ok(lure)) distractors.push(lure);
    const add = (cands: Concept[]) => {
      for (const c of shuffle(cands)) {
        if (distractors.length >= 2) return;
        if (ok(c) && !linked.has(c.id) && !distractors.some((d) => d.id === c.id)) distractors.push(c);
      }
    };
    add(ofType.map((p) => p.to));
    add(pairs.filter((p) => p.type !== type).map((p) => p.to));
    if (distractors.length < 2) continue;
    return {
      mode: 'analogy',
      type,
      a1: p1.from,
      b1: p1.to,
      a2: p2.from,
      answerId: p2.to.id,
      options: shuffle([p2.to, ...distractors]),
      why: [p1.why, p2.why],
    };
  }
  return null;
}

// ---- Session plan ----

export type RoundSpec = { mode: 'odd'; kind: Kind; n: number } | { mode: 'analogy'; maxTier: 1 | 2 | 3 | 4; lures: boolean };

export function tiersFor(level: number, profile: Profile): Concept['tier'][] {
  if (profile === 'keepSharp') return level <= 2 ? [1, 2] : [1, 2, 3];
  if (level <= 3) return [1];
  if (level <= 6) return [1, 2];
  return [1, 2, 3];
}

/**
 * Keep Sharp: L1 colour, L2 category, L3 subcategory, L4 theme, L5 abstract
 * (4 then 5 cards); L6 mixes in analogies; L7–10 analogies of rising relation tier.
 * Rebuild: 3 cards, category only; difficulty comes from less frequent words.
 */
export function roundSpecs(level: number, profile: Profile): RoundSpec[] {
  if (profile === 'rebuild') return Array.from({ length: 5 }, () => ({ mode: 'odd', kind: 'taxo', n: 3 }));
  const n = level <= 4 ? 4 : 5;
  if (level <= 5) {
    const main = KIND_ORDER[level - 1];
    const easier = KIND_ORDER[Math.max(0, level - 2)];
    return [easier, main, main, easier, main, main].map((kind) => ({ mode: 'odd', kind, n }));
  }
  if (level === 6) {
    return [0, 1, 2, 3, 4, 5].map((i) =>
      i % 2 === 0 ? { mode: 'odd', kind: i === 2 ? 'theme' : 'abstract', n } : { mode: 'analogy', maxTier: 1, lures: false },
    );
  }
  const maxTier = Math.min(4, level - 5) as 1 | 2 | 3 | 4;
  const lures = level >= 9;
  return Array.from({ length: 6 }, () => ({ mode: 'analogy', maxTier, lures }));
}

/** Builds the session's items. Analogies favour the newest relation tier and never repeat a question picture. */
export function buildItems(level: number, profile: Profile): Item[] {
  const tiers = tiersFor(level, profile);
  const used = new Set<string>();
  const askedA2 = new Set<string>();
  const items: Item[] = [];
  roundSpecs(level, profile).forEach((spec, i) => {
    let item: Item | null = null;
    if (spec.mode === 'odd') {
      // Fall back to an easier kind if a group cannot fill the cards; prefer pictures not seen yet this session.
      for (let k = KIND_ORDER.indexOf(spec.kind); k >= 0 && !item; k--) {
        for (let tries = 0; tries < 4; tries++) {
          const next = makeOddItem(KIND_ORDER[k], spec.n, { tiers });
          if (next) item = next;
          if (next && !next.cards.some((c) => used.has(c.id))) break;
        }
      }
      item?.cards.forEach((c) => used.add(c.id));
    } else {
      const types = (Object.keys(RELATION_TIER) as RelationType[]).filter((t) => RELATION_TIER[t] <= spec.maxTier);
      const newest = types.filter((t) => RELATION_TIER[t] === spec.maxTier);
      const order = i % 2 === 0 ? [...shuffle(newest), ...shuffle(types)] : shuffle(types);
      for (const t of order) {
        item = makeAnalogy(t, spec.lures, askedA2);
        if (item) break;
      }
      if (item) askedA2.add(item.a2.id);
    }
    if (item) items.push(item);
  });
  return items;
}

// ---- Feedback sentences ----

/** Spanish articles; plural ones also switch the verb (son). Unknown ids fall back to the bare word. */
const ES_ARTICLE: Record<string, 'el' | 'la' | 'los' | 'las'> = {
  apple: 'la', banana: 'el', bread: 'el', egg: 'el', dog: 'el', cat: 'el', fish: 'el', key: 'la', door: 'la', bed: 'la',
  book: 'el', shoe: 'el', car: 'el', tree: 'el', sun: 'el', clock: 'el', grapes: 'las', lemon: 'el', carrot: 'la',
  cheese: 'el', horse: 'el', cow: 'la', rabbit: 'el', glasses: 'las', umbrella: 'el', scissors: 'las', hammer: 'el',
  spoon: 'la', hat: 'el', bicycle: 'la', airplane: 'el', flower: 'la', moon: 'la', guitar: 'la', turtle: 'la',
  butterfly: 'la', anchor: 'el', compass: 'la', thermometer: 'el', microscope: 'el', crown: 'la', envelope: 'el',
  magnet: 'el', candle: 'la', violin: 'el', trumpet: 'la', strawberry: 'la', orange: 'la', cherry: 'las', pear: 'la',
  milk: 'la', soup: 'la', cake: 'el', icecream: 'el', coffee: 'el', corn: 'el', cucumber: 'el', cookie: 'la',
  honey: 'la', candy: 'el', broccoli: 'el', chicken: 'la', bird: 'el', lion: 'el', elephant: 'el', sheep: 'la',
  whale: 'la', dolphin: 'el', crab: 'el', giraffe: 'la', monkey: 'el', bee: 'la', ant: 'la', frog: 'la', camel: 'el',
  octopus: 'el', caterpillar: 'la', chick: 'el', sock: 'el', tshirt: 'la', glove: 'el', scarf: 'la', bus: 'el',
  train: 'el', truck: 'el', boat: 'el', ship: 'el', helicopter: 'el', canoe: 'la', drum: 'el', piano: 'el',
  saxophone: 'el', wrench: 'la', fishingRod: 'la', shower: 'la', soap: 'el', sponge: 'la', bulb: 'la',
  flashlight: 'la', pencil: 'el', newspaper: 'el', beachUmbrella: 'la', snowman: 'el', lock: 'el', wool: 'la',
  fire: 'el', star: 'la', cloud: 'la', sea: 'el', rain: 'la', snowflake: 'el', shell: 'la', desert: 'el', leaf: 'la',
  seedling: 'el', house: 'la', road: 'la', tracks: 'la', foot: 'el', hand: 'la', mouth: 'la', eyes: 'los', tooth: 'el',
};
const EN_PLURAL = new Set(['grapes', 'glasses', 'scissors', 'cherry', 'eyes']);

export function isPlural(c: Concept, lang: Lang): boolean {
  if (lang === 'es') return ES_ARTICLE[c.id] === 'los' || ES_ARTICLE[c.id] === 'las';
  if (lang === 'en') return EN_PLURAL.has(c.id);
  return false;
}

/** "el martillo", "the hammer", "المطرقة" (Arabic idafa takes ال on its last word: ميزان الحرارة). */
export function definite(c: Concept, lang: Lang): string {
  const w = c.word[lang];
  if (lang === 'en') return `the ${w}`;
  if (lang === 'es') return ES_ARTICLE[c.id] ? `${ES_ARTICLE[c.id]} ${w}` : w;
  const parts = w.split(' ');
  const last = parts[parts.length - 1];
  if (!last.startsWith('ال')) parts[parts.length - 1] = `ال${last}`;
  return parts.join(' ');
}

const cap = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1);

/** "a, b and c" / "a, b y c" / "أ وب وج". */
export function joinList(words: string[], lang: Lang): string {
  if (lang === 'ar') return words.join(' و');
  const and = lang === 'es' ? ' y ' : ' and ';
  return words.length <= 1 ? words.join('') : `${words.slice(0, -1).join(', ')}${and}${words[words.length - 1]}`;
}

type T = (key: string, opts?: Record<string, string>) => string;

/** "Apple, banana and grapes are fruit. The hammer is a tool." in the content language. */
export function explainOdd(item: OddItem, lang: Lang, t: T): string {
  const odd = item.cards.find((c) => c.id === item.oddId)!;
  const members = item.cards.filter((c) => c.id !== item.oddId);
  const listWords = members.map((c) => (lang === 'en' ? c.word.en : definite(c, lang)));
  const shared = t(members.length === 2 ? 'oddOneOut.shared2' : 'oddOneOut.shared', { items: cap(joinList(listWords, lang)), x: t(`oddOneOut.g.${item.group}.are`) });
  const oddWord = lang === 'en' ? odd.word.en : cap(definite(odd, lang));
  const oddLine = t(isPlural(odd, lang) ? 'oddOneOut.oddAre' : 'oddOneOut.oddIs', {
    odd: oddWord,
    x: t(`oddOneOut.g.${item.contrast}.isA`),
  });
  return `${shared} ${oddLine}`;
}

export function explainAnalogy(item: AnalogyItem, lang: Lang): string {
  return `${item.why[0][lang]} ${item.why[1][lang]}`;
}
