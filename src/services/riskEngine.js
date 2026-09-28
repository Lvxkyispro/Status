/**
 * RISK ANALYSIS ENGINE
 * ------------------------------------------------------------------
 * Converts climate indicators into hazard scores (0–100) using simple,
 * explainable rules. Each score is scaled by the location's exposure /
 * vulnerability factor. Thresholds are loosely based on IMD conventions:
 *   - Heavy rain: 64.5–115.5 mm/24h, very heavy: 115.6–204.4 mm/24h
 *   - Heat wave: max temperature ≥ 40 °C (plains)
 *
 * NOTE: This is an educational model for the prototype, not an
 * operational forecasting method.
 */
import { levelFromScore } from '../data/riskTypes';

const clamp = (v, min = 0, max = 100) => Math.min(max, Math.max(min, v));

/** Heat index (feels-like) in °C using the NOAA Rothfusz regression. */
export function heatIndexC(tempC, rh) {
  const T = (tempC * 9) / 5 + 32;
  if (T < 80) return tempC;
  const HI =
    -42.379 + 2.04901523 * T + 10.14333127 * rh - 0.22475541 * T * rh -
    0.00683783 * T * T - 0.05481717 * rh * rh + 0.00122874 * T * T * rh +
    0.00085282 * T * rh * rh - 0.00000199 * T * T * rh * rh;
  return Math.max(tempC, ((HI - 32) * 5) / 9);
}

/**
 * @param {object} c  current conditions { temperature, rainfall24h, humidity, rainfall30d, normalRain30d }
 * @param {object} v  vulnerability factors { flood, heavyRain, heat, drought } in 0–1
 */
export function analyseRisk(c, v) {
  const feelsLike = heatIndexC(c.temperature, c.humidity);

  // Heat: worst of absolute temperature and humid heat stress.
  const tempPart = ((c.temperature - 30) / 15) * 100; // 30 °C → 0, 45 °C → 100
  const hiPart = ((feelsLike - 32) / 26) * 100; // 32 °C → 0, 58 °C → 100
  const heat = clamp(Math.max(tempPart, hiPart)) * (0.6 + 0.4 * v.heat);

  // Heavy rainfall: 24h accumulation, 150 mm ≈ 100.
  const heavyRain = clamp((c.rainfall24h / 150) * 100) * (0.7 + 0.3 * v.heavyRain);

  // Flood: short-term intensity + 30-day soil saturation.
  const flood =
    clamp((0.6 * (c.rainfall24h / 150) + 0.4 * (c.rainfall30d / 600)) * 100) * (0.5 + 0.5 * v.flood);

  // Drought: rainfall deficit vs. normal + dry air.
  const deficit = Math.max(0, 1 - c.rainfall30d / Math.max(c.normalRain30d, 1));
  const dryness = Math.max(0, (60 - c.humidity) / 60);
  const drought = clamp((0.7 * deficit + 0.3 * dryness) * 100) * (0.5 + 0.5 * v.drought);

  const scores = {
    flood: Math.round(flood),
    heavyRain: Math.round(heavyRain),
    heat: Math.round(heat),
    drought: Math.round(drought),
  };

  const categories = Object.entries(scores)
    .map(([type, score]) => ({ type, score, level: levelFromScore(score) }))
    .sort((a, b) => b.score - a.score);

  // Overall risk = the dominant hazard (highest category score).
  const dominant = categories[0];

  return {
    feelsLike: Math.round(feelsLike * 10) / 10,
    rainfallDeficitPct: Math.round(deficit * 100),
    categories,
    overall: { score: dominant.score, level: dominant.level, dominantType: dominant.type },
  };
}
