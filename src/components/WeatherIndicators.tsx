import { Thermometer, Umbrella, Waves } from 'lucide-react';
import type { WeatherPoint } from '../types/weather';

type WeatherIndicatorsProps = {
  point: WeatherPoint | null;
  forceAirTemp?: number | null;
  forceWaterTemp?: number | null;
};

export function WeatherIndicators({ point, forceAirTemp, forceWaterTemp }: WeatherIndicatorsProps) {
  const airTemp = forceAirTemp !== undefined ? forceAirTemp : point?.airTemp;
  const waterTemp = forceWaterTemp !== undefined ? forceWaterTemp : point?.waterTemp;
  const precipitation = point?.precipitation ?? 0;

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
      
      {/* Карточка: Воздух */}
      <div className="flex items-center justify-between rounded-ios bg-[#F1F3F6] p-3 sm:p-4 dark:bg-white/5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] sm:text-[13px] font-medium text-[#526273] dark:text-white/60">Воздух</span>
          <span className="text-[16px] sm:text-[20px] font-bold text-[#0D2B48] dark:text-white">
            {airTemp !== null && airTemp !== undefined ? `${airTemp}°C` : '—'}
          </span>
        </div>
        <span className="grid h-7 w-7 sm:h-9 sm:w-9 place-items-center rounded-full bg-[#EAF4FF] text-iosBlue dark:bg-white/8 hidden xs:grid">
          <Thermometer size={18} />
        </span>
      </div>

      {/* Карточка: Осадки */}
      <div className="flex items-center justify-between rounded-ios bg-[#F1F3F6] p-3 sm:p-4 dark:bg-white/5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] sm:text-[13px] font-medium text-[#526273] dark:text-white/60">Осадки</span>
          <span className="text-[16px] sm:text-[20px] font-bold text-[#0D2B48] dark:text-white">
            {precipitation} мм
          </span>
        </div>
        <span className="grid h-7 w-7 sm:h-9 sm:w-9 place-items-center rounded-full bg-[#EAF4FF] text-iosBlue dark:bg-white/8 hidden xs:grid">
          <Umbrella size={18} />
        </span>
      </div>

      {/* Карточка: Вода */}
      <div className="flex items-center justify-between rounded-ios bg-[#F1F3F6] p-3 sm:p-4 dark:bg-white/5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] sm:text-[13px] font-medium text-[#526273] dark:text-white/60">Вода</span>
          <span className="text-[16px] sm:text-[20px] font-bold text-[#0D2B48] dark:text-white">
            {waterTemp !== null && waterTemp !== undefined ? `${waterTemp}°C` : '—'}
          </span>
        </div>
        <span className="grid h-7 w-7 sm:h-9 sm:w-9 place-items-center rounded-full bg-[#EAF4FF] text-iosBlue dark:bg-white/8 hidden xs:grid">
          <Waves size={18} />
        </span>
      </div>

    </div>
  );
}