import {
  ResponsiveContainer, ComposedChart, LineChart, Line, Bar, BarChart, Area, AreaChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

export const CHART_COLORS = {
  temp: '#e05a2b',
  tempMax: '#f28b5b',
  tempMin: '#3a86c8',
  rain: '#1f6fd1',
  humidity: '#14a3a3',
  grid: '#e3eaf0',
  axis: '#6b7c8f',
};

const axisProps = { tick: { fill: CHART_COLORS.axis, fontSize: 12 }, tickLine: false, axisLine: { stroke: CHART_COLORS.grid } };
const tooltipProps = {
  contentStyle: { borderRadius: 10, border: '1px solid #dbe5ee', boxShadow: '0 6px 20px rgba(15,40,70,.12)', fontSize: 13 },
  labelStyle: { fontWeight: 600, color: '#12324a' },
};

/** Dashboard: temperature line + rainfall bars on dual axes. */
export function TempRainChart({ data, height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 6, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis yAxisId="t" {...axisProps} unit="°" domain={['dataMin - 3', 'dataMax + 3']} allowDecimals={false} />
        <YAxis yAxisId="r" orientation="right" {...axisProps} unit="mm" width={52} />
        <Tooltip {...tooltipProps} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar yAxisId="r" dataKey="rainfall" name="Rainfall (mm)" fill={CHART_COLORS.rain} fillOpacity={0.75} radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Line yAxisId="t" type="monotone" dataKey="temp" name="Temperature (°C)" stroke={CHART_COLORS.temp} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function TemperatureChart({ data, height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey="label" {...axisProps} minTickGap={16} />
        <YAxis {...axisProps} unit="°" domain={['dataMin - 2', 'dataMax + 2']} allowDecimals={false} />
        <Tooltip {...tooltipProps} formatter={(v) => `${v} °C`} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Line type="monotone" dataKey="tempMax" name="Max" stroke={CHART_COLORS.tempMax} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
        <Line type="monotone" dataKey="temp" name="Average" stroke={CHART_COLORS.temp} strokeWidth={2.5} dot={data.length <= 12 ? { r: 3 } : false} />
        <Line type="monotone" dataKey="tempMin" name="Min" stroke={CHART_COLORS.tempMin} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RainfallChart({ data, height = 280, monthly = false }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey="label" {...axisProps} minTickGap={16} />
        <YAxis {...axisProps} unit="mm" width={62} />
        <Tooltip {...tooltipProps} formatter={(v) => `${v} mm`} cursor={{ fill: 'rgba(31,111,209,.06)' }} />
        <Bar dataKey="rainfall" name={monthly ? 'Monthly rainfall' : 'Daily rainfall'} fill={CHART_COLORS.rain} radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HumidityChart({ data, height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="humFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.humidity} stopOpacity={0.35} />
            <stop offset="100%" stopColor={CHART_COLORS.humidity} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey="label" {...axisProps} minTickGap={16} />
        <YAxis {...axisProps} unit="%" domain={[0, 100]} />
        <Tooltip {...tooltipProps} formatter={(v) => `${v} %`} />
        <Area type="monotone" dataKey="humidity" name="Relative humidity" stroke={CHART_COLORS.humidity} strokeWidth={2.5} fill="url(#humFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
