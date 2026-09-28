import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getLocationSnapshot } from '../services/climateService';
import { DEFAULT_LOCATION_ID, LOCATIONS } from '../data/locations';

const ClimateContext = createContext(null);
const STORAGE_KEY = 'cris.location';

function readStoredLocation() {
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    return LOCATIONS.some((l) => l.id === id) ? id : DEFAULT_LOCATION_ID;
  } catch {
    return DEFAULT_LOCATION_ID;
  }
}

export function ClimateProvider({ children }) {
  const [locationId, setLocationIdState] = useState(readStoredLocation);
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const cache = useRef(new Map());

  const setLocationId = useCallback((id) => {
    setLocationIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* storage unavailable — ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const cached = cache.current.get(locationId);
    if (cached) {
      setSnapshot(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    getLocationSnapshot(locationId).then((snap) => {
      if (cancelled) return;
      cache.current.set(locationId, snap);
      setSnapshot(snap);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [locationId]);

  const value = useMemo(
    () => ({ locationId, setLocationId, snapshot, loading }),
    [locationId, setLocationId, snapshot, loading],
  );
  return <ClimateContext.Provider value={value}>{children}</ClimateContext.Provider>;
}

export function useClimate() {
  const ctx = useContext(ClimateContext);
  if (!ctx) throw new Error('useClimate must be used inside ClimateProvider');
  return ctx;
}
