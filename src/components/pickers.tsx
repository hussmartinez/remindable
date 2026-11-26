import { useTranslation } from 'react-i18next';

import type { Profile } from '@/engine/adaptive';
import { LANG_NAMES, LANGS, type Lang } from '@/lib/lang';
import { BigButton } from './ui';

export function LangPicker({ value, onChange }: { value: Lang | null; onChange: (l: Lang) => void }) {
  return (
    <>
      {LANGS.map((l) => (
        <BigButton key={l} label={LANG_NAMES[l]} tone={value === l ? 'selected' : 'secondary'} onPress={() => onChange(l)} />
      ))}
    </>
  );
}

export function MultiLangPicker({ value, onChange }: { value: Lang[]; onChange: (l: Lang[]) => void }) {
  const toggle = (l: Lang) => onChange(value.includes(l) ? value.filter((x) => x !== l) : LANGS.filter((x) => x === l || value.includes(x)));
  return (
    <>
      {LANGS.map((l) => (
        <BigButton
          key={l}
          icon={value.includes(l) ? '☑️' : '⬜'}
          label={LANG_NAMES[l]}
          tone={value.includes(l) ? 'selected' : 'secondary'}
          onPress={() => toggle(l)}
        />
      ))}
    </>
  );
}

export function ProfilePicker({ value, onChange }: { value: Profile | null; onChange: (p: Profile) => void }) {
  const { t } = useTranslation();
  return (
    <>
      <BigButton
        icon="🌱"
        label={t('onboarding.keepSharp')}
        sublabel={t('onboarding.keepSharpDesc')}
        tone={value === 'keepSharp' ? 'selected' : 'secondary'}
        onPress={() => onChange('keepSharp')}
      />
      <BigButton
        icon="🧩"
        label={t('onboarding.rebuild')}
        sublabel={t('onboarding.rebuildDesc')}
        tone={value === 'rebuild' ? 'selected' : 'secondary'}
        onPress={() => onChange('rebuild')}
      />
    </>
  );
}
