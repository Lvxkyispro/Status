import { useState } from 'react';
import { Clock, MapPin, ChevronDown, Wind, TriangleAlert } from 'lucide-react';
import { RISK_TYPES, LEVELS } from '../data/riskTypes';
import { RiskBadge } from './ui';
import { timeAgo } from '../utils/format';

export default function AlertItem({ alert, compact = false, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const type = RISK_TYPES[alert.type];
  const Icon = type?.icon ?? (alert.type === 'wind' ? Wind : TriangleAlert);
  const color = LEVELS[alert.severity].color;

  return (
    <article className={`alert-item sev-${alert.severity.toLowerCase()} ${compact ? 'compact' : ''}`} style={{ '--sev': color }}>
      <div className="alert-icon" style={{ color: type?.color ?? '#0f7c8c' }}>
        <Icon size={20} />
      </div>
      <div className="alert-body">
        <div className="alert-head">
          <h4>{alert.title}</h4>
          <RiskBadge level={alert.severity} size="sm" />
        </div>
        <p className="alert-msg">{alert.message}</p>
        <div className="alert-meta">
          <span><Clock size={13} /> {timeAgo(alert.issuedAt)}</span>
          <span><MapPin size={13} /> {alert.areas.slice(0, compact ? 2 : 4).join(', ')}{alert.areas.length > (compact ? 2 : 4) ? '…' : ''}</span>
          {!compact && <span className="muted">Valid {alert.validHours} h · {alert.category}</span>}
        </div>
        {!compact && (
          <>
            <button className="link-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
              What should I do? <ChevronDown size={14} className={open ? 'rot' : ''} />
            </button>
            {open && (
              <ul className="alert-actions">
                {alert.actions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </article>
  );
}
