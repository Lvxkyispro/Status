import { useState } from 'react';
import { Thermometer, CloudRain, Droplets } from 'lucide-react';
import { useClimate } from '../context/ClimateContext';
import { Card, DataBadge, PageHeader, Segmented, LoadingState } from '../components/ui';
import { TemperatureChart, RainfallChart, HumidityChart } from '../components/charts';

const PERIODS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '1y', label: '1 Year' },
];

const avg = (arr) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
const r1 = (v) => Math.round(v * 10) / 10;

function Summary({ items }) {
  return (
    <div className="mini-stats">
      {items.map(([k, v]) => (
        <div key={k}>
          <span>{k}</span>
          <strong>{v}</strong>
        </div>
      ))}
    </div>
  );
}

export default function Trends() {
  const { snapshot } = useClimate();
  const [period, setPeriod] = useState('30d');
  if (!snapshot) return <LoadingState />;

  const { location, trends } = snapshot;
  const data = trends[period];
  const monthly = period === '1y';
  const unitLabel = monthly ? 'monthly values, last 12 months' : `daily values, last ${data.length} days`;

  const temps = data.map((d) => d.temp);
  const rain = data.map((d) => d.rainfall);
  const hum = data.map((d) => d.humidity);
  const wettest = data.reduce((a, b) => (b.rainfall > a.rainfall ? b : a), data[0]);

  return (
    <div className="page">
      <PageHeader title="Climate Trends" description={`Historical climate indicators for ${location.name}, ${location.state} (${unitLabel}).`}>
        <Segmented options={PERIODS} value={period} onChange={setPeriod} ariaLabel="Time period" />
        <DataBadge source="demo" />
      </PageHeader>

      <div className="trend-grid">
        <Card title="Temperature trend" subtitle="Average with daily/monthly max & min (°C)" icon={Thermometer} className="span-2">
          <Summary items={[
            ['Average', `${r1(avg(temps))} °C`],
            ['Highest', `${Math.max(...data.map((d) => d.tempMax))} °C`],
            ['Lowest', `${Math.min(...data.map((d) => d.tempMin))} °C`],
          ]} />
          <TemperatureChart data={data} />
        </Card>

        <Card title="Rainfall trend" subtitle={monthly ? 'Monthly total (mm)' : 'Daily total (mm)'} icon={CloudRain}>
          <Summary items={[
            ['Total', `${Math.round(rain.reduce((a, b) => a + b, 0))} mm`],
            [monthly ? 'Wettest month' : 'Wettest day', `${wettest.label}`],
            ['Rainy ' + (monthly ? 'months' : 'days'), rain.filter((v) => v >= (monthly ? 10 : 2.5)).length],
          ]} />
          <RainfallChart data={data} monthly={monthly} />
        </Card>

        <Card title="Humidity trend" subtitle="Relative humidity (%)" icon={Droplets}>
          <Summary items={[
            ['Average', `${Math.round(avg(hum))} %`],
            ['Max', `${Math.max(...hum)} %`],
            ['Min', `${Math.min(...hum)} %`],
          ]} />
          <HumidityChart data={data} />
        </Card>
      </div>

      <p className="footnote center">
        Trend values are generated from approximate long-term climate normals for demonstration.
        In production these would come from historical datasets such as Open-Meteo Archive, IMD gridded data or NASA POWER.
      </p>
    </div>
  );
}
