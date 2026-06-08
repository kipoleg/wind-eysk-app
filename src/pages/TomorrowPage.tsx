import { useWeatherStore } from '../store/weatherStore';
import { StationDetailCard } from '../components/StationDetailCard';

export function TomorrowPage() {
  const { stations, activeStationId, unit, favorites, toggleFavorite } = useWeatherStore();
  const activeStationData = stations[activeStationId];

  if (!activeStationData) {
    return (
      <div className="mt-20 text-center text-[#526273] dark:text-white/60">
        Загрузка прогноза на завтра...
      </div>
    );
  }

  return (
    <main className="animate-fade-in">
      <StationDetailCard
        stationWeather={activeStationData}
        isFavorite={favorites.includes(activeStationId)}
        unit={unit}
        onToggleFavorite={() => toggleFavorite(activeStationId)}
        forecastMode="tomorrow"
      />
    </main>
  );
}