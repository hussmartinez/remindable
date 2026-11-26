import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { colors } from '@/lib/theme';
import { BigButton, Gap, Txt } from './ui';

export type Choice = { key: string; label: string; icon?: string };

type Props = {
  choices: Choice[];
  correctKey: string;
  /** Called after the user has seen the feedback and pressed Next. */
  onAnswer: (correct: boolean) => void;
  correctText?: string;
  revealText?: string;
};

/**
 * Multiple choice with gentle feedback: a wrong pick is never marked red,
 * the right answer is simply shown so the correct association is what sticks.
 */
export function Choices({ choices, correctKey, onAnswer, correctText, revealText }: Props) {
  const { t } = useTranslation();
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === correctKey;
  const answer = choices.find((c) => c.key === correctKey);

  return (
    <>
      {choices.map((c) => {
        const tone = picked === null ? 'secondary' : c.key === correctKey ? 'good' : c.key === picked ? 'hint' : 'secondary';
        return (
          <BigButton
            key={c.key}
            icon={c.icon}
            label={c.label}
            tone={tone}
            disabled={picked !== null && c.key !== correctKey && c.key !== picked}
            onPress={() => picked === null && setPicked(c.key)}
          />
        );
      })}
      {picked !== null && (
        <>
          <Gap size={8} />
          <Txt bold center color={correct ? colors.good : colors.hint}>
            {correct ? (correctText ?? t('vault.right')) : (revealText ?? t('vault.itWas', { answer: answer?.label }))}
          </Txt>
          <Gap size={8} />
          <BigButton label={t('common.next')} onPress={() => onAnswer(correct)} />
        </>
      )}
    </>
  );
}
