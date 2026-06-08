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

        // Определяем, находится ли станция в онлайне (данные свежее 30 минут)
        const isOnline = current != null && (Date.now() - new Date(current.time).getTime()) < 30 * 60 * 1000;

        // Направление стрелки (+90 градусов для синхронизации с метеорологическим направлением)
        const rotationDegrees = current?.directionDeg != null ? current.directionDeg + 90 : 0;

return (
          <button
            key={station.id}
            type="button"
            onClick={() => setActiveStation(station.id)}
            className={`flex flex-col min-w-[154px] h-[115px] rounded-ios border bg-white p-3 text-left shadow-[0_10px_28px_rgba(29,29,31,0.06)] transition active:scale-[0.98] dark:bg-[#1f2229] ${
              isActive ? 'border-iosBlue' : 'border-black/5 dark:border-white/8'
            } ${
              !isOnline ? 'grayscale opacity-75' : ''
            }`}
          >
            {/* Верхняя строка: Иконка, ID и Звезда */}
            <div className="flex items-center justify-between text-[15px] text-[#3b536a] dark:text-white/75 w-full">
              <span className="flex items-center gap-2">
                <Fan 
                  className={`text-iosBlue ${isOnline ? 'animate-[spin_4s_linear_infinite]' : ''}`} 
                  size={22} 
                  fill="currentColor" 
                />
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
        
            {/* Название станции: убрали лишний mt-2 и жестко ограничили высоту */}
            <div className="mt-1 truncate text-[19px] font-semibold text-[#18324A] dark:text-white w-full leading-snug">
              {station.name}
            </div>
        
            {/* Нижняя строка: скорость и стрелка. mt-auto идеально прижмет блок к низу */}
            <div className="mt-auto flex items-center justify-between w-full">
              <div className="text-[25px] font-bold text-[#0D2B48] dark:text-white leading-none">
                {formatWind(current?.avgWind, settings.unit)}
              </div>
              <ArrowRightCircle 
                size={28} 
                strokeWidth={1.7} 
                className="text-[#18324A] transition-transform duration-300 dark:text-white" 
                style={{ transform: `rotate(${rotationDegrees}deg)` }}
              />
            </div>
          </button>
        );
      })}
    </section>
  );
}