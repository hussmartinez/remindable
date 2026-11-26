import { router } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, Text, View } from 'react-native';

import { BigButton, Card, Dir, Gap, Row, Screen, Txt, useTextScale } from '@/components/ui';
import { addUtterance, lastSentences, prune, topicWords, type Utterance } from '@/engine/conversation';
import { stripPunct } from '@/engine/textNorm';
import { LANG_NAMES, LANGS, type Lang } from '@/lib/lang';
import { useRecognizer } from '@/lib/speechRecognition';
import { colors, fontBase, minTap, radius, space } from '@/lib/theme';
import { useStore } from '@/state/store';

/**
 * "Where were we?": live captions of the last few minutes plus a recap card,
 * for people who lose the thread of a conversation after a brain injury.
 * The text lives only in this screen's memory: it is pruned every few seconds,
 * never written to storage, and gone when the screen closes.
 */

const SHOWN_UTTERANCES = 5;
const web = Platform.OS === 'web';
const PRUNE_EVERY_MS = 10_000;

export default function WhereWereWe() {
  const { t } = useTranslation();
  // From settings, not i18n.language: on a cold start i18n may not have switched yet.
  const ui = useStore((s) => s.settings.uiLang);
  const trainLangs = useStore((s) => s.settings.trainLangs);
  const langs = useMemo(() => LANGS.filter((l) => l === ui || trainLangs.includes(l)), [ui, trainLangs]);
  const [lang, setLang] = useState<Lang>(ui);
  const [utts, setUtts] = useState<Utterance[]>([]);
  const [showRecap, setShowRecap] = useState(false);
  const [pinned, setPinned] = useState<string | null>(null);

  const rec = useRecognizer({
    lang,
    continuous: true,
    onFinal: (alts) => setUtts((list) => addUtterance(list, alts[0], Date.now())),
  });

  useEffect(() => {
    const id = setInterval(() => setUtts((list) => prune(list, Date.now())), PRUNE_EVERY_MS);
    return () => clearInterval(id);
  }, []);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/home'));
  const header = (
    <Row style={{ justifyContent: 'space-between' }}>
      <Txt variant="title" style={{ flexShrink: 1 }}>
        💬 {t('tools.wwwTitle')}
      </Txt>
      <BigButton tone="quiet" label={t('tools.back')} onPress={back} />
    </Row>
  );

  if (!rec.available) {
    return (
      <Screen>
        {header}
        <Gap />
        <Card style={{ alignItems: 'center' }}>
          <Txt variant="title" center>
            🎤
          </Txt>
          <Txt bold center>
            {t('tools.unavailable')}
          </Txt>
          <Gap size={8} />
          <Txt center color={colors.inkSoft}>
            {t(rec.error !== 'not-allowed' ? 'tools.unavailableSub' : web ? 'tools.micDeniedWeb' : 'tools.micDenied')}
          </Txt>
        </Card>
        <Gap />
        <BigButton label={t('tools.back')} onPress={back} />
      </Screen>
    );
  }

  const recent = utts.slice(-SHOWN_UTTERANCES);
  const pin = (w: string) => setPinned(stripPunct(w) || null);

  const listenButton = (
    <BigButton
      icon={rec.listening ? '⏸️' : '🎤'}
      tone={rec.listening ? 'selected' : 'primary'}
      label={rec.listening ? t('tools.pause') : t('tools.listen')}
      sublabel={rec.listening ? t('tools.sayItSub') : undefined}
      onPress={() => (rec.listening ? rec.stop() : rec.start())}
    />
  );

  // The conversation comes first and the controls after it, so the newest line stays in view without scrolling.
  return (
    <Screen>
      {header}
      {utts.length === 0 && <Txt color={colors.inkSoft}>{t('tools.wwwIntro')}</Txt>}

      {pinned && (
        <View style={{ backgroundColor: colors.accentSoft, borderRadius: radius.lg, padding: space.sm, marginVertical: space.xs }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ flexShrink: 1 }}>
              <Txt variant="small" color={colors.inkSoft}>
                📌 {t('tools.pinned')}
              </Txt>
              <Dir lang={lang}>
                <Txt variant="title">{pinned}</Txt>
              </Dir>
            </View>
            <BigButton tone="quiet" label={t('tools.unpin')} onPress={() => setPinned(null)} />
          </Row>
        </View>
      )}

      <Gap size={12} />
      {showRecap ? (
        <Recap utts={utts} lang={lang} onPin={pin} onClose={() => setShowRecap(false)} />
      ) : (
        <>
          <Card style={{ minHeight: 120 }}>
            {recent.length === 0 && !rec.interim ? (
              <Txt color={colors.inkSoft}>{t('tools.nothingYet')}</Txt>
            ) : (
              <Dir lang={lang}>
                {recent.map((u, i) => (
                  <TappableWords key={`${u.at}-${i}`} text={u.text} onPin={pin} faded={i < recent.length - 2} />
                ))}
                {rec.interim ? <BigText color={colors.inkSoft}>{rec.interim}</BigText> : null}
              </Dir>
            )}
          </Card>
          {recent.length > 0 && (
            <Txt variant="small" color={colors.inkSoft}>
              {t('tools.tapToPin')}
            </Txt>
          )}
          <Gap size={12} />
          {utts.length > 0 && <BigButton icon="💬" label={t('tools.recap')} onPress={() => setShowRecap(true)} />}
        </>
      )}
      {listenButton}
      {rec.error === 'network' && <Txt color={colors.hint}>{t('tools.networkError')}</Txt>}
      {utts.length > 0 && (
        <BigButton
          tone="quiet"
          label={t('tools.clear')}
          onPress={() => {
            setUtts([]);
            setShowRecap(false);
          }}
        />
      )}

      {langs.length > 1 && (
        <>
          <Gap size={12} />
          <Txt variant="small" bold>
            {t('tools.language')}
          </Txt>
          <Row style={{ flexWrap: 'wrap', gap: space.xs }}>
            {langs.map((l) => (
              <BigButton
                key={l}
                tone={l === lang ? 'selected' : 'secondary'}
                label={LANG_NAMES[l]}
                onPress={() => {
                  if (l === lang) return;
                  rec.stop();
                  setLang(l);
                }}
              />
            ))}
          </Row>
        </>
      )}

      <Gap />
      <Card style={{ backgroundColor: colors.bg }}>
        <Txt variant="small" color={colors.inkSoft}>
          🔒 {t(rec.onDevice ? 'tools.privacyDevice' : web ? 'tools.privacyServiceWeb' : 'tools.privacyServiceNative')}{' '}
          {t('tools.privacy')}
        </Txt>
      </Card>
    </Screen>
  );
}

function Recap({ utts, lang, onPin, onClose }: { utts: Utterance[]; lang: Lang; onPin: (w: string) => void; onClose: () => void }) {
  const { t } = useTranslation();
  const scale = useTextScale();
  const sentences = lastSentences(utts, 3);
  const topics = topicWords(utts, lang, 5);
  return (
    <>
      <Card style={{ borderColor: colors.accent, borderWidth: 2 }}>
        <Txt bold color={colors.inkSoft}>
          {t('tools.lastSaid')}
        </Txt>
        <Gap size={8} />
        <Dir lang={lang}>
          {sentences.map((s, i) => (
            <BigText key={`${i}-${s}`}>{s}</BigText>
          ))}
        </Dir>
        {topics.length > 0 && (
          <>
            <Gap />
            <Txt bold color={colors.inkSoft}>
              {t('tools.topics')}
            </Txt>
            <Gap size={8} />
            <Dir lang={lang}>
              <Row style={{ flexWrap: 'wrap', gap: space.xs }}>
                {topics.map((tp) => (
                  <Pressable
                    key={tp.key}
                    accessibilityRole="button"
                    accessibilityLabel={tp.word}
                    onPress={() => onPin(tp.word)}
                    style={{
                      minHeight: minTap * scale,
                      justifyContent: 'center',
                      paddingHorizontal: space.md,
                      borderRadius: radius.pill,
                      backgroundColor: colors.accentSoft,
                      borderWidth: 2,
                      borderColor: colors.accent,
                    }}>
                    <Txt bold>📌 {tp.word}</Txt>
                  </Pressable>
                ))}
              </Row>
            </Dir>
            <Txt variant="small" color={colors.inkSoft}>
              {t('tools.tapToPin')}
            </Txt>
          </>
        )}
      </Card>
      <BigButton tone="secondary" label={t('tools.hideRecap')} onPress={onClose} />
    </>
  );
}

/** Conversation text, larger than body text so it can be read at arm's length. */
function BigText({ children, color = colors.ink }: { children: ReactNode; color?: string }) {
  const scale = useTextScale();
  const size = fontBase.title * scale;
  return <Text style={{ fontSize: size, lineHeight: size * 1.35, color, marginBottom: space.xs }}>{children}</Text>;
}

/** Each word can be tapped to pin it as the topic. */
function TappableWords({ text, onPin, faded }: { text: string; onPin: (w: string) => void; faded: boolean }) {
  const words = text.split(/\s+/);
  return (
    <BigText color={faded ? colors.inkSoft : colors.ink}>
      {words.map((w, i) => (
        <Text key={i} onPress={() => onPin(w)}>
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </Text>
      ))}
    </BigText>
  );
}
