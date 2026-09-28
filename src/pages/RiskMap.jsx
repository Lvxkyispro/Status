import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers, MapPin, Crosshair, WifiOff } from 'lucide-react';
import { useClimate } from '../context/ClimateContext';
import { RISK_TYPES, RISK_TYPE_KEYS, LEVELS } from '../data/riskTypes';
import { Card, DataBadge, RiskBadge, PageHeader, LoadingState } from '../components/ui';

const RADIUS = { High: 2600, Moderate: 1900, Low: 1300 };

// Lightweight SVG paths (lucide shapes) for the marker icons.
const ICON_SVG = {
  flood: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  heavyRain: '<path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>',
  heat: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.3 17.7-1.4 1.4"/><path d="m19.1 4.9-1.4 1.4"/>',
  drought: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
};

function makeIcon(type, level) {
  const color = RISK_TYPES[type].color;
  const ring = LEVELS[level].color;
  return L.divIcon({
    className: 'risk-marker',
    html: `<div class="risk-pin" style="--c:${color};--ring:${ring}">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_SVG[type]}</svg>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16],
  });
}

function FitToLocation({ zones, center }) {
  const map = useMap();
  useEffect(() => {
    const pts = [center, ...zones.map((z) => z.coords)];
    map.flyToBounds(L.latLngBounds(pts).pad(0.15), { duration: 0.8, maxZoom: 12 });
  }, [map, zones, center]);
  return null;
}

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target.coords, 13, { duration: 0.7 });
  }, [map, target]);
  return null;
}

export default function RiskMap() {
  const { snapshot } = useClimate();
  const [active, setActive] = useState(() => new Set(RISK_TYPE_KEYS));
  const [focus, setFocus] = useState(null);
  const [tilesFailed, setTilesFailed] = useState(false);
  const markerRefs = useRef({});

  const zones = snapshot?.zones ?? [];
  const visible = useMemo(() => zones.filter((z) => active.has(z.type)), [zones, active]);

  useEffect(() => setFocus(null), [snapshot?.location.id]);

  useEffect(() => {
    if (!focus) return;
    const t = setTimeout(() => markerRefs.current[focus.name]?.openPopup(), 750);
    return () => clearTimeout(t);
  }, [focus]);

  if (!snapshot) return <LoadingState />;
  const { location } = snapshot;

  const toggle = (key) =>
    setActive((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const counts = RISK_TYPE_KEYS.reduce((acc, k) => ({ ...acc, [k]: zones.filter((z) => z.type === k).length }), {});
  const sorted = [...visible].sort((a, b) => b.score - a.score);

  return (
    <div className="page">
      <PageHeader
        title="Risk Map"
        description={`Location-based climate risk hotspots in and around ${location.name}. Click a marker for details.`}
      >
        <DataBadge source="demo" />
      </PageHeader>

      <div className="filter-bar" role="group" aria-label="Risk categories">
        <Layers size={16} className="muted" />
        {RISK_TYPE_KEYS.map((k) => {
          const t = RISK_TYPES[k];
          const on = active.has(k);
          return (
            <button key={k} className={`chip ${on ? 'on' : ''}`} style={{ '--c': t.color }} onClick={() => toggle(k)} aria-pressed={on}>
              <t.icon size={14} /> {t.label} <span className="chip-count">{counts[k]}</span>
            </button>
          );
        })}
      </div>

      <div className="map-layout">
        <div className="map-wrap card">
          <MapContainer center={location.coords} zoom={location.zoom} scrollWheelZoom className="map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              eventHandlers={{ tileerror: () => setTilesFailed(true), tileload: () => setTilesFailed(false) }}
            />
            <FitToLocation zones={zones} center={location.coords} />
            <FlyTo target={focus} />
            {visible.map((z) => (
              <Circle key={`c-${z.name}`} center={z.coords} radius={RADIUS[z.level]}
                pathOptions={{ color: RISK_TYPES[z.type].color, weight: 1, fillOpacity: 0.12, opacity: 0.5 }} />
            ))}
            {visible.map((z) => {
              const t = RISK_TYPES[z.type];
              return (
                <Marker key={z.name} position={z.coords} icon={makeIcon(z.type, z.level)}
                  ref={(r) => { if (r) markerRefs.current[z.name] = r; }}>
                  <Popup>
                    <div className="popup">
                      <div className="popup-type" style={{ color: t.color }}>{t.label}</div>
                      <h4>{z.name}</h4>
                      <div className="popup-row">
                        <RiskBadge level={z.level} size="sm" />
                        <span className="popup-score">Score {z.score}/100</span>
                      </div>
                      <p>{z.note}</p>
                      <div className="popup-foot">DEMO / SAMPLE DATA · {location.name}</div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          <div className="map-legend">
            <strong>Legend</strong>
            {RISK_TYPE_KEYS.map((k) => (
              <span key={k}><i style={{ background: RISK_TYPES[k].color }} /> {RISK_TYPES[k].short}</span>
            ))}
            <span className="legend-sep" />
            {['High', 'Moderate', 'Low'].map((l) => (
              <span key={l}><i className="ring" style={{ borderColor: LEVELS[l].color }} /> {l}</span>
            ))}
          </div>

          {tilesFailed && (
            <div className="map-offline">
              <WifiOff size={14} /> Map tiles need an internet connection — risk markers still work.
            </div>
          )}
        </div>

        <Card title="Risk hotspots" subtitle={`${visible.length} of ${zones.length} shown`} icon={MapPin} className="zone-panel">
          <ul className="zone-list">
            {sorted.map((z) => {
              const t = RISK_TYPES[z.type];
              return (
                <li key={z.name}>
                  <button className={`zone-item ${focus?.name === z.name ? 'active' : ''}`} onClick={() => setFocus(z)}>
                    <span className="risk-ico" style={{ color: t.color, background: `${t.color}14` }}><t.icon size={16} /></span>
                    <span className="zone-text">
                      <span className="zone-name">{z.name}</span>
                      <span className="zone-type">{t.label} · {z.score}</span>
                    </span>
                    <RiskBadge level={z.level} size="sm" />
                  </button>
                </li>
              );
            })}
            {sorted.length === 0 && <li className="empty">Select at least one risk category.</li>}
          </ul>
          <p className="footnote"><Crosshair size={12} /> Click a hotspot to zoom to it on the map.</p>
        </Card>
      </div>
    </div>
  );
}
