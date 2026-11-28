import { announce, ChoiceList } from '@hussmartinez/ui/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import { colors } from '@/lib/theme';
import { BigButton, Gap, Txt, useTextScale } from './ui';

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
 * Multiple choice with gentle feedback, on ui's `ChoiceList`: a wrong pick is
 * shown in the hint tone, never as an error, next to the right answer, so the
 * correct association is what sticks. The result is also announced to screen readers.
 */
export function Choices({ choices, correctKey, onAnswer, correctText, revealText }: Props) {
  const { t } = useTranslation();
  const scale = useTextScale();
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === correctKey;
  const answer = choices.find((c) => c.key === correctKey);
  const feedback = correct ? (correctText ?? t('vault.right')) : (revealText ?? t('vault.itWas', { answer: answer?.label }));

  return (
    <>
      <ChoiceList
        choices={choices.map((c) => ({
          key: c.key,
          label: c.label,
          icon: c.icon ? <Text style={{ fontSize: 34 * scale }}>{c.icon}</Text> : undefined,
        }))}
        value={picked}
        correctKey={correctKey}
        feedbackLabels={{ correct: t('common.correctAnswer'), hint: t('common.yourAnswer') }}
        onValueChange={(key) => {
          if (picked !== null) return;
          setPicked(key);
          announce(key === correctKey ? (correctText ?? t('vault.right')) : (revealText ?? t('vault.itWas', { answer: answer?.label })));
        }}
      />
      {picked !== null && (
        <>
          <Gap size={8} />
          <Txt bold center color={correct ? colors.good : colors.hint}>
            {feedback}
          </Txt>
          <Gap size={8} />
          <BigButton label={t('common.next')} onPress={() => onAnswer(correct)} />
        </>
      )}
    </>
  );
}
