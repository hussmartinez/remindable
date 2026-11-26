import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BigButton, Card, Dir, Emoji, Gap, Row, SpeakButton, Txt } from '@/components/ui';
import { MOVES } from '@/content/moves';
import { pick } from '@/engine/random';
import { tIn } from '@/i18n';
import { useAutoSpeak } from '@/lib/speech';
import { colors } from '@/lib/theme';
import type { GameProps } from './types';

const SECONDS = 60;

/** Move & Think: one minute of a cognitive-motor dual task. Not scored. */
export function MoveThink({ lang, onDone }: GameProps) {
  const { t } = useTranslation();
  const task = useMemo(() => pick(MOVES)[lang], [lang]);
  const [left, setLeft] = useState(SECONDS);
  useAutoSpeak(task, lang);

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  return (
    <>
      <Emoji size={90}>🚶</Emoji>
      <Card>
        <Dir lang={lang}>
          <Row>
            <Txt variant="title" style={{ flexShrink: 1 }}>
              {task}
            </Txt>
            <SpeakButton text={task} lang={lang} />
          </Row>
        </Dir>
      </Card>
      <Gap size={12} />
      <Txt center color={colors.inkSoft}>
        {tIn(lang)('move.seated')}
      </Txt>
      <Gap />
      <Txt variant="huge" center bold color={left > 0 ? colors.primary : colors.good}>
        {left > 0 ? t('move.seconds', { s: left }) : '✓'}
      </Txt>
      <Gap />
      <BigButton label={t('common.done')} tone={left > 0 ? 'secondary' : 'primary'} onPress={() => onDone({ correct: 0, total: 0 })} />
    </>
  );
}
