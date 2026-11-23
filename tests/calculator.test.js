import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const calc = require('../src/calculator.js');
const { computeFootprint, parseScenario, scenarioToParams, buildInputs, effectiveConstants, hasOverrides } = calc;
const bench = JSON.parse(fs.readFileSync(new URL('../data/benchmarks.json', import.meta.url), 'utf8'));
const q = (s) => new URLSearchParams(s);

test('benchmarks.json has the required fields and positive values', () => {
  for (const k of ['modern', 'conservative']) {
    const m = bench.modes[k];
    for (const f of ['prompt_wh', 'prompt_water_ml']) assert.ok(m[f] > 0, `${k}.${f}`);
    assert.equal(typeof m.prompt_water_includes_power_plant_water, 'boolean');
    assert.ok(bench.status_key[m.prompt_wh_status], `${k} wh status`);
    assert.ok(bench.status_key[m.prompt_water_status], `${k} water status`);
  }
  assert.ok(bench.modes.conservative.prompt_wh > bench.modes.modern.prompt_wh);
});

test('every numeric constant has a source, a known status and a sensible range', () => {
  const constants = Object.entries(bench.constants).filter(([, c]) => c && !Array.isArray(c) && typeof c === 'object' && c.value !== undefined);
  assert.ok(constants.length >= 6);
  for (const [k, c] of constants) {
    assert.ok(c.value > 0, k);
    assert.ok(c.source && c.source.length > 5, `${k} source`);
    assert.ok(bench.status_key[c.status], `${k} status`);
    if (c.range) assert.ok(c.range[0] <= c.value && c.value <= c.range[1], `${k} range contains value`);
  }
});

test('generated data/benchmarks.js matches benchmarks.json', () => {
  const js = fs.readFileSync(new URL('../data/benchmarks.js', import.meta.url), 'utf8');
  const parsed = JSON.parse(js.slice(js.indexOf('{'), js.lastIndexOf('}') + 1));
  assert.deepEqual(parsed, bench);
});

test('default scenario reproduces the headline numbers (Modern estimate)', () => {
  const s = parseScenario(q(''));
  const r = computeFootprint(buildInputs(s, bench));
  // 25 prompts/day * 365 = 9125 prompts
  assert.equal(r.annualCounts.prompts, 9125);
  // Electricity: 9125 * 0.24 Wh = 2.19 kWh
  assert.equal(r.energyKwh.ai, 2.19);
  // Carbon: 2.19 kWh * 458 g/kWh = 1.00 kg
  assert.equal(r.carbonKg.ai, 1.0);
  // Water, on-site only: 9125 * 0.26 mL = 2.3725 L (no power-plant water is added)
  assert.equal(r.waterL.ai, 2.37);
});

test('Conservative estimate uses its own water figure unchanged', () => {
  const s = parseScenario(q('mode=conservative'));
  const r = computeFootprint(buildInputs(s, bench));
  // 9125 * 10 mL = 91.25 L
  assert.equal(r.waterL.ai, 91.25);
  assert.equal(r.energyKwh.ai, 26.46);
});

test('streaming, burger and total arithmetic', () => {
  const r = computeFootprint({ promptsPerDay: 100, burgersPerWeek: 1, streamingHoursPerDay: 1, promptWh: 0.24, promptWaterMl: 0.26, burgerCo2Kg: 10, streamingWhPerHr: 77, gridCarbonGPerKwh: 400, });
  assert.deepEqual(Object.keys(r.waterL), ['ai']); // no burger water, total or share: different kinds of water
  assert.equal(r.energyKwh.streaming, 28.11); // 365 h * 77 Wh
  assert.equal(r.waterL.streaming, undefined); // streaming water is not estimated
  assert.equal(r.carbonKg.burgers, 520);
  assert.equal(r.carbonKg.streaming, 11.24); // 28.105 kWh * 0.4
  assert.equal(r.energyKwh.total, r.energyKwh.ai + r.energyKwh.streaming);
});

test('removed unsourced figures are really gone from the data and the code', () => {
  const text = fs.readFileSync(new URL('../data/benchmarks.json', import.meta.url), 'utf8');
  const code = fs.readFileSync(new URL('../src/calculator.js', import.meta.url), 'utf8');
  for (const k of ['indirect_water_l_per_kwh', 'global_agriculture_blue_water_km3', 'global_ai_datacenter_water_2028_km3', 'embodied_training']) {
    assert.ok(!Object.keys(bench.constants).includes(k) && !text.includes('"' + k), k);
  }
  assert.ok(!/embodied|indirectWater/i.test(code));
  assert.ok(bench.removed_figures.length >= 5);
});

test('burger carbon: two sourced systems, no average between them', () => {
  assert.equal(bench.constants.burger_co2e_kg.value, 14.92);
  assert.equal(bench.constants.burger_co2e_dairy_kg.value, 4.99);
  const beef = effectiveConstants(parseScenario(q('')), bench).burgerCo2Kg;
  const dairy = effectiveConstants(parseScenario(q('beef=dairy')), bench).burgerCo2Kg;
  assert.equal(beef, 14.92);
  assert.equal(dairy, 4.99);
  assert.equal(scenarioToParams(parseScenario(q('beef=dairy'))).toString(), 'beef=dairy');
  // a custom value still wins over the system
  assert.equal(effectiveConstants(parseScenario(q('beef=dairy&bCo2=7')), bench).burgerCo2Kg, 7);
});

test('the Google water figure is on-site only and the page data says so', () => {
  assert.equal(bench.modes.modern.prompt_water_includes_power_plant_water, false);
  assert.match(bench.modes.modern.description, /power plants/);
  assert.match(bench.modes.modern.description, /Other chatbots/);
});

test('zero inputs never give NaN or divide by zero', () => {
  const r = computeFootprint({ promptsPerDay: 0, burgersPerWeek: 0, streamingHoursPerDay: 0 });
  const flat = JSON.stringify(r);
  assert.ok(!/NaN|Infinity|null/.test(flat), flat);
  assert.equal(r.waterL.ai, 0);
});

test('malformed URL values fall back to defaults and never produce NaN', () => {
  const s = parseScenario(q('prompts=abc&burgers=-5&stream=99&tab=zzz&pWh=hello&pMl=-3&bL=&sWh=Infinity&gCo2=1e99&mode=%3Cb%3E&scale=sideways'));
  assert.equal(s.promptsPerDay, 25);
  assert.equal(s.burgersPerWeek, 0);          // clamped to the slider's minimum
  assert.equal(s.streamingHoursPerDay, 8);    // clamped to the slider's maximum
  assert.equal(s.tab, 'personalWater');
  assert.equal(s.mode, 'modern');
  assert.equal(s.burgerSystem, 'beef');
  assert.equal(s.logScale, false);
  assert.ok(Object.values(s.overrides).every((v) => v === null));
  const flat = JSON.stringify(computeFootprint(buildInputs(s, bench)));
  assert.ok(!/NaN|Infinity/.test(flat));
  assert.ok(!/NaN/.test(scenarioToParams(s).toString()));
});

test('valid overrides are kept and an old tab name still works', () => {
  const s = parseScenario(q('pWh=0.55&gCo2=300&tab=jevons&mode=conservative'));
  assert.equal(s.overrides.promptWh, 0.55);
  assert.equal(s.overrides.gridCarbonGPerKwh, 300);
  assert.equal(s.tab, 'growth');
  assert.ok(hasOverrides(s));
});

test('overrides apply one at a time, so a Conservative link with one override keeps the other Conservative value', () => {
  const s = parseScenario(q('mode=conservative&pWh=2.9'));
  const e = effectiveConstants(s, bench);
  assert.equal(e.promptWh, 2.9);
  assert.equal(e.promptWaterMl, bench.modes.conservative.prompt_water_ml);
});

test('scenario survives a round trip through URL parameters', () => {
  const s = parseScenario(q('mode=conservative&beef=dairy&scale=log&tab=growth&prompts=100&burgers=3&stream=2.5&pWh=0.55&bCo2=7.5'));
  const back = parseScenario(scenarioToParams(s));
  assert.deepEqual(back, s);
  assert.equal(scenarioToParams(parseScenario(q(''))).toString(), '');
});

test('every figure the page relies on is verified or derived, and no invented ranges remain', () => {
  assert.equal(bench.modes.conservative.prompt_wh_status, 'verified');
  assert.equal(bench.constants.streaming_hd_wh_per_hr.status, 'verified');
  for (const [k, c] of Object.entries(bench.constants)) {
    if (c && typeof c === 'object' && !Array.isArray(c) && c.value !== undefined) assert.equal(c.range, undefined, k + ' has an unpublished range');
  }
  const flagged = Object.entries(bench.constants).filter(([, c]) => c && c.status && ['unverified', 'editor_estimate'].includes(c.status));
  assert.deepEqual(flagged, []);
});

test('the page never shows a water ratio or share between AI and burgers', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(!/stack-water|burgerWaterL|water-share/.test(html));
  assert.ok(/Why there is no water comparison/.test(html));
});
