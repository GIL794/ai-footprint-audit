/**
 * Pure calculation engine for AI vs. Everyday Environmental Footprint.
 * Shared between the browser UI and automated Node.js unit tests.
 */

export function computeFootprint({
  promptsPerDay = 25,
  burgersPerWeek = 2,
  streamingHoursPerDay = 1.5,
  includeEmbodied = false,
  promptWh = 0.24,
  promptWaterMl = 3.0,
  embodiedWh = 0.08,
  embodiedWaterMl = 0.6,
  burgerWaterL = 2500,
  burgerCo2Kg = 3.6,
  streamingWhPerHr = 77,
  gridCarbonGPerKwh = 380
}) {
  const DAYS_PER_YEAR = 365;
  const WEEKS_PER_YEAR = 52;

  const effectivePromptWh = promptWh + (includeEmbodied ? embodiedWh : 0);
  const effectivePromptWaterMl = promptWaterMl + (includeEmbodied ? embodiedWaterMl : 0);

  // Annual counts
  const annualPrompts = Math.max(0, promptsPerDay) * DAYS_PER_YEAR;
  const annualBurgers = Math.max(0, burgersPerWeek) * WEEKS_PER_YEAR;
  const annualStreamingHours = Math.max(0, streamingHoursPerDay) * DAYS_PER_YEAR;

  // Water (Liters / year)
  const aiWaterL = (annualPrompts * effectivePromptWaterMl) / 1000;
  const burgerWaterTotalL = annualBurgers * burgerWaterL;
  // Indirect water from electricity generation (~1.8 L/kWh thermoelectric average)
  const streamingWaterL = ((annualStreamingHours * streamingWhPerHr) / 1000) * 1.8;
  const totalWaterL = aiWaterL + burgerWaterTotalL + streamingWaterL;

  // Energy (kWh / year)
  const aiEnergyKwh = (annualPrompts * effectivePromptWh) / 1000;
  const streamingEnergyKwh = (annualStreamingHours * streamingWhPerHr) / 1000;
  // Energy embedded in beef supply chain (~12 kWh equivalent per burger)
  const burgerEnergyKwh = annualBurgers * 12.0;
  const totalEnergyKwh = aiEnergyKwh + streamingEnergyKwh + burgerEnergyKwh;

  // Carbon (kg CO2e / year)
  const aiCarbonKg = aiEnergyKwh * (gridCarbonGPerKwh / 1000);
  const streamingCarbonKg = streamingEnergyKwh * (gridCarbonGPerKwh / 1000);
  const burgerCarbonKg = annualBurgers * burgerCo2Kg;
  const totalCarbonKg = aiCarbonKg + streamingCarbonKg + burgerCarbonKg;

  // Equivalents
  const burgersEquivalentToYearOfAiWater = burgerWaterL > 0 ? aiWaterL / burgerWaterL : 0;
  const streamingHoursEquivalentToYearOfAiEnergy =
    streamingWhPerHr > 0 ? (aiEnergyKwh * 1000) / streamingWhPerHr : 0;

  return {
    annualCounts: {
      prompts: annualPrompts,
      burgers: annualBurgers,
      streamingHours: annualStreamingHours
    },
    effectivePerPrompt: {
      wh: Number(effectivePromptWh.toFixed(4)),
      waterMl: Number(effectivePromptWaterMl.toFixed(4))
    },
    waterL: {
      ai: Number(aiWaterL.toFixed(2)),
      burgers: Number(burgerWaterTotalL.toFixed(2)),
      streaming: Number(streamingWaterL.toFixed(2)),
      total: Number(totalWaterL.toFixed(2)),
      aiSharePct: totalWaterL > 0 ? Number(((aiWaterL / totalWaterL) * 100).toFixed(3)) : 0
    },
    energyKwh: {
      ai: Number(aiEnergyKwh.toFixed(2)),
      streaming: Number(streamingEnergyKwh.toFixed(2)),
      burgers: Number(burgerEnergyKwh.toFixed(2)),
      total: Number(totalEnergyKwh.toFixed(2)),
      aiSharePct: totalEnergyKwh > 0 ? Number(((aiEnergyKwh / totalEnergyKwh) * 100).toFixed(3)) : 0
    },
    carbonKg: {
      ai: Number(aiCarbonKg.toFixed(2)),
      streaming: Number(streamingCarbonKg.toFixed(2)),
      burgers: Number(burgerCarbonKg.toFixed(2)),
      total: Number(totalCarbonKg.toFixed(2)),
      aiSharePct: totalCarbonKg > 0 ? Number(((aiCarbonKg / totalCarbonKg) * 100).toFixed(3)) : 0
    },
    equivalents: {
      burgersForYearAiWater: Number(burgersEquivalentToYearOfAiWater.toFixed(3)),
      streamingHoursForYearAiEnergy: Number(streamingHoursEquivalentToYearOfAiEnergy.toFixed(2))
    }
  };
}
