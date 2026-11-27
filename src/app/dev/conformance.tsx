import { useState } from 'react';
import { Platform, View } from 'react-native';

import { Card, Gap, Screen, Txt } from '@/components/ui';
import { VECTORS, VECTOR_SOURCE } from '@/dev/conformance';
import { runConformance } from '@/engine/conformance';
import { colors } from '@/lib/theme';

/**
 * Development check: runs learn-sdk's scheduling, due-items and matching
 * vectors in this JavaScript engine. On a device build that's Hermes, which
 * sdk-core ADR 0069 asks to verify before ui/native and learn-sdk/native
 * leave experimental.
 */
export default function ConformanceScreen() {
  // Runs once, in the state initialiser, so the timing covers only the vectors.
  const [results] = useState(() => {
    const started = Date.now();
    const r = VECTORS.map(runConformance);
    return { r, ms: Date.now() - started };
  });
  const failed = results.r.reduce((n, s) => n + s.failed.length, 0);
  const engine = (globalThis as { HermesInternal?: unknown }).HermesInternal ? 'Hermes' : 'not Hermes';

  return (
    <Screen>
      <Txt variant="title">learn-sdk conformance</Txt>
      <Txt color={colors.inkSoft}>
        {Platform.OS} · {engine} · {results.ms} ms · sdk-core {VECTOR_SOURCE.commit.slice(0, 7)}
      </Txt>
      <Gap />
      <Txt variant="huge" bold color={failed ? colors.hint : colors.good}>
        {failed ? `${failed} failed` : 'All passed ✓'}
      </Txt>
      <Gap />
      {results.r.map((s) => (
        <Card key={s.subject} style={{ marginBottom: 12 }}>
          <Txt bold>{s.subject}</Txt>
          <Txt>
            {s.passed} passed · {s.skipped} skipped · {s.failed.length} failed
          </Txt>
          {s.failed.map((f) => (
            <View key={f.name} style={{ marginTop: 6 }}>
              <Txt variant="small" bold>
                {f.name}
              </Txt>
              <Txt variant="small" color={colors.inkSoft}>
                {f.detail}
              </Txt>
            </View>
          ))}
        </Card>
      ))}
    </Screen>
  );
}
