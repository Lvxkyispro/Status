import { Database, Radio } from 'lucide-react';
import { LEVELS } from '../data/riskTypes';

/** Small label that makes it clear whether values are sample data or live. */
export function DataBadge({ source = 'demo', compact = false }) {
  if (source === 'live') {
    return (
      <span className="data-badge live" title="Current conditions fetched from the Open-Meteo public API">
        <Radio size={12} /> {compact ? 'Live' : 'Live · Open-Meteo'}
      </span>
    );
  }
  return (
    <span className="data-badge" title="Sample values prepared for demonstration — not real-time measurements">
      <Database size={12} /> Demo Data
    </span>
  );
}

export function RiskBadge({ level, size = 'md' }) {
  const l = LEVELS[level] ?? LEVELS.Low;
  return (
    <span className={`risk-badge ${size}`} style={{ color: l.color, background: l.bg }}>
      <span className="dot" style={{ background: l.color }} />
      {l.label}
    </span>
  );
}

export function Card({ title, subtitle, icon: Icon, actions, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <header className="card-header">
          <div className="card-title-wrap">
            {Icon && (
              <span className="card-icon">
                <Icon size={18} />
              </span>
            )}
            <div>
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatCard({ icon: Icon, label, value, unit, hint, accent = 'var(--primary)', children }) {
  return (
    <div className="stat-card" style={{ '--accent': accent }}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon">
          <Icon size={18} />
        </span>
      </div>
      <div className="stat-value">
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      {hint && <div className="stat-hint">{hint}</div>}
      {children}
    </div>
  );
}

export function ScoreBar({ score, color }) {
  return (
    <div className="score-bar" role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
      <div className="score-fill" style={{ width: `${Math.max(score, 2)}%`, background: color }} />
    </div>
  );
}

export function PageHeader({ title, description, children }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="page-header-actions">{children}</div>}
    </div>
  );
}

export function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div className="segmented" role="tablist" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          className={value === o.value ? 'active' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function LoadingState({ label = 'Loading climate data…' }) {
  return (
    <div className="loading-state">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}
