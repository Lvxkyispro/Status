import { Workflow, Sparkles, Server, Plug, Users, Code } from 'lucide-react';
import { Card, PageHeader } from '../components/ui';
import PipelineFlow from '../components/PipelineFlow';
import { DATA_MODE } from '../services/climateService';

const NOVELTY = [
  ['Climate information', 'Temperature, rainfall, humidity and wind for a location in one view.'],
  ['Location-based risk visualization', 'Interactive map of flood, heat, heavy-rainfall and drought hotspots.'],
  ['User-friendly dashboard', 'Clear risk levels, statistic cards and trend charts for non-experts.'],
  ['Climate risk alerts', 'Severity-based alerts with practical safety actions.'],
];

const INTEGRATIONS = [
  ['Current weather', 'Open-Meteo Forecast API (free, no key)', 'getCurrentConditions()', 'Working — set VITE_DATA_MODE=live'],
  ['Historical trends', 'Open-Meteo Archive / NASA POWER / IMD gridded data', 'generateTrend()', 'Planned'],
  ['Official warnings', 'IMD nowcasts & district warnings, NDMA SACHET (CAP feeds)', 'generateAlerts()', 'Planned'],
  ['GIS risk layers', 'ISRO Bhuvan, NDMA hazard maps, municipal flood-spot data', 'getRiskZones()', 'Planned'],
  ['Storage', 'PostgreSQL + PostGIS or MongoDB via a Node/Express REST API', 'climateService.js', 'Planned'],
  ['Notifications', 'Email / SMS / web push for subscribed users', 'Alerts module', 'Future scope'],
];

const TEAM = ['Purvik Vanjara', 'Manjot Singh', 'Sharaz Ali', 'Piyush Raina'];

const STACK = ['React 19', 'JavaScript (ES2022)', 'CSS (custom, responsive)', 'Vite', 'Recharts', 'Leaflet + OpenStreetMap', 'React Router', 'Lucide icons'];

export default function About() {
  return (
    <div className="page">
      <PageHeader
        title="How It Works"
        description="System concept, architecture and how the prototype can be connected to real climate APIs and databases."
      />

      <Card title="System flow" subtitle="Climate Data → Risk Analysis → Risk Visualization → Alerts → User Awareness" icon={Workflow}>
        <PipelineFlow />
      </Card>

      <div className="grid-1-1">
        <Card title="Key novelty" subtitle="Four capabilities integrated into one system" icon={Sparkles}>
          <ol className="novelty">
            {NOVELTY.map(([t, d], i) => (
              <li key={t}>
                <span className="n">{i + 1}</span>
                <div><strong>{t}</strong><p>{d}</p></div>
              </li>
            ))}
          </ol>
        </Card>

        <Card title="Architecture" subtitle="Layered design — UI is independent of the data source" icon={Server}>
          <div className="arch">
            <div className="arch-layer ui"><strong>Presentation layer</strong><span>Dashboard · Risk Map · Trends · Alerts (React components)</span></div>
            <div className="arch-layer logic"><strong>Analysis layer</strong><span>riskEngine.js (hazard scoring) · alertEngine.js (alerts & actions)</span></div>
            <div className="arch-layer svc"><strong>Service layer</strong><span>climateService.js — single integration point for all data</span></div>
            <div className="arch-layer data"><strong>Data sources</strong><span>Demo dataset today → Weather APIs, GIS layers, database later</span></div>
          </div>
          <div className="risk-method">
            <strong>Risk analysis method (prototype)</strong>
            <ul>
              <li><b>Heat:</b> temperature and heat index (feels-like) vs. heat-wave thresholds</li>
              <li><b>Heavy rainfall:</b> 24-hour rainfall vs. IMD heavy / very heavy categories</li>
              <li><b>Flood:</b> 24-hour intensity + 30-day accumulated rainfall</li>
              <li><b>Drought:</b> 30-day rainfall deficit vs. normal + dry air</li>
              <li>Each score is weighted by the location’s vulnerability; overall risk = dominant hazard.</li>
            </ul>
          </div>
        </Card>
      </div>

      <Card title="Connecting real climate APIs & databases" subtitle={`Current data mode: ${DATA_MODE.toUpperCase()}`} icon={Plug}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Data</th><th>Real source</th><th>Replace in code</th><th>Status</th></tr>
            </thead>
            <tbody>
              {INTEGRATIONS.map(([a, b, c, d]) => (
                <tr key={a}>
                  <td><strong>{a}</strong></td>
                  <td>{b}</td>
                  <td><code>{c}</code></td>
                  <td><span className={`status ${d.startsWith('Working') ? 'ok' : ''}`}>{d}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="footnote">
          All pages read data only through <code>src/services/climateService.js</code>. Swapping a demo function for an API call
          (keeping the same return shape) updates the whole system — dashboard, map, charts and alerts — without UI changes.
        </p>
      </Card>

      <div className="grid-1-1">
        <Card title="Project team" subtitle="B.Tech Information Technology — Project Based Learning" icon={Users}>
          <ul className="team">
            {TEAM.map((n) => (
              <li key={n}>
                <span className="avatar">{n.split(' ').map((p) => p[0]).join('')}</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Technology stack" icon={Code}>
          <div className="tags">
            {STACK.map((s) => <span key={s} className="tag">{s}</span>)}
          </div>
        </Card>
      </div>
    </div>
  );
}
