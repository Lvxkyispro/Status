/**
 * CLIMATE DATA SERVICE  (single integration point for data sources)
 * ------------------------------------------------------------------
 * The UI never reads the demo data directly — it calls the async functions
 * below. To connect real sources later, replace the body of a function and
 * keep the returned shape the same. Candidate free/public sources:
 *
 *   - Open-Meteo (weather + historical, no API key)   → getCurrentConditions, getTrend
 *   - India Meteorological Department (IMD) warnings   → getAlerts
 *   - NASA POWER / ERA5 climate reanalysis             → getTrend (long-term)
 *   - ISRO Bhuvan / NDMA hazard layers (GIS)           → getRiskZones
 *   - A backend DB (PostgreSQL + PostGIS / MongoDB)    → store history & user alerts
 *
 * Data mode is set with VITE_DATA_MODE in a .env file:
 *   demo (default) → built-in sample data, fully offline
 *   live           → current conditions from Open-Meteo; falls back to demo on error
 */
import { LOCATIONS, getLocationById } from '../data/locations';
import { analyseRisk } from './riskEngine';
import { generateAlerts } from './alertEngine';
import { generateTrend } from './trendGenerator';

export const DATA_MODE = (import.meta.env.VITE_DATA_MODE || 'demo').toLowerCase();

// Simulated network latency so loading states are visible in the demo.
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function getLocations() {
  return LOCATIONS.map(({ id, name, state, coords, zoom, climateZone }) => ({ id, name, state, coords, zoom, climateZone }));
}

async function fetchOpenMeteoCurrent(loc) {
  const [lat, lon] = loc.coords;
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation' +
    '&daily=precipitation_sum&past_days=30&forecast_days=1&timezone=auto';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
    const j = await res.json();
    const rain = j.daily.precipitation_sum.map((v) => v ?? 0);
    const last30 = rain.slice(-30);
    return {
      temperature: Math.round(j.current.temperature_2m * 10) / 10,
      humidity: Math.round(j.current.relative_humidity_2m),
      windSpeed: Math.round(j.current.wind_speed_10m),
      rainfall24h: Math.round(rain[rain.length - 1] * 10) / 10,
      rainfall30d: Math.round(last30.reduce((a, b) => a + b, 0)),
      normalRain30d: loc.current.normalRain30d, // climatology still from sample data
      condition: 'Live observation',
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Returns { data, source: 'demo' | 'live' } */
export async function getCurrentConditions(locationId) {
  const loc = getLocationById(locationId);
  if (DATA_MODE === 'live') {
    try {
      return { data: await fetchOpenMeteoCurrent(loc), source: 'live' };
    } catch (err) {
      console.warn('[climateService] Live data unavailable, using demo data:', err.message);
    }
  }
  await delay(250);
  return { data: { ...loc.current }, source: 'demo' };
}

export async function getRiskZones(locationId) {
  return getLocationById(locationId).zones;
}

/**
 * Loads everything a page needs for a location and runs the pipeline:
 * Climate Data → Risk Analysis → Alerts.
 */
export async function getLocationSnapshot(locationId) {
  const loc = getLocationById(locationId);
  const { data: current, source } = await getCurrentConditions(locationId);
  const risk = analyseRisk(current, loc.vulnerability);
  const alerts = generateAlerts(loc, current, risk);
  const zones = await getRiskZones(locationId);
  return {
    location: { id: loc.id, name: loc.name, state: loc.state, coords: loc.coords, zoom: loc.zoom, climateZone: loc.climateZone },
    current,
    source,
    risk,
    alerts,
    zones,
    trends: {
      '7d': generateTrend(loc, current, '7d'),
      '30d': generateTrend(loc, current, '30d'),
      '1y': generateTrend(loc, current, '1y'),
    },
    updatedAt: new Date(),
  };
}
