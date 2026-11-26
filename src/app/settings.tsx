import { router } from 'expo-router';
import { Switch } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LangPicker, MultiLangPicker, ProfilePicker } from '@/components/pickers';
import { BigButton, Card, Gap, Row, Screen, Txt } from '@/components/ui';
import { confirm } from '@/lib/confirm';
import { colors } from '@/lib/theme';
import { useStore } from '@/state/store';

const SIZES = [
  { key: 'settings.sizeNormal', value: 1 },
  { key: 'settings.sizeLarge', value: 1.2 },
  { key: 'settings.sizeHuge', value: 1.4 },
] as const;

export default function Settings() {
  const { t } = useTranslation();
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const resetProgress = useStore((s) => s.resetProgress);

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt variant="title">{t('settings.title')}</Txt>
        <BigButton tone="secondary" label={t('common.done')} onPress={() => router.back()} />
      </Row>

      <Gap />
      <Txt bold>{t('settings.uiLang')}</Txt>
      <LangPicker value={settings.uiLang} onChange={(uiLang) => update({ uiLang })} />

      <Gap />
      <Txt bold>{t('settings.trainLangs')}</Txt>
      <MultiLangPicker
        value={settings.trainLangs}
        onChange={(trainLangs) => {
          if (trainLangs.length > 0) update({ trainLangs });
        }}
      />
      <Txt variant="small" color={colors.inkSoft}>
        {t('settings.atLeastOne')}
      </Txt>

      <Gap />
      <Txt bold>{t('settings.profile')}</Txt>
      <ProfilePicker value={settings.profile} onChange={(profile) => update({ profile })} />

      <Gap />
      <Txt bold>{t('settings.textSize')}</Txt>
      {SIZES.map((s) => (
        <BigButton key={s.value} label={t(s.key)} tone={settings.textScale === s.value ? 'selected' : 'secondary'} onPress={() => update({ textScale: s.value })} />
      ))}

      <Gap />
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt style={{ flexShrink: 1 }}>{t('settings.autoSpeak')}</Txt>
          <Switch value={settings.autoSpeak} onValueChange={(autoSpeak) => update({ autoSpeak })} trackColor={{ true: colors.primary }} />
        </Row>
      </Card>

      <Gap size={40} />
      <BigButton
        tone="quiet"
        label={t('settings.reset')}
        onPress={() => confirm(t('settings.resetConfirm'), resetProgress, t('common.yes'), t('common.cancel'))}
      />
    </Screen>
  );
}
