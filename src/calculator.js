/**
 * Pure calculation and scenario logic for the AI footprint page.
 * Works as a plain <script> in the browser (including from file://) and as a
 * Node module for the tests. No dependencies.
 */
(function (root) {
  'use strict';

  var LIMITS = {
    promptsPerDay: [0, 300],
    burgersPerWeek: [0, 14],
    streamingHoursPerDay: [0, 8]
  };
  var OVERRIDE_MAX = 1e6;
  var TABS = ['personalWater', 'digitalEnergy', 'growth'];
  var TAB_ALIASES = { jevons: 'growth', globalWater: 'personalWater' };
  // URL parameter -> override key
  var OVERRIDE_PARAMS = {
    pWh: 'promptWh',
    pMl: 'promptWaterMl',
    bCo2: 'burgerCo2Kg',
    sWh: 'streamingWhPerHr',
    gCo2: 'gridCarbonGPerKwh'
  };
  var DEFAULTS = { promptsPerDay: 25, burgersPerWeek: 2, streamingHoursPerDay: 1.5 };

  function r(n, d) { return Number(Number(n).toPrecision(12)); }
  function share(part, total) { return total > 0 ? r((part / total) * 100, 3) : 0; }

  function computeFootprint(o) {
    o = o || {};
    var promptsPerDay = o.promptsPerDay === undefined ? 25 : o.promptsPerDay;
    var burgersPerWeek = o.burgersPerWeek === undefined ? 2 : o.burgersPerWeek;
    var streamingHoursPerDay = o.streamingHoursPerDay === undefined ? 1.5 : o.streamingHoursPerDay;
    var promptWh = o.promptWh === undefined ? 0.24 : o.promptWh;
    var promptWaterMl = o.promptWaterMl === undefined ? 0.26 : o.promptWaterMl;
    var burgerCo2Kg = o.burgerCo2Kg === undefined ? 14.92 : o.burgerCo2Kg;
    var streamingWhPerHr = o.streamingWhPerHr === undefined ? 77 : o.streamingWhPerHr;
    var gridCarbonGPerKwh = o.gridCarbonGPerKwh === undefined ? 458 : o.gridCarbonGPerKwh;

    var annualPrompts = Math.max(0, promptsPerDay) * 365;
    var annualBurgers = Math.max(0, burgersPerWeek) * 52;
    var annualStreamingHours = Math.max(0, streamingHoursPerDay) * 365;

    // Energy (kWh / year). Burger supply-chain energy is not modelled: the
    // earlier 12 kWh per burger figure had no source.
    var aiEnergyKwh = (annualPrompts * promptWh) / 1000;
    var streamingEnergyKwh = (annualStreamingHours * streamingWhPerHr) / 1000;
    var totalEnergyKwh = aiEnergyKwh + streamingEnergyKwh;

    // Water (litres / year): AI only. Burger water is a different kind of
    // quantity (mostly rain) and is deliberately not combined with it.
    // Only figures with a published source are used.
    // Video streaming water is not estimated: no sourced factor for the water
    // behind electricity was found, so it is left out rather than guessed.
    var aiWaterL = (annualPrompts * promptWaterMl) / 1000;

    // Carbon (kg CO2e / year)
    var aiCarbonKg = aiEnergyKwh * (gridCarbonGPerKwh / 1000);
    var streamingCarbonKg = streamingEnergyKwh * (gridCarbonGPerKwh / 1000);
    var burgerCarbonKg = annualBurgers * burgerCo2Kg;
    var totalCarbonKg = aiCarbonKg + streamingCarbonKg + burgerCarbonKg;

    return {
      annualCounts: { prompts: annualPrompts, burgers: annualBurgers, streamingHours: annualStreamingHours },
      effectivePerPrompt: { wh: r(promptWh, 4), waterMl: r(promptWaterMl, 4) },
      waterL: { ai: r(aiWaterL, 2) },
      energyKwh: {
        ai: r(aiEnergyKwh, 2),
        streaming: r(streamingEnergyKwh, 2),
        total: r(totalEnergyKwh, 2),
        aiSharePct: share(aiEnergyKwh, totalEnergyKwh),
        streamingSharePct: share(streamingEnergyKwh, totalEnergyKwh)
      },
      carbonKg: {
        ai: r(aiCarbonKg, 2),
        streaming: r(streamingCarbonKg, 2),
        burgers: r(burgerCarbonKg, 2),
        total: r(totalCarbonKg, 2),
        aiSharePct: share(aiCarbonKg, totalCarbonKg),
        streamingSharePct: share(streamingCarbonKg, totalCarbonKg),
        burgersSharePct: share(burgerCarbonKg, totalCarbonKg)
      },
      equivalents: {
        streamingHoursForYearAiEnergy: streamingWhPerHr > 0 ? r((aiEnergyKwh * 1000) / streamingWhPerHr, 2) : null
      }
    };
  }

  function clampNum(value, def, min, max) {
    if (value === null || value === undefined || value === '') return def;
    var n = Number(value);
    if (!isFinite(n)) return def;
    return Math.min(max, Math.max(min, n));
  }

  function validOverride(value) {
    if (value === null || value === undefined || value === '') return null;
    var n = Number(value);
    if (!isFinite(n) || n < 0 || n > OVERRIDE_MAX) return null;
    return n;
  }

  /**
   * Turn URL query parameters into a safe scenario. Anything missing, not a
   * number, out of range or unknown falls back to the default, so a bad link
   * can never put NaN on the page.
   */
  function parseScenario(params) {
    var get = function (k) { return params && params.has && params.has(k) ? params.get(k) : null; };
    var tab = get('tab');
    if (TAB_ALIASES[tab]) tab = TAB_ALIASES[tab];
    var overrides = {};
    Object.keys(OVERRIDE_PARAMS).forEach(function (p) {
      overrides[OVERRIDE_PARAMS[p]] = validOverride(get(p));
    });
    return {
      mode: get('mode') === 'conservative' ? 'conservative' : 'modern',
      burgerSystem: get('beef') === 'dairy' ? 'dairy' : 'beef',
      logScale: get('scale') === 'log',
      tab: TABS.indexOf(tab) >= 0 ? tab : TABS[0],
      promptsPerDay: clampNum(get('prompts'), DEFAULTS.promptsPerDay, LIMITS.promptsPerDay[0], LIMITS.promptsPerDay[1]),
      burgersPerWeek: clampNum(get('burgers'), DEFAULTS.burgersPerWeek, LIMITS.burgersPerWeek[0], LIMITS.burgersPerWeek[1]),
      streamingHoursPerDay: clampNum(get('stream'), DEFAULTS.streamingHoursPerDay, LIMITS.streamingHoursPerDay[0], LIMITS.streamingHoursPerDay[1]),
      overrides: overrides
    };
  }

  /** Write a scenario back to URL parameters. Only non-default values are written. */
  function scenarioToParams(state) {
    var p = new URLSearchParams();
    if (state.mode !== 'modern') p.set('mode', state.mode);
    if (state.burgerSystem === 'dairy') p.set('beef', 'dairy');
    if (state.logScale) p.set('scale', 'log');
    if (state.tab !== TABS[0]) p.set('tab', state.tab);
    if (state.promptsPerDay !== DEFAULTS.promptsPerDay) p.set('prompts', state.promptsPerDay);
    if (state.burgersPerWeek !== DEFAULTS.burgersPerWeek) p.set('burgers', state.burgersPerWeek);
    if (state.streamingHoursPerDay !== DEFAULTS.streamingHoursPerDay) p.set('stream', state.streamingHoursPerDay);
    Object.keys(OVERRIDE_PARAMS).forEach(function (k) {
      var v = state.overrides[OVERRIDE_PARAMS[k]];
      if (v !== null && v !== undefined) p.set(k, v);
    });
    return p;
  }

  /** The value in use for each overridable constant: the override, else the default. */
  function effectiveConstants(state, bench) {
    var m = bench.modes[state.mode];
    var c = bench.constants;
    var o = state.overrides || {};
    var pick = function (v, d) { return v === null || v === undefined ? d : v; };
    return {
      promptWh: pick(o.promptWh, m.prompt_wh),
      promptWaterMl: pick(o.promptWaterMl, m.prompt_water_ml),
      burgerCo2Kg: pick(o.burgerCo2Kg, (state.burgerSystem === 'dairy' ? c.burger_co2e_dairy_kg : c.burger_co2e_kg).value),
      streamingWhPerHr: pick(o.streamingWhPerHr, c.streaming_hd_wh_per_hr.value),
      gridCarbonGPerKwh: pick(o.gridCarbonGPerKwh, c.grid_carbon_intensity_g_per_kwh.value)
    };
  }

  function hasOverrides(state) {
    return Object.keys(state.overrides || {}).some(function (k) {
      return state.overrides[k] !== null && state.overrides[k] !== undefined;
    });
  }

  /** Arguments for computeFootprint, for the scenario's mode and overrides. */
  function buildInputs(state, bench, modeOverride) {
    var mode = modeOverride || state.mode;
    var s = modeOverride ? { mode: mode, overrides: state.overrides, burgerSystem: state.burgerSystem } : state;
    var e = effectiveConstants(s, bench);
    return {
      promptsPerDay: state.promptsPerDay,
      burgersPerWeek: state.burgersPerWeek,
      streamingHoursPerDay: state.streamingHoursPerDay,
      promptWh: e.promptWh,
      promptWaterMl: e.promptWaterMl,
      burgerCo2Kg: e.burgerCo2Kg,
      streamingWhPerHr: e.streamingWhPerHr,
      gridCarbonGPerKwh: e.gridCarbonGPerKwh
    };
  }

  var api = {
    OVERRIDE_MAX: OVERRIDE_MAX, LIMITS: LIMITS, TABS: TABS, DEFAULTS: DEFAULTS,
    computeFootprint: computeFootprint, parseScenario: parseScenario,
    scenarioToParams: scenarioToParams, effectiveConstants: effectiveConstants,
    hasOverrides: hasOverrides, buildInputs: buildInputs
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AIFootprint = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
