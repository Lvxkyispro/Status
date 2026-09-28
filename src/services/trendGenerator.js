/**
 * DEMO TREND GENERATOR
 * ------------------------------------------------------------------
 * Produces deterministic sample time series from monthly climatology so the
 * charts look realistic and stay identical between page reloads.
 * The last day of the daily series matches the location's current snapshot,
 * and the 30-day rainfall total matches `rainfall30d`.
 */

// Small seeded PRNG (mulberry32) so the demo is repeatable.
function seeded(seedStr) {
  let h = 1779033703;
  for (let i = 0; i < seedStr.length; i++) h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round1 = (v) => Math.round(v * 10) / 10;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function dailySeries(location, current, days = 30) {
  const rand = seeded(`${location.id}-daily`);
  const today = new Date();
  const m = today.getMonth();
  const climoT = location.climatology.temp[m];
  const climoH = location.climatology.humidity[m];

  // Rainfall: random weights for the first (days - 1) days, scaled so that the
  // 30-day total equals the snapshot value; the last day equals rainfall24h.
  const remaining = Math.max(0, current.rainfall30d - current.rainfall24h);
  const weights = Array.from({ length: days - 1 }, () => {
    const r = rand();
    return r < 0.3 ? 0 : Math.pow(r, 3); // dry days + occasional bursts
  });
  const wSum = weights.reduce((a, b) => a + b, 0) || 1;

  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const progress = i / (days - 1);
    const isLast = i === days - 1;

    const temp = isLast ? current.temperature : climoT + (current.temperature - climoT) * progress + (rand() - 0.5) * 2.4;
    const humidity = isLast ? current.humidity : clamp(climoH + (current.humidity - climoH) * progress + (rand() - 0.5) * 10, 8, 100);
    const rainfall = isLast ? current.rainfall24h : (weights[i] / wSum) * remaining;
    const spread = 3 + rand() * 2.5;

    return {
      label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      temp: round1(temp),
      tempMax: round1(temp + spread * 0.55),
      tempMin: round1(temp - spread * 0.45 - 1.5),
      rainfall: round1(rainfall),
      humidity: Math.round(humidity),
    };
  });
}

function monthlySeries(location) {
  const rand = seeded(`${location.id}-monthly`);
  const now = new Date();
  const { temp, rain, humidity } = location.climatology;
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const m = d.getMonth();
    const t = temp[m] + (rand() - 0.5) * 1.6;
    return {
      label: `${MONTHS[m]} ${String(d.getFullYear()).slice(2)}`,
      temp: round1(t),
      tempMax: round1(t + 4 + rand() * 1.5),
      tempMin: round1(t - 5 - rand() * 1.5),
      rainfall: Math.round(rain[m] * (0.6 + rand() * 0.8)),
      humidity: Math.round(clamp(humidity[m] + (rand() - 0.5) * 8, 8, 100)),
    };
  });
}

/** @param {'7d'|'30d'|'1y'} period */
export function generateTrend(location, current, period) {
  if (period === '1y') return monthlySeries(location);
  const daily = dailySeries(location, current, 30);
  return period === '7d' ? daily.slice(-7) : daily;
}
