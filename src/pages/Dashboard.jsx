import { Link } from 'react-router-dom';
import {
  ShieldAlert, Thermometer, CloudRain, Droplets, Wind, BellRing, ArrowRight, ChartLine, Gauge, Workflow, MapPin,
} from 'lucide-react';
import { useClimate } from '../context/ClimateContext';
import { RISK_TYPES, LEVELS } from '../data/riskTypes';
import { Card, StatCard, RiskBadge, DataBadge, ScoreBar, PageHeader, LoadingState } from '../components/ui';
import { TempRainChart } from '../components/charts';
import AlertItem from '../components/AlertItem';
import PipelineFlow from '../components/PipelineFlow';
import { formatTime } from '../utils/format';

export default function Dashboard() {
  const { snapshot, loading } = useClimate();
  if (!snapshot) return <LoadingState />;

  const { location, current, risk, alerts, trends, source, updatedAt } = snapshot;
  const overall = risk.overall;
  const dominant = RISK_TYPES[overall.dominantType];
  const topZones = [...snapshot.zones].sort((a, b) => b.score - a.score).slice(0, 5);
  const highAlerts = alerts.filter((a) => a.severity === 'High').length;

  return (
    <div className={`page ${loading ? 'is-loading' : ''}`} key={location.id}>
      <PageHeader
        title="Climate Risk Information System"
        description="Understand climate-related risks for a selected location — from raw climate data to risk levels, maps and alerts."
      />

      <div className={`hero-risk level-${overall.level.toLowerCase()}`}>
        <div className="hero-left">
          <span className="hero-eyebrow">Selected location</span>
          <h2>{location.name}, {location.state}</h2>
          <p className="hero-meta">
            {location.climateZone} · {current.condition} · Snapshot {formatTime(updatedAt)}
          </p>
          <DataBadge source={source} />
        </div>
        <div className="hero-right">
          <span className="hero-eyebrow">Overall Risk Level</span>
          <div className="hero-level" style={{ color: LEVELS[overall.level].color }}>
            <ShieldAlert size={30} /> {overall.level}
          </div>
          <p className="hero-meta">
            Score {overall.score}/100 · Dominant hazard: <strong>{dominant.label}</strong>
          </p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={Thermometer} label="Temperature" value={current.temperature} unit="°C" accent="#e05a2b"
          hint={`Feels like ${risk.feelsLike} °C`} />
        <StatCard icon={CloudRain} label="Rainfall (24 h)" value={current.rainfall24h} unit="mm" accent="#1f6fd1"
          hint={`${current.rainfall30d} mm in last 30 days`} />
        <StatCard icon={Droplets} label="Humidity" value={current.humidity} unit="%" accent="#14a3a3"
          hint={current.humidity >= 75 ? 'Very humid' : current.humidity <= 35 ? 'Dry air' : 'Moderate'} />
        <StatCard icon={Wind} label="Wind speed" value={current.windSpeed} unit="km/h" accent="#5b6bd6"
          hint={current.windSpeed >= 40 ? 'Strong / gusty' : current.windSpeed >= 20 ? 'Breezy' : 'Light'} />
        <StatCard icon={BellRing} label="Active alerts" value={alerts.length} accent="#cf3b3b"
          hint={highAlerts ? `${highAlerts} high-severity` : 'No high-severity alerts'} />
      </div>

      <div className="grid-2-1">
        <Card title="7-day climate trend" subtitle="Temperature and daily rainfall" icon={ChartLine}
          actions={<><DataBadge source="demo" /><Link to="/trends" className="text-link">More <ArrowRight size={14} /></Link></>}>
          <TempRainChart data={trends['7d']} />
        </Card>

        <Card title="Risk analysis" subtitle="Hazard scores (0–100)" icon={Gauge}>
          <ul className="risk-list">
            {risk.categories.map((c) => {
              const t = RISK_TYPES[c.type];
              return (
                <li key={c.type}>
                  <div className="risk-row">
                    <span className="risk-name">
                      <span className="risk-ico" style={{ color: t.color, background: `${t.color}14` }}><t.icon size={16} /></span>
                      {t.label}
                    </span>
                    <span className="risk-score">
                      <strong>{c.score}</strong>
                      <RiskBadge level={c.level} size="sm" />
                    </span>
                  </div>
                  <ScoreBar score={c.score} color={LEVELS[c.level].color} />
                </li>
              );
            })}
          </ul>
          <p className="footnote">Overall risk = highest hazard score. Low 0–33 · Moderate 34–66 · High 67–100.</p>
        </Card>
      </div>

      <div className="grid-2-1">
        <Card title="Latest alerts" subtitle={`${alerts.length} active for ${location.name}`} icon={BellRing}
          actions={<Link to="/alerts" className="text-link">View all <ArrowRight size={14} /></Link>}>
          <div className="alert-list">
            {alerts.length === 0 && <p className="empty">No active alerts for this location.</p>}
            {alerts.slice(0, 3).map((a) => <AlertItem key={a.id} alert={a} compact />)}
          </div>
        </Card>

        <Card title="Top risk hotspots" subtitle="Highest-scoring areas" icon={MapPin}
          actions={<Link to="/map" className="text-link">Open map <ArrowRight size={14} /></Link>}>
          <ul className="hotspot-list">
            {topZones.map((z) => {
              const t = RISK_TYPES[z.type];
              return (
                <li key={z.name}>
                  <span className="risk-ico" style={{ color: t.color, background: `${t.color}14` }}><t.icon size={16} /></span>
                  <span className="zone-text">
                    <span className="zone-name">{z.name}</span>
                    <span className="zone-type">{t.label}</span>
                  </span>
                  <RiskBadge level={z.level} size="sm" />
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card title="How the system works" subtitle="Climate Data → Risk Analysis → Risk Visualization → Alerts → User Awareness" icon={Workflow}>
        <PipelineFlow />
      </Card>
    </div>
  );
}
