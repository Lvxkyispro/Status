import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, ChartLine, Bell, Info, Menu, X, MapPin, Droplets } from 'lucide-react';
import { useClimate } from '../context/ClimateContext';
import { LOCATIONS } from '../data/locations';
import { DataBadge } from './ui';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/map', label: 'Risk Map', icon: Map },
  { to: '/trends', label: 'Climate Trends', icon: ChartLine },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/about', label: 'How It Works', icon: Info },
];

export default function Layout() {
  const { locationId, setLocationId, snapshot } = useClimate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const alertCount = snapshot?.alerts.length ?? 0;
  const highCount = snapshot?.alerts.filter((a) => a.severity === 'High').length ?? 0;

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
        <div className="brand">
          <span className="brand-logo"><Droplets size={20} /></span>
          <div>
            <div className="brand-name">CRIS</div>
            <div className="brand-sub">Climate Risk Information System</div>
          </div>
          <button className="icon-btn close-menu" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
              {to === '/alerts' && alertCount > 0 && (
                <span className={`nav-count ${highCount ? 'high' : ''}`}>{alertCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-note">
            <strong>B.Tech IT · PBL</strong>
            <span>Prototype using sample data. Designed for real API integration.</span>
          </div>
        </div>
      </aside>
      {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <div className="topbar-title">Climate Risk Information System</div>
          <div className="topbar-right">
            <label className="location-select">
              <MapPin size={16} />
              <span className="sr-only">Select location</span>
              <select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                {LOCATIONS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}, {l.state}
                  </option>
                ))}
              </select>
            </label>
            <DataBadge source={snapshot?.source} />
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>

        <footer className="footer">
          Climate Risk Information System | B.Tech IT PBL
        </footer>
      </div>
    </div>
  );
}
