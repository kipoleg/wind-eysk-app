import { useEffect, useRef, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useWeatherStore } from '../store/weatherStore';
import type { WeatherPoint } from '../types/weather';
import { arrowFromDegrees } from '../utils/wind';

type WindChartProps = {
  history: WeatherPoint[];
  forecast: WeatherPoint[];
  onPointHover: (point: WeatherPoint | null) => void;
};

type ChartPoint = {
  timeMs: number;
  label: string;
  avgWind: number | null;
  gust: number | null;
  minWind: number | null;
  directionDeg: number | null;
  time: string;
  directionLabel?: string;
};

export function WindChart({ history, onPointHover }: WindChartProps) {
  const { refresh, settings } = useWeatherStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isTooltipActive, setIsTooltipActive] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isVerticalSwipeRef = useRef<boolean>(false);

  const now = Date.now();
  const cutoff = now - 24 * 60 * 60 * 1000;
  const INTERVAL = 15 * 60 * 1000;

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const intervalMs = (settings?.refreshInterval ?? 5) * 60 * 1000;
    const timer = setInterval(() => {
      refresh(); 
    }, intervalMs);
    return () => clearInterval(timer);
  }, [refresh, settings?.refreshInterval]);

  const data = (history || [])
    .filter((point) => point && point.time && new Date(point.time).getTime() >= cutoff)
    .reduce<WeatherPoint[]>((acc, point) => {
      const last = acc.at(-1);
      if (!last || new Date(point.time).getTime() - new Date(last.time).getTime() >= INTERVAL) {
        acc.push(point);
      }
      return acc;
    }, [])
    .map((point) => toChartPoint(point))
    .sort((a, b) => a.timeMs - b.timeMs);

  useEffect(() => {
    if (scrollContainerRef.current && scrollContainerRef.current.scrollWidth > scrollContainerRef.current.clientWidth) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [data.length]);

  if (data.length === 0) {
    return <div className="mt-7 text-center text-sm text-[#526273] dark:text-white/40">Нет данных истории</div>;
  }

  const directions = data.filter((_, index) => index % Math.max(1, Math.ceil(data.length / 26)) === 0).slice(0, 26);

  const domainMin = data[0].timeMs;
  const lastHistoryPointMs = data[data.length - 1].timeMs;
  const domainMax = lastHistoryPointMs + 2.5 * 60 * 60 * 1000;

  const maxGustValue = Math.max(...data.map(d => d.gust ?? 0));
  const yAxisMax = maxGustValue + 2;

  const getOffsetPercent = (windValue: number) => {
    const val = Math.max(0, Math.min(yAxisMax, windValue));
    return `${ Math.round((1 - val / yAxisMax) * 100)}%`;
  };

  const tickStep = 2 * 60 * 60 * 1000; 
  const firstTick = Math.ceil(domainMin / tickStep) * tickStep;
  const ticks: number[] = [];
  for (let t = firstTick; t < domainMax - 30 * 60 * 1000; t += tickStep) {
    ticks.push(t);
  }
  ticks.push(domainMax);

  const handleMouseLeave = () => {
    setIsTooltipActive(false);
    onPointHover(null);
    touchStartRef.current = null;
    isVerticalSwipeRef.current = false;
  };

  const colors = {
    grid: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E6EAF0',
    axisLine: isDark ? 'rgba(255, 255, 255, 0.15)' : '#C8D1DA',
    textX: isDark ? 'rgba(255, 255, 255, 0.6)' : '#1D1D1F',
    textY: isDark ? 'rgba(255, 255, 255, 0.7)' : '#0D2B48',
    cursor: isDark ? 'rgba(255, 255, 255, 0.3)' : '#526273',
    legend: isDark ? 'rgba(255, 255, 255, 0.6)' : '#41566A'
  };

  return (
    <div className="mt-7 relative w-full select-none outline-none" style={{ WebkitTapHighlightColor: 'transparent' }}>
      <div 
        ref={scrollContainerRef}
        // ИСПРАВЛЕНО: Вернули overflow-y-hidden для корректного горизонтального скролла на iOS
        className="no-scrollbar overflow-x-auto overflow-y-hidden w-full relative select-none md:overflow-x-visible outline-none"
        // ИСПРАВЛЕНО: Изменили touchAction на manipulation, чтобы разрешить и нативный скролл, и pull-to-refresh
        style={{ WebkitTapHighlightColor: 'transparent', outline: 'none', touchAction: 'manipulation' }}
      >
        <div className="w-[920px] md:w-full flex flex-col select-none outline-none" style={{ WebkitTapHighlightColor: 'transparent', outline: 'none' }}>
          
          {/* Направления ветра */}
          <div className="-mt-2 mb-4 flex items-center justify-between pl-4 pr-6 text-[22px] text-[#0D2B48] dark:text-white/70 select-none outline-none" style={{ WebkitTapHighlightColor: 'transparent', outline: 'none' }}>
            {directions.map((point) => (
              <span key={point.timeMs} className="w-6 text-center select-none outline-none">{arrowFromDegrees(point.directionDeg)}</span>
            ))}
          </div>

          {/* Область графика */}
          <div 
            className="h-[370px] w-full select-none outline-none" 
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', outline: 'none' }}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              touchStartRef.current = { x: touch.clientX, y: touch.clientY };
              isVerticalSwipeRef.current = false;
            }}
            onTouchMove={(e) => {
              if (!touchStartRef.current) return;
              const touch = e.touches[0];
              const diffX = Math.abs(touch.clientX - touchStartRef.current.x);
              const diffY = Math.abs(touch.clientY - touchStartRef.current.y);

              // Если тянем строго вниз — активируем флаг вертикального свайпа
              if (diffY > diffX && diffY > 8) {
                isVerticalSwipeRef.current = true;
              }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart 
                data={data} 
                margin={{ top: 0, right: 25, bottom: 4, left: 10 }}
                style={{ 
                  WebkitTapHighlightColor: 'transparent', 
                  outline: 'none',
                  boxShadow: 'none'
                }}
                onMouseMove={(e) => {
                  // Если юзер делает свайп вниз для обновления, блокируем триггеры Recharts
                  if (isVerticalSwipeRef.current) {
                    if (isTooltipActive) handleMouseLeave();
                    return;
                  }

                  if (e && e.activeTooltipIndex !== undefined && data[e.activeTooltipIndex]) {
                    setIsTooltipActive(true);
                    const rawPoint = data[e.activeTooltipIndex];
                    
                    onPointHover({
                      id: `hist-${rawPoint.timeMs}`,
                      stationId: '',
                      time: rawPoint.time,
                      label: rawPoint.label,
                      avgWind: rawPoint.avgWind,
                      gust: rawPoint.gust,
                      minWind: rawPoint.minWind,
                      directionDeg: rawPoint.directionDeg,
                      directionLabel: rawPoint.directionLabel ?? '',
                      airTemp: null,
                      waterTemp: null
                    });
                  }
                }}
                onMouseLeave={handleMouseLeave}
                onTouchEnd={handleMouseLeave}
              >
                <defs>
                  <linearGradient id="gustGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={getOffsetPercent(25)} stopColor="#7C3AED" stopOpacity={0.85} />
                    <stop offset={getOffsetPercent(23)} stopColor="#7C3AED" stopOpacity={0.75} />
                    <stop offset={getOffsetPercent(20)} stopColor="#DC2626" stopOpacity={0.75} />
                    <stop offset={getOffsetPercent(15)} stopColor="#DC2626" stopOpacity={0.65} />
                    <stop offset={getOffsetPercent(15)} stopColor="#EA580C" stopOpacity={0.65} />
                    <stop offset={getOffsetPercent(11)} stopColor="#EA580C" stopOpacity={0.55} />
                    <stop offset={getOffsetPercent(10)} stopColor="#16A34A" stopOpacity={0.55} />
                    <stop offset={getOffsetPercent(7)} stopColor="#16A34A" stopOpacity={0.45} />
                    <stop offset={getOffsetPercent(6.9)} stopColor="#159CE8" stopOpacity={0.45} />
                    <stop offset={getOffsetPercent(0)} stopColor="#8ED8F7" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid stroke={colors.grid} strokeDasharray="5 5" vertical />
                
                <XAxis
                  dataKey="timeMs"
                  type="number"
                  domain={[domainMin, domainMax]}
                  tickFormatter={formatAxisTime}
                  tick={{ fill: colors.textX, fontSize: 13 }}
                  axisLine={{ stroke: colors.axisLine }}
                  tickLine={false}
                  ticks={ticks}
                />
                
                <YAxis
                  yAxisId="wind"
                  orientation="right"
                  // ИСПРАВЛЕНО: увеличили запас сверху (+4 вместо +2), чтобы опустить сетку и цифры ниже
                  domain={[0, 'dataMax + 4']}
                  tickFormatter={(value) => (value === 0 ? '' : value)}
                  tick={{ fill: colors.textY, fontSize: 14, fontWeight: 'bold', textAnchor: 'end' }}
                  axisLine={false}
                  tickLine={false}
                  width={30} 
                  dx={22}    
                />
                
                <Tooltip 
                  trigger="axis"
                  shared={true}
                  content={() => null}
                  animationDuration={0}
                  cursor={isTooltipActive ? {
                    stroke: colors.cursor,
                    strokeWidth: 1.5,
                    strokeDasharray: 'none'
                  } : false}
                />
                
                <Area yAxisId="wind" type="monotone" dataKey="gust" name="Порывы" stroke="#4192B5" strokeWidth={1.4} fill="url(#gustGradient)" dot={false} connectNulls isAnimationActive={false} />
                <Line yAxisId="wind" type="monotone" dataKey="avgWind" name="Средний ветер" stroke="#0D3B5F" strokeWidth={2.4} dot={false} activeDot={false} connectNulls isAnimationActive={false} />
                <Line yAxisId="wind" type="monotone" dataKey="minWind" name="Мин. ветер" stroke="#9EB4CA" strokeWidth={1.5} dot={false} activeDot={false} connectNulls isAnimationActive={false} />
                
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: 18, fontSize: 13, color: colors.legend }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
}

function toChartPoint(point: WeatherPoint): ChartPoint {
  const timeMs = new Date(point.time).getTime();
  return {
    timeMs,
    time: point.time,
    label: point.label ?? '',
    avgWind: point.avgWind === 0 && point.gust === 0 ? null : point.avgWind,
    gust: point.gust === 0 && point.avgWind === 0 ? null : point.gust,
    minWind: point.minWind === 0 && point.gust === 0 ? null : point.minWind,
    directionDeg: point.directionDeg,
    directionLabel: point.directionLabel
  };
}

function formatAxisTime(value: number): string {
  if (!value) return '';
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}