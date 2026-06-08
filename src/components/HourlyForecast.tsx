import type { WeatherPoint } from '../types/weather';
import { formatNumber } from '../utils/format';
import { arrowFromDegrees } from '../utils/wind';

type HourlyForecastProps = {
  points: WeatherPoint[];
  tomorrow: WeatherPoint[];
  unit: any;
};

function getWindBgStyle(v: number | null | undefined): string {
  if (v == null) return 'rgb(255, 255, 255)';
  const min = 0;
  const max = 10;
  const t = Math.max(0, Math.min(1, (v - min) / (max - min)));
  
  const colors = [
    [255, 255, 255], 
    [173, 216, 230], 
    [144, 238, 144], 
    [255, 255, 128], 
    [255, 200, 100], 
    [255, 100, 100]  
  ];
  
  const n = colors.length - 1;
  const i = Math.floor(t * n);
  const f = t * n - i;
  
  if (i >= n) {
    const c = colors[n];
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  }
  
  const c1 = colors[i];
  const c2 = colors[i + 1];
  
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * f);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * f);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * f);
  
  return `rgb(${r}, ${g}, ${b})`;
}

function getTempBgStyle(t: number | null | undefined): string {
  if (t == null) return 'rgb(230, 230, 230)'; // ИСПРАВЛЕНИЕ: Безопасная проверка на null/undefined
  const minT = -10;
  const maxT = 35;
  // ИСПРАВЛЕНИЕ: Добавили оператор ?? 0, чтобы исключить тип undefined
  const target = Math.max(minT, Math.min(maxT, t ?? 0));

  const gradient: [number, [number, number, number]][] = [
    [-10, [0, 0, 180]],
    [0,   [100, 149, 237]],
    [10,  [144, 238, 144]],
    [20,  [255, 255, 128]],
    [30,  [255, 165, 0]],
    [35,  [255, 69, 0]]
  ];

  for (let i = 0; i < gradient.length - 1; i++) {
    if (target >= gradient[i][0] && target <= gradient[i + 1][0]) {
      const t0 = gradient[i][0]; const c0 = gradient[i][1];
      const t1 = gradient[i + 1][0]; const c1 = gradient[i + 1][1];
      const f = (target - t0) / (t1 - t0);
      
      const r = Math.round(c0[0] + (c1[0] - c0[0]) * f);
      const g = Math.round(c0[1] + (c1[1] - c0[1]) * f);
      const b = Math.round(c0[2] + (c1[2] - c0[2]) * f);
      
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  return `rgb(${gradient[gradient.length - 1][1].join(',')})`;
}

export function HourlyForecast({ points, tomorrow }: HourlyForecastProps) {
  const now = Date.now();
  const todayUpcoming = points.filter((point) => new Date(point.time).getTime() >= now - 45 * 60 * 1000);
  const combined = [...todayUpcoming, ...tomorrow].slice(0, 24);

  return (
    <section className="mt-7">
      <h2 className="mb-4 text-[20px] font-bold text-[#0D2B48] dark:text-white">Почасовой прогноз</h2>
      
      <div className="no-scrollbar overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1b1e24] w-full">
        <table className="w-auto border-collapse text-center text-[14px] font-medium min-w-full">
          <tbody>
            
            {/* СТРОКА 1: Время */}
            <tr className="border-b border-gray-100 dark:border-white/5">
              <td className="sticky left-0 z-10 w-[70px] min-w-[70px] bg-gray-50 dark:bg-[#16181d] px-2 py-2.5 text-left font-semibold text-gray-500 dark:text-white/65 shadow-[2px_0_5px_rgba(0,0,0,0.03)] border-r border-gray-100 dark:border-white/5">
                Время
              </td>
              {combined.map((point) => {
                const hour = point.label ? point.label.split(':')[0] : '';
                return (
                  <td key={`time-${point.id}`} className="w-[48px] min-w-[48px] px-1 py-2.5 text-gray-400 font-normal border-r border-gray-50 dark:border-white/5">
                    {hour}
                  </td>
                );
              })}
            </tr>

            {/* СТРОКА 2: Средний ветер */}
            <tr className="border-b border-gray-100 dark:border-white/5">
              <td className="sticky left-0 z-10 bg-gray-50 dark:bg-[#16181d] px-2 py-2.5 text-left font-semibold text-gray-500 dark:text-white/65 shadow-[2px_0_5px_rgba(0,0,0,0.03)] border-r border-gray-100 dark:border-white/5">
                m/s
              </td>
              {combined.map((point) => (
                <td 
                  key={`avg-${point.id}`} 
                  style={{ backgroundColor: getWindBgStyle(point.avgWind) }}
                  className="w-[48px] min-w-[48px] border-r border-b border-white/50 dark:border-neutral-900/40 px-1 py-2.5 text-black font-semibold"
                >
                  {point.avgWind ?? 0}
                </td>
              ))}
            </tr>

            {/* СТРОКА 3: Порывы ветра */}
            <tr className="border-b border-gray-100 dark:border-white/5">
              <td className="sticky left-0 z-10 bg-gray-50 dark:bg-[#16181d] px-2 py-2.5 text-left font-semibold text-gray-500 dark:text-white/65 shadow-[2px_0_5px_rgba(0,0,0,0.03)] border-r border-gray-100 dark:border-white/5">
                m/s*
              </td>
              {combined.map((point) => (
                <td 
                  key={`gust-${point.id}`} 
                  style={{ backgroundColor: getWindBgStyle(point.gust) }}
                  className="w-[48px] min-w-[48px] border-r border-b border-white/50 dark:border-neutral-900/40 px-1 py-2.5 text-black font-bold"
                >
                  {point.gust ?? 0}
                </td>
              ))}
            </tr>

            {/* СТРОКА 4: Температура */}
            <tr className="border-b border-gray-100 dark:border-white/5">
              <td className="sticky left-0 z-10 bg-gray-50 dark:bg-[#16181d] px-2 py-2.5 text-left font-semibold text-gray-500 dark:text-white/65 shadow-[2px_0_5px_rgba(0,0,0,0.03)] border-r border-gray-100 dark:border-white/5">
                C
              </td>
              {combined.map((point) => (
                <td 
                  key={`temp-${point.id}`} 
                  style={{ backgroundColor: getTempBgStyle(point.temp) }}
                  className="w-[48px] min-w-[48px] border-r border-b border-white/50 dark:border-neutral-900/40 px-1 py-2.5 text-black font-semibold"
                >
                  {point.temp ? `${Math.round(point.temp)}°` : '—'}
                </td>
              ))}
            </tr>

            {/* СТРОКА 5: Осадки */}
            <tr className="border-b border-gray-100 dark:border-white/5">
              <td className="sticky left-0 z-10 bg-gray-50 dark:bg-[#16181d] px-2 py-2.5 text-left font-semibold text-gray-500 dark:text-white/65 shadow-[2px_0_5px_rgba(0,0,0,0.03)] border-r border-gray-100 dark:border-white/5">
                мм
              </td>
              {combined.map((point) => {
                const precVal = point.precipitation ? Number(point.precipitation) : 0;
                let styleBg = {};
                
                if (precVal > 0) {
                  const intensity = Math.min(1, precVal / 5);
                  const r = Math.round(30 + 50 * (1 - intensity));
                  const g = Math.round(130 + 80 * (1 - intensity));
                  const b = Math.round(255 - 25 * intensity);
                  styleBg = { color: `rgb(${r}, ${g}, ${b})`, fontWeight: 'bold' };
                }

                return (
                  <td 
                    key={`precip-${point.id}`} 
                    style={styleBg}
                    className="w-[48px] min-w-[48px] border-r border-b border-gray-100 dark:border-white/5 px-1 py-2.5 bg-white dark:bg-[#1b1e24]"
                  >
                    {precVal > 0 ? formatNumber(precVal, 1) : ''}
                  </td>
                );
              })}
            </tr>

            {/* СТРОКА 6: Направление ветра */}
            <tr>
              <td className="sticky left-0 z-10 bg-gray-50 dark:bg-[#16181d] px-2 py-2 text-left font-semibold text-gray-500 dark:text-white/65 shadow-[2px_0_5px_rgba(0,0,0,0.03)] border-r border-gray-100 dark:border-white/5">
                Ветер
              </td>
              {combined.map((point) => (
                <td key={`dir-${point.id}`} className="w-[48px] min-w-[48px] px-1 py-2 text-[12px] text-gray-500 dark:text-white/80 bg-white dark:bg-[#1b1e24] border-r border-gray-50 dark:border-white/5">
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <span className="text-[14px] leading-none">{arrowFromDegrees(point.directionDeg)}</span>
                    <span className="text-[10px] font-bold tracking-tight uppercase">{point.directionLabel ?? '—'}</span>
                  </div>
                </td>
              ))}
            </tr>

          </tbody>
        </table>
      </div>
    </section>
  );
}