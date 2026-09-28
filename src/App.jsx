import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ClimateProvider } from './context/ClimateContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RiskMap from './pages/RiskMap';
import Trends from './pages/Trends';
import Alerts from './pages/Alerts';
import About from './pages/About';

export default function App() {
  return (
    <ClimateProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="map" element={<RiskMap />} />
            <Route path="trends" element={<Trends />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ClimateProvider>
  );
}
