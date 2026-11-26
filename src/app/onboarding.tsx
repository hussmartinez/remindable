import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LangPicker, MultiLangPicker, ProfilePicker } from '@/components/pickers';
import { BigButton, Card, Emoji, Gap, Screen, Txt } from '@/components/ui';
import type { Profile } from '@/engine/adaptive';
import i18n, { deviceLang } from '@/i18n';
import { isRTL, type Lang } from '@/lib/lang';
import { colors } from '@/lib/theme';
import { useStore } from '@/state/store';

export default function Onboarding() {
  const { t } = useTranslation();
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [uiLang, setUiLang] = useState<Lang>(deviceLang());
  const [trainLangs, setTrainLangs] = useState<Lang[]>([deviceLang()]);
  const [profile, setProfile] = useState<Profile | null>(null);

  const chooseUi = (l: Lang) => {
    setUiLang(l);
    setTrainLangs([l]);
    i18n.changeLanguage(l);
  };

  const finish = () => {
    if (!profile) return;
    completeOnboarding({ uiLang, trainLangs, profile, textScale: 1.2, autoSpeak: true });
    router.replace('/home');
  };

  return (
    <Screen>
      {step === 0 && (
        <>
          <Gap />
          <Emoji size={88}>🌿</Emoji>
          <Txt variant="title" center>
            {t('onboarding.welcome')}
          </Txt>
          <Txt center color={colors.inkSoft}>
            {t('onboarding.tagline')}
          </Txt>
          <Gap size={32} />
          <Txt bold>{t('onboarding.uiLang')}</Txt>
          <LangPicker value={uiLang} onChange={chooseUi} />
          <Gap />
          <BigButton label={t('common.continue')} onPress={() => setStep(1)} />
        </>
      )}

      {step === 1 && (
        <>
          <Txt variant="title">{t('onboarding.trainLangs')}</Txt>
          <Txt color={colors.inkSoft}>{t('onboarding.trainLangsHint')}</Txt>
          <Gap />
          <MultiLangPicker value={trainLangs} onChange={setTrainLangs} />
          <Gap />
          <BigButton label={t('common.continue')} disabled={trainLangs.length === 0} onPress={() => setStep(2)} />
        </>
      )}

      {step === 2 && (
        <>
          <Txt variant="title">{t('onboarding.profile')}</Txt>
          <Gap />
          <ProfilePicker value={profile} onChange={setProfile} />
          <Gap />
          <BigButton label={t('common.continue')} disabled={!profile} onPress={() => setStep(3)} />
        </>
      )}

      {step === 3 && (
        <>
          <Txt variant="title">{t('onboarding.beforeTitle')}</Txt>
          <Gap />
          <Card>
            <Txt>{t('onboarding.disclaimer')}</Txt>
          </Card>
          <Gap />
          <BigButton label={t('onboarding.begin')} onPress={finish} />
        </>
      )}

      {step > 0 && <BigButton tone="quiet" label={isRTL(uiLang) ? '→' : '←'} onPress={() => setStep(step - 1)} />}
    </Screen>
  );
}
