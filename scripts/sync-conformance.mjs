// Copies learn-sdk's conformance vectors that Remindable runs on devices (Hermes).
// They live in the sdk-core monorepo and aren't shipped in the npm package.
// Usage: node scripts/sync-conformance.mjs [git-ref]   (default: main)
import { writeFileSync } from 'node:fs';

const ref = process.argv[2] ?? 'main';
const SUBJECTS = ['hm-learn-scheduling', 'hm-learn-due-items', 'hm-learn-matching'];
const base = `https://raw.githubusercontent.com/ie-huss-martinez/sdk-core/${ref}/packages/learn-sdk/conformance`;

const sha = await (await fetch(`https://api.github.com/repos/ie-huss-martinez/sdk-core/commits/${ref}`)).json();
for (const subject of SUBJECTS) {
  const res = await fetch(`${base}/${subject}.json`);
  if (!res.ok) throw new Error(`${subject}: HTTP ${res.status}`);
  const doc = await res.json();
  if (doc.format !== 'hm-conformance' || doc.subject !== subject) throw new Error(`${subject}: unexpected document`);
  writeFileSync(new URL(`../src/dev/conformance/${subject}.json`, import.meta.url), JSON.stringify(doc, null, 2) + '\n');
}
writeFileSync(
  new URL('../src/dev/conformance/source.json', import.meta.url),
  JSON.stringify({ repo: 'ie-huss-martinez/sdk-core', path: 'packages/learn-sdk/conformance', commit: sha.sha }, null, 2) + '\n',
);
console.log(`Synced ${SUBJECTS.length} files from ${sha.sha}`);
