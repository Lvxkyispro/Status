import { Waves, CloudRain, Sun, Sprout } from 'lucide-react';

/** Hazard categories used across the map, dashboard and alerts. */
export const RISK_TYPES = {
  flood: { key: 'flood', label: 'Flood Risk', short: 'Flood', color: '#1f6fd1', icon: Waves },
  heavyRain: { key: 'heavyRain', label: 'Heavy Rainfall Risk', short: 'Heavy Rainfall', color: '#6750c9', icon: CloudRain },
  heat: { key: 'heat', label: 'Heat Risk', short: 'Heat', color: '#e05a2b', icon: Sun },
  drought: { key: 'drought', label: 'Drought Risk', short: 'Drought', color: '#b7851c', icon: Sprout },
};

export const RISK_TYPE_KEYS = Object.keys(RISK_TYPES);

/** Severity levels (score 0–100). */
export const LEVELS = {
  Low: { label: 'Low', color: '#1f9d7a', bg: '#e3f5ee', min: 0 },
  Moderate: { label: 'Moderate', color: '#c27c0e', bg: '#fdf1dc', min: 34 },
  High: { label: 'High', color: '#cf3b3b', bg: '#fde6e6', min: 67 },
};

export const LEVEL_ORDER = ['High', 'Moderate', 'Low'];

export const levelFromScore = (score) => (score >= 67 ? 'High' : score >= 34 ? 'Moderate' : 'Low');
