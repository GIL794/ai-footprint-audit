// Generates data/benchmarks.js from data/benchmarks.json so the page also works
// when opened straight from disk (file://), where fetch() is blocked.
// Usage: node scripts/build-data.mjs          (write)
//        node scripts/build-data.mjs --check  (fail if out of date)
import fs from 'node:fs';
const src = new URL('../data/benchmarks.json', import.meta.url);
const out = new URL('../data/benchmarks.js', import.meta.url);
const json = JSON.parse(fs.readFileSync(src, 'utf8'));
const text =
  '// GENERATED from data/benchmarks.json by scripts/build-data.mjs. Do not edit by hand.\n' +
  'window.AI_FOOTPRINT_BENCHMARKS = ' + JSON.stringify(json, null, 2) + ';\n';
if (process.argv.includes('--check')) {
  const current = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
  if (current !== text) { console.error('data/benchmarks.js is out of date. Run: node scripts/build-data.mjs'); process.exit(1); }
  console.log('data/benchmarks.js is up to date');
} else {
  fs.writeFileSync(out, text);
  console.log('wrote data/benchmarks.js');
}
