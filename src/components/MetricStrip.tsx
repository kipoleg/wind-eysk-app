import type { CurrentWeather, WindUnit } from '../types/weather';
import { arrowFromDegrees } from '../utils/wind';

type MetricStripProps = {
  point: CurrentWeather | null;
  unit: WindUnit;
};

// Вспомогательная функция для вывода десятых долей без лишнего дублирования кода
const formatValue = (val: number | null | undefined): string | number => {
  if (val == null) return 0;
  // Если число целое (например, 2.0), выводим просто "2"
  // Если есть дробная часть (например, 2.3), выводим "2,3"
  return val % 1 === 0 ? val : val.toFixed(1).replace('.', ',');
};

export function MetricStrip({ point, unit }: MetricStripProps) {
  if (!point) return null;

  // ИСПРАВЛЕНО: Убрали жесткое округление Math.round
  const avgWind = formatValue(point.avgWind);
  const gust = formatValue(point.gust);
  const minWind = formatValue(point.minWind);

  return (
    <div className="mt-5 flex items-center justify-between border-b border-black/5 pb-5 dark:border-white/5 w-full px-1">
      
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-[#248A4C]/30 bg-[#248A4C]/10 text-[#248A4C] dark:border-[#34C759]/30 dark:bg-[#34C759]/10 dark:text-[#34C759]">
          <span className="text-[22px] font-bold leading-none select-none">
            {arrowFromDegrees(point.directionDeg)}
          </span>
        </div>
        
        <div className="flex flex-col min-w-0">
          <div className="text-[26px] font-bold tracking-tight text-[#0D2B48] dark:text-white leading-none">
            {avgWind} <span className="text-[14px] font-medium text-gray-400">{unit}</span>
          </div>
          <div className="mt-1 text-[12px] font-semibold text-[#526273] dark:text-white/60 uppercase tracking-wider leading-none">
            {point.directionLabel ?? 'W'}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 min-w-0">
        <div className="text-[26px] font-bold tracking-tight text-[#0D2B48] dark:text-white leading-none">
          {gust}
        </div>
        <div className="mt-1 text-[12px] font-medium text-[#526273] dark:text-white/60 leading-none">
          Порывы
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 min-w-0 text-right sm:text-center">
        <div className="text-[26px] font-bold tracking-tight text-[#526273] dark:text-white/70 leading-none">
          {minWind}
        </div>
        <div className="mt-1 text-[12px] font-medium text-[#526273] dark:text-white/60 leading-none">
          Провал
        </div>
      </div>

    </div>
  );
}