import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { BigButton, Card, Emoji, Gap, Row, Screen, Txt } from '@/components/ui';
import { addDays, dayKey } from '@/engine/dates';
import { phaseFor } from '@/engine/program';
import { colors, radius } from '@/lib/theme';
import { useStore } from '@/state/store';

export default function Home() {
  const { t, i18n } = useTranslation();
  const sessionDays = useStore((s) => s.sessionDays);
  const startedOn = useStore((s) => s.startedOn);
  const today = dayKey();
  const doneToday = sessionDays.includes(today);

  const phase = startedOn ? phaseFor(startedOn, today) : null;
  const phaseLabel = !phase
    ? t('home.phaseNew')
    : phase.kind === 'core'
      ? t('home.phaseCore', { week: phase.week, weeks: phase.weeks })
      : phase.kind === 'booster'
        ? t('home.phaseBooster', { week: phase.week, weeks: phase.weeks })
        : t('home.phaseMaintenance');

  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt variant="title">{t('home.hello')}</Txt>
        <BigButton tone="quiet" icon="⚙️" label={t('home.settings')} onPress={() => router.push('/settings')} />
      </Row>
      <Txt color={colors.inkSoft}>{phaseLabel}</Txt>
      {phase?.kind === 'booster' && <Txt color={colors.primary}>{t('home.boosterNote')}</Txt>}

      <Gap size={28} />
      <Card style={{ alignItems: 'center' }}>
        <Emoji size={80}>{doneToday ? '🌻' : '🌱'}</Emoji>
        <Gap size={12} />
        {doneToday ? (
          <>
            <Txt bold center color={colors.good}>
              {t('home.doneToday')}
            </Txt>
            <Gap size={12} />
            <BigButton tone="secondary" label={t('home.again')} onPress={() => router.push('/session')} style={{ alignSelf: 'stretch' }} />
          </>
        ) : (
          <BigButton label={t('home.start')} sublabel={t('home.length')} onPress={() => router.push('/session')} style={{ alignSelf: 'stretch' }} />
        )}
      </Card>

      <Gap size={12} />
      <BigButton tone="secondary" icon="🔎" label={t('tools.finderButton')} sublabel={t('tools.finderButtonSub')} onPress={() => router.push('/word-finder')} />
      <BigButton tone="secondary" icon="💬" label={t('tools.wwwButton')} sublabel={t('tools.wwwButtonSub')} onPress={() => router.push('/where-were-we')} />

      <Gap size={28} />
      <Txt bold>{t('home.thisWeek')}</Txt>
      <Gap size={8} />
      <Row style={{ justifyContent: 'space-between' }}>
        {week.map((d) => {
          const done = sessionDays.includes(d);
          const [y, m, day] = d.split('-').map(Number);
          const label = new Date(y, m - 1, day).toLocaleDateString(i18n.language, { weekday: 'narrow' });
          return (
            <View key={d} style={{ alignItems: 'center', gap: 4 }}>
              <View style={[styles.dot, done && styles.dotDone, d === today && styles.dotToday]}>
                <Txt variant="small" color={done ? colors.primaryInk : colors.inkSoft}>
                  {done ? '✓' : ' '}
                </Txt>
              </View>
              <Txt variant="small" color={colors.inkSoft}>
                {label}
              </Txt>
            </View>
          );
        })}
      </Row>
      <Gap />
      <Txt color={colors.inkSoft}>{t('home.total', { count: sessionDays.length })}</Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  dotDone: { backgroundColor: colors.good, borderColor: colors.good },
  dotToday: { borderColor: colors.accent, borderWidth: 3 },
});
