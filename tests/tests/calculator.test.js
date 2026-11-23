import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { computeFootprint } from '../src/calculator.js';

const benchmarks = JSON.parse(fs.readFileSync(new URL('../data/benchmarks.json', import.meta.url), 'utf8'));

test('benchmarks.json adheres to required schema and positive bounds', () => {
  assert.ok(benchmarks.modes.modern.prompt_wh > 0);
  assert.ok(benchmarks.modes.conservative.prompt_wh > benchmarks.modes.modern.prompt_wh);
  assert.ok(benchmarks.constants.burger_water_l.value > 0);
  assert.ok(benchmarks.constants.streaming_hd_wh_per_hr.value > 0);
});

test('computeFootprint calculates modern baseline accurately', () => {
  const res = computeFootprint({
    promptsPerDay: 100, // 36,500 prompts/yr
    burgersPerWeek: 1,  // 52 burgers/yr
    streamingHoursPerDay: 1, // 365 hrs/yr
    includeEmbodied: false,
    promptWh: 0.24,
    promptWaterMl: 3.0,
    burgerWaterL: 2500,
    streamingWhPerHr: 77,
    gridCarbonGPerKwh: 380
  });

  // 36,500 * 3 mL = 109.5 L/yr
  assert.equal(res.waterL.ai, 109.5);
  // 52 * 2500 L = 130,000 L/yr
  assert.equal(res.waterL.burgers, 130000);
  // 36,500 * 0.24 Wh = 8.76 kWh/yr
  assert.equal(res.energyKwh.ai, 8.76);
  // 365 * 77 Wh = 28.105 -> 28.11 kWh/yr
  assert.equal(res.energyKwh.streaming, 28.11);
});

test('includeEmbodied toggle adds amortized training & hardware overhead', () => {
  const withoutEmbodied = computeFootprint({
    promptsPerDay: 50,
    includeEmbodied: false,
    promptWh: 0.24,
    promptWaterMl: 3.0,
    embodiedWh: 0.08,
    embodiedWaterMl: 0.6
  });

  const withEmbodied = computeFootprint({
    promptsPerDay: 50,
    includeEmbodied: true,
    promptWh: 0.24,
    promptWaterMl: 3.0,
    embodiedWh: 0.08,
    embodiedWaterMl: 0.6
  });

  assert.equal(withoutEmbodied.effectivePerPrompt.wh, 0.24);
  assert.equal(withEmbodied.effectivePerPrompt.wh, 0.32);
  assert.ok(withEmbodied.waterL.ai > withoutEmbodied.waterL.ai);
});

test('zero inputs do not produce NaN or division by zero', () => {
  const res = computeFootprint({
    promptsPerDay: 0,
    burgersPerWeek: 0,
    streamingHoursPerDay: 0
  });
  assert.equal(res.waterL.aiSharePct, 0);
  assert.equal(res.energyKwh.aiSharePct, 0);
  assert.equal(res.carbonKg.aiSharePct, 0);
});
