import type { TFunction } from 'i18next';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';

import { BigButton, Card, Dir, Emoji, Gap, Row, SpeakButton, Txt, useTextScale } from '@/components/ui';
import { tIn } from '@/i18n';
import type { Lang } from '@/lib/lang';
import { useAutoSpeak } from '@/lib/speech';
import { colors, minTap, radius, space } from '@/lib/theme';
import { fixedCells, isFull, isSolved, isWrong, nextHint, startGrid, symbol, type Puzzle } from './adapters';
import { Board } from './Board';
import { hintText } from './hintText';

type Message = { text: string; tone: 'hint' | 'good' | 'info' };

function howTo(p: Puzzle, t: TFunction): string {
  if (p.kind === 'sudoku') return t(p.data.symbols === 'fruit' ? 'logic.sudokuHowFruit' : 'logic.sudokuHowDigits', { n: p.n });
  if (p.kind === 'picture') return t('logic.pictureHow');
  const ops = new Set(p.data.cages.map((c) => c.op));
  return [t('logic.cagesHow', { n: p.n }), ops.has('-') && t('logic.cagesHowMinus'), ops.has('×') && t('logic.cagesHowTimes')]
    .filter(Boolean)
    .join(' ');
}

/** One puzzle: how-to, play (tap a square, then a value; check; hint), then the solved view. */
export function Play({ puzzle, lang, last, onSolved, onNext }: { puzzle: Puzzle; lang: Lang; last: boolean; onSolved: (hints: number) => void; onNext: () => void }) {
  const { t } = useTranslation();
  const tc = useMemo(() => tIn(lang), [lang]);
  const { width } = useWindowDimensions();
  const boardWidth = Math.min(width - 2 * space.md, 560);
  const isPic = puzzle.kind === 'picture';
  const fixed = useMemo(() => fixedCells(puzzle), [puzzle]);

  const [phase, setPhase] = useState<'intro' | 'play' | 'solved'>('intro');
  const [grid, setGrid] = useState(() => startGrid(puzzle));
  const [selected, setSelected] = useState(-1);
  const [pen, setPen] = useState(1);
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const [flash, setFlash] = useState(-1);
  const [msg, setMsg] = useState<Message | null>(null);
  const [hints, setHints] = useState(0);

  const how = howTo(puzzle, tc);
  const title = tc(`logic.${puzzle.kind}Title`);
  useAutoSpeak(phase === 'intro' ? `${title}. ${how}` : null, lang);

  const commit = (next: number[], usedHints = hints, message: Message | null = null) => {
    setGrid(next);
    if (isSolved(puzzle, next)) {
      setGrid(isPic ? next.map((v) => (v === 1 ? 1 : 0)) : next);
      setWrong(new Set());
      setSelected(-1);
      setPhase('solved');
      onSolved(usedHints);
      return;
    }
    if (isFull(puzzle, next)) {
      setWrong(new Set(next.map((_, i) => i).filter((i) => isWrong(puzzle, next, i))));
      setMsg({ text: tc('logic.fullOff'), tone: 'hint' });
      return;
    }
    setMsg(message);
  };

  const place = (i: number, v: number) => {
    const next = [...grid];
    next[i] = v;
    setFlash(-1);
    setWrong((w) => {
      const s = new Set(w);
      s.delete(i);
      return s;
    });
    commit(next);
  };

  const tapCell = (i: number) => {
    if (phase !== 'play') return;
    if (isPic) place(i, grid[i] === pen ? 0 : pen);
    else if (!fixed[i]) setSelected(i);
  };

  const tapValue = (v: number) => {
    if (selected < 0) setMsg({ text: tc('logic.tapCell'), tone: 'info' });
    else place(selected, v);
  };

  const check = () => {
    const bad = new Set(grid.map((_, i) => i).filter((i) => isWrong(puzzle, grid, i)));
    setWrong(bad);
    setFlash(-1);
    setMsg({ text: tc(bad.size ? 'logic.someOff' : 'logic.allGood'), tone: bad.size ? 'hint' : 'good' });
  };

  const hint = () => {
    const h = nextHint(puzzle, grid, selected);
    if (!h) return;
    const next = [...grid];
    next[h.cell] = h.value;
    const used = hints + 1;
    setHints(used);
    setFlash(h.cell);
    if (!isPic) setSelected(h.cell);
    setWrong((w) => {
      const s = new Set(w);
      s.delete(h.cell);
      return s;
    });
    commit(next, used, { text: hintText(puzzle, h, tc), tone: 'info' });
  };

  if (phase === 'intro') {
    return (
      <Dir lang={lang}>
        <Card>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt variant="title" style={{ flexShrink: 1 }}>
              {title}
            </Txt>
            <SpeakButton text={`${title}. ${how}`} lang={lang} />
          </Row>
          <Gap size={space.sm} />
          <Txt>{how}</Txt>
        </Card>
        <Gap />
        <BigButton label={t('logic.start')} onPress={() => setPhase('play')} />
      </Dir>
    );
  }

  const values = isPic ? [] : Array.from({ length: puzzle.n }, (_, k) => k + 1);
  // Up to five keys fit one row on a phone; more wrap into two even rows.
  const basis = values.length + 1 <= 5 ? '15%' : '22%';
  const pic = puzzle.kind === 'picture' ? puzzle.data.picture : null;

  return (
    <View>
      {phase === 'play' && (
        <Dir lang={lang}>
          <Txt center color={colors.inkSoft}>
            {tc(isPic ? 'logic.tapPaint' : 'logic.tapCell')}
          </Txt>
        </Dir>
      )}
      <Gap size={space.sm} />
      <Board
        puzzle={puzzle}
        grid={grid}
        fixed={fixed}
        selected={phase === 'play' ? selected : -1}
        wrong={wrong}
        flash={phase === 'play' ? flash : -1}
        reveal={phase === 'solved'}
        width={boardWidth}
        onTap={tapCell}
      />
      <Gap size={space.sm} />

      {phase === 'solved' ? (
        <Dir lang={lang}>
          {pic && <Emoji size={72}>{pic.emoji}</Emoji>}
          <Txt center bold color={colors.good}>
            {pic ? tc('logic.solvedPicture', { name: tc(`logic.pic_${pic.id}`) }) : tc('logic.solved')}
          </Txt>
          <Gap />
          <BigButton label={t(last ? 'logic.finish' : 'logic.next')} onPress={onNext} />
        </Dir>
      ) : (
        <Dir lang={lang}>
          {msg && (
            <Card style={{ borderColor: msg.tone === 'good' ? colors.good : colors.hint, backgroundColor: msg.tone === 'good' ? colors.goodSoft : colors.hintSoft }}>
              <Txt color={colors.ink}>{msg.text}</Txt>
            </Card>
          )}
          <Gap size={space.xs} />
          {/* Value bar follows reading order. */}
          <Row style={{ flexWrap: 'wrap', justifyContent: 'center', gap: space.xs, marginVertical: space.xs }}>
            {isPic ? (
              <>
                <Key glyph="⬛" caption={t('logic.fill')} basis="28%" selected={pen === 1} onPress={() => setPen(1)} />
                <Key glyph="·" caption={t('logic.empty')} basis="28%" selected={pen === 2} onPress={() => setPen(2)} />
                <Key glyph="⌫" caption={t('logic.clear')} basis="28%" selected={pen === 0} onPress={() => setPen(0)} />
              </>
            ) : (
              <>
                {values.map((v) => (
                  <Key key={v} glyph={symbol(puzzle, v)} basis={basis} onPress={() => tapValue(v)} />
                ))}
                <Key glyph="⌫" label={t('logic.clear')} quiet basis={basis} onPress={() => tapValue(0)} />
              </>
            )}
          </Row>
          <Row style={{ flexWrap: 'wrap', justifyContent: 'center', gap: space.xs }}>
            <BigButton label={t('logic.check')} icon="✔️" tone="secondary" onPress={check} style={{ flexGrow: 1, flexBasis: '40%' }} />
            <BigButton label={t('logic.hint')} icon="💡" tone="hint" onPress={hint} style={{ flexGrow: 1, flexBasis: '40%' }} />
          </Row>
        </Dir>
      )}
    </View>
  );
}

/** A compact, large-glyph key for the value bar; `caption` adds a small word below. */
function Key({ glyph, caption, label, selected, quiet, basis = '15%', onPress }: { glyph: string; basis?: `${number}%`; caption?: string; label?: string; selected?: boolean; quiet?: boolean; onPress: () => void }) {
  const scale = useTextScale();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={caption ?? label ?? glyph}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        minWidth: minTap * scale,
        minHeight: minTap * scale,
        flexGrow: 1,
        flexBasis: basis,
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.lg,
        borderWidth: 2,
        borderColor: selected ? colors.accent : quiet ? colors.border : colors.primary,
        backgroundColor: selected ? colors.accentSoft : colors.card,
        opacity: pressed ? 0.7 : 1,
      })}>
      <Text style={{ fontSize: 32 * scale, lineHeight: 40 * scale, fontWeight: '700', color: quiet ? colors.inkSoft : colors.primary }}>{glyph}</Text>
      {caption ? <Txt variant="small" bold>{caption}</Txt> : null}
    </Pressable>
  );
}
