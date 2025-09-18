import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const root = path.dirname(fileURLToPath(import.meta.url));
const tests = [
  'tests/auth.test.mjs',
  'tests/summary.test.mjs'
];

let failed = 0;
for (const t of tests) {
  const p = path.join(root, t);
  if (!fs.existsSync(p)) {
    console.error('Missing test', p);
    failed++;
    continue;
  }
  console.log('Running', t);
  const out = spawnSync('node', [p], { stdio: 'inherit' });
  if (out.status !== 0) {
    console.error('Test failed:', t);
    failed++;
  }
}

if (failed) {
  console.error(`${failed} tests failed`);
  process.exit(1);
}
console.log('All tests passed');
