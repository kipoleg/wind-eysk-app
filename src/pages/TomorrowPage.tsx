import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StationDetailCard } from '../components/StationDetailCard';
import { StationScroller } from '../components/StationScroller';
import { useWeatherStore } from '../store/weatherStore';

export function TomorrowPage() {
  const { stations, activeStationId, favorites, settings, toggleFavorite } = useWeatherStore();
  const active = stations[activeStationId];

  return (
    <>
      <StationScroller />
      <div className="mb-3 flex items-center justify-between px-4">
        <Link to="/" className="inline-flex items-center gap-1 text-[15px] font-semibold text-iosBlue">
          <ChevronLeft size={19} /> Сегодня
        </Link>
        <div className="text-[14px] text-[#526273] dark:text-white/60">Прогноз на завтра</div>
      </div>
      {active && (
        <StationDetailCard
          stationWeather={active}
          isFavorite={favorites.includes(activeStationId)}
          unit={settings.unit}
          onToggleFavorite={() => toggleFavorite(activeStationId)}
          forecastMode="tomorrow"
        />
      )}
    </>
  );
}
