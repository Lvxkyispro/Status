import { Link } from 'react-router-dom';
import { Database, Cpu, Map, BellRing, Users, ChevronRight } from 'lucide-react';

export const PIPELINE = [
  { icon: Database, title: 'Climate Data', text: 'Temperature, rainfall, humidity, wind', to: '/trends' },
  { icon: Cpu, title: 'Risk Analysis', text: 'Rule-based hazard scoring (0–100)', to: '/about' },
  { icon: Map, title: 'Risk Visualization', text: 'Dashboard, map & charts', to: '/map' },
  { icon: BellRing, title: 'Alerts', text: 'Severity-based warnings', to: '/alerts' },
  { icon: Users, title: 'User Awareness', text: 'Safety actions for citizens', to: '/alerts' },
];

export default function PipelineFlow() {
  return (
    <ol className="pipeline">
      {PIPELINE.map((s, i) => (
        <li key={s.title} className="pipeline-step" style={{ animationDelay: `${i * 70}ms` }}>
          <Link to={s.to} className="pipeline-link">
            <span className="pipeline-num">{i + 1}</span>
            <span className="pipeline-icon">
              <s.icon size={20} />
            </span>
            <span className="pipeline-title">{s.title}</span>
            <span className="pipeline-text">{s.text}</span>
          </Link>
          {i < PIPELINE.length - 1 && <ChevronRight className="pipeline-arrow" size={18} aria-hidden />}
        </li>
      ))}
    </ol>
  );
}
