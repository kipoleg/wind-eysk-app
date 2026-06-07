import { ArrowRightCircle, Fan, Star } from 'lucide-react';
import { STATIONS } from '../data/stations';
import { useWeatherStore } from '../store/weatherStore';
import { formatWind } from '../utils/format';

export function StationScroller() {
  const { stations, activeStationId, favorites, settings, setActiveStation, toggleFavorite } = useWeatherStore();

  return (
    <section className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-4">
      {STATIONS.map((station) => {
        const isActive = activeStationId === station.id;
        const current = stations[station.id]?.current;
        const isFavorite = favorites.includes(station.id);
        return (
          <button
            key={station.id}
            type="button"
            onClick={() => setActiveStation(station.id)}
            className={`min-w-[154px] rounded-ios border bg-white p-3 text-left shadow-[0_10px_28px_rgba(29,29,31,0.06)] transition active:scale-[0.98] dark:bg-[#1f2229] ${
              isActive ? 'border-iosBlue' : 'border-black/5 dark:border-white/8'
            }`}
          >
            <div className="flex items-center justify-between text-[15px] text-[#3b536a] dark:text-white/75">
              <span className="flex items-center gap-2">
                <Fan className="text-iosBlue" size={22} fill="currentColor" />
                {station.id}
              </span>
              <Star
                size={16}
                className={isFavorite ? 'text-iosBlue' : 'text-transparent'}
                fill={isFavorite ? 'currentColor' : 'none'}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleFavorite(station.id);
                }}
              />
            </div>
            <div className="mt-2 truncate text-[19px] font-semibold text-[#18324A] dark:text-white">{station.name}</div>
            <div className="mt-5 flex items-center justify-between">
              <div className="text-[25px] font-bold text-[#0D2B48] dark:text-white">
                {formatWind(current?.avgWind, settings.unit)}
              </div>
              <ArrowRightCircle size={28} strokeWidth={1.7} className="text-[#18324A] dark:text-white" />
            </div>
          </button>
        );
      })}
    </section>
  );
}
