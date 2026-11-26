import { useTranslation } from 'react-i18next';

import { BigButton, Gap, Txt } from '@/components/ui';
import type { GameProps } from './types';

/** Temporary stand-in while a game is being built. */
export function Placeholder({ name, onDone }: GameProps & { name: string }) {
  const { t } = useTranslation();
  return (
    <>
      <Txt variant="title" center>
        {name}
      </Txt>
      <Gap />
      <BigButton label={t('common.continue')} onPress={() => onDone({ correct: 0, total: 0 })} />
    </>
  );
}
