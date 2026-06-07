import { MoreHorizontal, Star } from 'lucide-react';
import type { StationWeather, WindUnit } from '../types/weather';
import { formatDateTime } from '../utils/format';
import { HourlyForecast } from './HourlyForecast';
import { MetricStrip } from './MetricStrip';
import { WeatherIndicators } from './WeatherIndicators';
import { WindChart } from './WindChart';

type StationDetailCardProps = {
  stationWeather: StationWeather;
  isFavorite: boolean;
  unit: WindUnit;
  onToggleFavorite: () => void;
  forecastMode?: 'today' | 'tomorrow';
};

export function StationDetailCard({
  stationWeather,
  isFavorite,
  unit,
  onToggleFavorite,
  forecastMode = 'today'
}: StationDetailCardProps) {
  const { station, current, history, today, tomorrow, fromCache, lastUpdated } = stationWeather;
  const forecast = forecastMode === 'tomorrow' ? tomorrow : today;

  return (
    <section className="mx-3 rounded-ios border border-black/5 bg-white p-4 shadow-card dark:border-white/8 dark:bg-[#1b1e24] sm:mx-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[18px] text-[#18324A] dark:text-white/80">{station.id}</div>
          <div className="mt-1 flex items-center gap-2">
            <h2 className="text-[34px] font-bold leading-none text-[#0D2B48] dark:text-white">{station.name}</h2>
            <span className="rounded-full border border-appSuccess/30 bg-appSuccess/10 px-2 py-1 text-[13px] text-[#248A4C]">
              Онлайн
            </span>
          </div>
          <div className="mt-3 text-[14px] text-[#526273] dark:text-white/60">
            Обновлено: {formatDateTime(lastUpdated)}
            {fromCache ? ', из кеша' : ''}
          </div>
        </div>
        <div className="flex items-center gap-4 text-[#0D2B48] dark:text-white">
          <button type="button" onClick={onToggleFavorite} aria-label="Избранное" className="transition active:scale-95">
            <Star size={32} strokeWidth={1.6} fill={isFavorite ? '#0A84FF' : 'none'} className={isFavorite ? 'text-iosBlue' : ''} />
          </button>
          <MoreHorizontal size={31} />
        </div>
      </div>

      <MetricStrip point={current} unit={unit} />
      <WindChart history={history} forecast={forecast} />
      <WeatherIndicators point={current} />
      <HourlyForecast points={forecast} unit={unit} />
    </section>
  );
}
