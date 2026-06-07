import type { WeatherPoint, WindUnit } from '../types/weather';
import { formatNumber, formatTemp, formatWind } from '../utils/format';
import { arrowFromDegrees } from '../utils/wind';

type HourlyForecastProps = {
  points: WeatherPoint[];
  unit: WindUnit;
};

export function HourlyForecast({ points, unit }: HourlyForecastProps) {
  const now = Date.now();
  const upcoming = points.filter((point) => new Date(point.time).getTime() >= now - 45 * 60 * 1000).slice(0, 10);

  return (
    <section className="mt-7">
      <h2 className="mb-4 text-[20px] font-bold text-[#0D2B48] dark:text-white">Почасовой прогноз</h2>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-3">
        {upcoming.map((point) => (
          <article key={point.id} className="min-w-[84px] text-center">
            <div className="mb-3 text-[14px] text-black dark:text-white">{point.label}</div>
            <div className="overflow-hidden rounded-[7px] bg-gradient-to-b from-[#ECFAE9] via-[#DFF5F7] to-[#D8F1FF] shadow-[0_8px_18px_rgba(29,29,31,0.05)]">
              <div className="px-2 py-3 text-[17px] font-semibold text-[#0D2B48] dark:text-[#0D2B48]">
                {arrowFromDegrees(point.directionDeg)} {point.directionLabel}
              </div>
              <div className="px-2 pb-3 text-[20px] font-bold text-black">{formatWind(point.avgWind, unit)}</div>
              <div className="px-2 pb-3 text-[16px] text-black">{formatWind(point.gust, unit)}</div>
              <div className="bg-[#FFF4AE]/80 px-2 py-3 text-[20px] font-bold text-black">{formatTemp(point.temp)}</div>
            </div>
            <div className="mt-4 text-[13px] text-[#41566A] dark:text-white/70">
              <span className="text-[#159CE8]">◌</span> {formatNumber(point.precipitation, 1)} мм
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
