import { Link } from 'react-router-dom';
import { StationDetailCard } from '../components/StationDetailCard';
import { StationScroller } from '../components/StationScroller';
import { useWeatherStore } from '../store/weatherStore';

export function HomePage() {
  const { stations, activeStationId, favorites, settings, toggleFavorite, loading, globalError } = useWeatherStore();
  const active = stations[activeStationId];

  return (
    <>
      <StationScroller />
      <div className="mb-3 flex items-center justify-between px-4">
        <div className="text-[14px] text-[#526273] dark:text-white/60">
          {loading ? 'Обновляем данные…' : globalError ?? 'История и прогноз на сегодня'}
        </div>
        <Link to="/tomorrow" className="rounded-full bg-iosBlue px-4 py-2 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(10,132,255,0.25)]">
          Завтра
        </Link>
      </div>
      {active && (
        <StationDetailCard
          stationWeather={active}
          isFavorite={favorites.includes(activeStationId)}
          unit={settings.unit}
          onToggleFavorite={() => toggleFavorite(activeStationId)}
        />
      )}
    </>
  );
}
