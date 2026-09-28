/**
 * ALERT GENERATION
 * ------------------------------------------------------------------
 * Turns risk-analysis results into user-facing alerts with a severity
 * level and recommended actions (the "User Awareness" step).
 */
import { RISK_TYPES } from '../data/riskTypes';

const TEMPLATES = {
  heavyRain: {
    High: { title: 'Heavy rainfall warning', msg: (c) => `Very heavy rainfall of ${c.rainfall24h} mm recorded in the last 24 hours. More intense spells are likely.` },
    Moderate: { title: 'Heavy rainfall warning', msg: (c) => `Heavy rainfall (${c.rainfall24h} mm in 24 h). Localised waterlogging is possible.` },
    Low: { title: 'Rainfall advisory', msg: (c) => `Light to moderate showers (${c.rainfall24h} mm in 24 h). No major impact expected.` },
  },
  flood: {
    High: { title: 'Flood risk notification', msg: () => 'High risk of urban flooding and waterlogging in low-lying areas. Transport disruption likely.' },
    Moderate: { title: 'Flood risk notification', msg: () => 'Moderate flood risk. Drains and rivers are running high in vulnerable localities.' },
    Low: { title: 'Flood watch', msg: () => 'Low flood risk. Known waterlogging points should be monitored.' },
  },
  heat: {
    High: { title: 'High temperature warning', msg: (c, r) => `Temperature ${c.temperature} °C with a feels-like value of ${r.feelsLike} °C. Heat-wave conditions.` },
    Moderate: { title: 'High temperature warning', msg: (c, r) => `Feels-like temperature of ${r.feelsLike} °C. Heat stress possible during the afternoon.` },
    Low: { title: 'Heat advisory', msg: (c, r) => `Warm conditions (feels like ${r.feelsLike} °C). Stay hydrated.` },
  },
  drought: {
    High: { title: 'Drought / water-stress alert', msg: (c, r) => `Rainfall deficit of ${r.rainfallDeficitPct}% over the last 30 days with very dry air. Water stress for crops and supply.` },
    Moderate: { title: 'Drought / water-stress alert', msg: (c, r) => `Rainfall ${r.rainfallDeficitPct}% below normal over 30 days. Conserve water.` },
    Low: { title: 'Rainfall deficit watch', msg: (c, r) => `Rainfall ${r.rainfallDeficitPct}% below normal for the month. Situation being monitored.` },
  },
};

const ACTIONS = {
  heavyRain: ['Avoid unnecessary travel during intense spells', 'Stay away from drains, nullahs and the seafront', 'Keep a torch, charged phone and emergency kit ready'],
  flood: ['Do not walk or drive through flooded roads', 'Move valuables and electrical items to higher levels', 'Follow municipal / NDMA advisories and helpline 1916 / 112'],
  heat: ['Avoid outdoor work between 12 pm and 4 pm', 'Drink water frequently; use ORS if needed', 'Check on elderly people, children and outdoor workers'],
  drought: ['Use water sparingly; fix leaks', 'Farmers: follow contingency crop advisories', 'Store drinking water safely'],
  wind: ['Secure loose objects on balconies and rooftops', 'Stay away from weak trees, hoardings and power lines', 'Fishermen should not venture into the sea'],
};

// Fixed offsets so the demo alert list looks the same every time it is opened.
const ISSUED_MINUTES_AGO = { heavyRain: 35, flood: 50, heat: 95, drought: 360, wind: 20 };

export function generateAlerts(location, current, risk) {
  const now = Date.now();
  const areasFor = (type) =>
    location.zones.filter((z) => z.type === type && z.level !== 'Low').map((z) => z.name);

  const alerts = risk.categories
    .filter((c) => c.score >= 15) // below 15 the hazard is negligible
    .map((c) => {
      const t = TEMPLATES[c.type][c.level];
      const areas = areasFor(c.type);
      return {
        id: `${location.id}-${c.type}`,
        type: c.type,
        category: RISK_TYPES[c.type].label,
        severity: c.level,
        score: c.score,
        title: t.title,
        message: t.msg(current, risk),
        areas: areas.length ? areas : [`${location.name} district`],
        issuedAt: new Date(now - ISSUED_MINUTES_AGO[c.type] * 60000),
        validHours: c.level === 'High' ? 24 : 48,
        actions: ACTIONS[c.type],
      };
    });

  if (current.windSpeed >= 40) {
    alerts.push({
      id: `${location.id}-wind`,
      type: 'wind',
      category: 'Strong Wind',
      severity: current.windSpeed >= 60 ? 'High' : 'Moderate',
      score: Math.min(100, Math.round(current.windSpeed * 1.2)),
      title: 'Strong wind advisory',
      message: `Gusty winds of ${current.windSpeed} km/h along the coast. Rough sea conditions.`,
      areas: [`${location.name} coastal areas`],
      issuedAt: new Date(now - ISSUED_MINUTES_AGO.wind * 60000),
      validHours: 12,
      actions: ACTIONS.wind,
    });
  }

  const rank = { High: 0, Moderate: 1, Low: 2 };
  return alerts.sort((a, b) => rank[a.severity] - rank[b.severity] || b.score - a.score);
}
