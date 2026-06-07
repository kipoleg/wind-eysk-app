import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { WeatherPoint } from '../types/weather';
import { formatNumber } from '../utils/format';
import { arrowFromDegrees } from '../utils/wind';

type WindChartProps = {
  history: WeatherPoint[];
  forecast: WeatherPoint[];
};

type ChartPoint = {
  timeMs: number;
  label: string;
  avgWind: number | null;
  gust: number | null;
  forecastWind: number | null;
  temp: number | null;
  directionDeg: number | null;
};

export function WindChart({ history, forecast }: WindChartProps) {
  const now = Date.now();
  const historical = history.map((point) => toChartPoint(point, false));
  const future = forecast
    .filter((point) => new Date(point.time).getTime() >= now - 15 * 60 * 1000)
    .map((point) => toChartPoint(point, true));
  const data = [...historical, ...future]
    .filter((point, index, list) => list.findIndex((candidate) => candidate.timeMs === point.timeMs) === index)
    .sort((a, b) => a.timeMs - b.timeMs);

  const directions = data.filter((_, index) => index % Math.max(1, Math.ceil(data.length / 14)) === 0).slice(0, 14);

  return (
    <div className="mt-7">
      <div className="mb-2 flex items-center justify-between px-1 text-[22px] text-[#0D2B48] dark:text-white">
        {directions.map((point) => (
          <span key={point.timeMs}>{arrowFromDegrees(point.directionDeg)}</span>
        ))}
      </div>
      <div className="h-[370px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 2, bottom: 4, left: -22 }}>
            <defs>
              <linearGradient id="gustGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#8ED8F7" stopOpacity={0.74} />
                <stop offset="60%" stopColor="#BFEFFF" stopOpacity={0.42} />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.06} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E6EAF0" strokeDasharray="5 5" vertical />
            <XAxis
              dataKey="timeMs"
              domain={['dataMin', 'dataMax']}
              scale="time"
              type="number"
              tickFormatter={formatAxisTime}
              tick={{ fill: '#1D1D1F', fontSize: 13 }}
              axisLine={{ stroke: '#C8D1DA' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="wind"
              domain={[0, 'dataMax + 2']}
              unit=""
              tick={{ fill: '#1D1D1F', fontSize: 12 }}
              axisLine={{ stroke: '#C8D1DA' }}
              tickLine={false}
              label={{ value: 'м/с', position: 'top', offset: 10, fill: '#0D2B48', fontSize: 14, fontWeight: 700 }}
            />
            <YAxis
              yAxisId="temp"
              orientation="right"
              domain={['dataMin - 5', 'dataMax + 5']}
              tick={{ fill: '#1D1D1F', fontSize: 12 }}
              axisLine={{ stroke: '#C8D1DA' }}
              tickLine={false}
              label={{ value: '°C', position: 'top', offset: 10, fill: '#0D2B48', fontSize: 14, fontWeight: 700 }}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              yAxisId="wind"
              type="monotone"
              dataKey="gust"
              name="Порывы"
              stroke="#9EB4CA"
              strokeWidth={1.2}
              fill="url(#gustGradient)"
              connectNulls
            />
            <Line
              yAxisId="wind"
              type="monotone"
              dataKey="avgWind"
              name="Средний ветер"
              stroke="#0D3B5F"
              strokeWidth={2.4}
              dot={false}
              connectNulls
            />
            <Line
              yAxisId="wind"
              type="monotone"
              dataKey="forecastWind"
              name="Прогноз ветра"
              stroke="#0D3B5F"
              strokeDasharray="7 7"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temp"
              name="Температура"
              stroke="#E46A7D"
              strokeDasharray="7 7"
              strokeWidth={1.8}
              dot={false}
              connectNulls
            />
            <ReferenceLine yAxisId="wind" x={now} stroke="#0D3B5F" strokeWidth={1.2} ifOverflow="extendDomain" />
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 18, fontSize: 13, color: '#41566A' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function toChartPoint(point: WeatherPoint, forecastOnly: boolean): ChartPoint {
  const timeMs = new Date(point.time).getTime();
  return {
    timeMs,
    label: point.label,
    avgWind: forecastOnly ? null : point.avgWind,
    gust: forecastOnly ? null : point.gust,
    forecastWind: forecastOnly ? point.avgWind ?? point.forecastWind ?? null : null,
    temp: point.temp,
    directionDeg: point.directionDeg
  };
}

function formatAxisTime(value: number): string {
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number }>; label?: number }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-black/5 bg-white/95 p-3 text-sm shadow-card backdrop-blur dark:border-white/10 dark:bg-[#191c22]/95">
      <div className="mb-1 font-semibold text-[#0D2B48] dark:text-white">{formatAxisTime(label ?? Date.now())}</div>
      {payload.map((entry) => (
        <div key={entry.name} className="text-[#526273] dark:text-white/65">
          {entry.name}: {formatNumber(entry.value, 1)}
        </div>
      ))}
    </div>
  );
}
