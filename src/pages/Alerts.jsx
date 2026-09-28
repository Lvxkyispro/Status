import { useMemo, useState } from 'react';
import { BellRing, ShieldCheck, Phone } from 'lucide-react';
import { useClimate } from '../context/ClimateContext';
import { LEVELS, LEVEL_ORDER } from '../data/riskTypes';
import { Card, DataBadge, PageHeader, Segmented, LoadingState } from '../components/ui';
import AlertItem from '../components/AlertItem';

const HELPLINES = [
  ['National Emergency', '112'],
  ['Disaster Management (NDMA)', '1078'],
  ['Ambulance', '108'],
  ['Municipal disaster control (e.g. BMC)', '1916'],
];

export default function Alerts() {
  const { snapshot } = useClimate();
  const [filter, setFilter] = useState('All');
  const alerts = snapshot?.alerts ?? [];

  const counts = useMemo(
    () => LEVEL_ORDER.reduce((acc, l) => ({ ...acc, [l]: alerts.filter((a) => a.severity === l).length }), {}),
    [alerts],
  );
  if (!snapshot) return <LoadingState />;

  const shown = filter === 'All' ? alerts : alerts.filter((a) => a.severity === filter);
  const options = ['All', ...LEVEL_ORDER].map((v) => ({
    value: v,
    label: `${v} (${v === 'All' ? alerts.length : counts[v]})`,
  }));

  return (
    <div className="page">
      <PageHeader
        title="Alerts"
        description={`Climate risk alerts generated from the risk analysis for ${snapshot.location.name}.`}
      >
        <DataBadge source={snapshot.source} />
      </PageHeader>

      <div className="severity-grid">
        {LEVEL_ORDER.map((l) => (
          <button key={l} className={`severity-card ${filter === l ? 'active' : ''}`}
            style={{ '--c': LEVELS[l].color, '--bg': LEVELS[l].bg }} onClick={() => setFilter(filter === l ? 'All' : l)}>
            <span className="sev-count">{counts[l]}</span>
            <span className="sev-label">{l} severity</span>
          </button>
        ))}
      </div>

      <div className="grid-2-1">
        <Card title="Active alerts" subtitle="Sorted by severity" icon={BellRing}
          actions={<Segmented options={options} value={filter} onChange={setFilter} ariaLabel="Filter by severity" />}>
          <div className="alert-list">
            {shown.map((a, i) => <AlertItem key={a.id} alert={a} defaultOpen={i === 0} />)}
            {shown.length === 0 && (
              <div className="empty ok">
                <ShieldCheck size={22} /> No {filter !== 'All' ? filter.toLowerCase() + '-severity ' : ''}alerts for this location.
              </div>
            )}
          </div>
        </Card>

        <div className="stack">
          <Card title="Severity levels" icon={ShieldCheck}>
            <ul className="legend-list">
              <li><span className="lv" style={{ background: LEVELS.High.color }} /><div><strong>High (67–100)</strong><p>Significant impact likely. Take protective action now.</p></div></li>
              <li><span className="lv" style={{ background: LEVELS.Moderate.color }} /><div><strong>Moderate (34–66)</strong><p>Possible impact. Stay alert and be prepared.</p></div></li>
              <li><span className="lv" style={{ background: LEVELS.Low.color }} /><div><strong>Low (15–33)</strong><p>Minor impact. Keep monitoring updates.</p></div></li>
            </ul>
          </Card>
          <Card title="Emergency helplines" icon={Phone}>
            <ul className="helplines">
              {HELPLINES.map(([name, num]) => (
                <li key={num}><span>{name}</span><strong>{num}</strong></li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
