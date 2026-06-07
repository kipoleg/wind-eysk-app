import { ArrowRightCircle } from 'lucide-react';
import type { WeatherPoint, WindUnit } from '../types/weather';
import { formatTemp, formatWind } from '../utils/format';
import { arrowFromDegrees } from '../utils/wind';

type MetricStripProps = {
  point: WeatherPoint | null;
  unit: WindUnit;
};

export function MetricStrip({ point, unit }: MetricStripProps) {
  const metrics = [
    {
      value: formatWind(point?.avgWind, unit),
      label: 'Средний ветер',
      leading: <ArrowRightCircle size={58} strokeWidth={1.4} className="text-appSuccess" />
    },
    { value: formatWind(point?.gust, unit), label: 'Порывы' },
    { value: formatWind(point?.minWind, unit), label: 'Мин. ветер' },
    { value: formatTemp(point?.temp), label: 'Температура' },
    {
      value: `${point?.directionLabel ?? '—'} ${arrowFromDegrees(point?.directionDeg)}`,
      label: 'Направление'
    }
  ];

  return (
    <div className="mt-7 grid grid-cols-5 items-center gap-2">
      {metrics.map((metric, index) => (
        <div key={metric.label} className="min-w-0">
          <div className="flex min-h-[62px] items-center gap-2">
            {metric.leading}
            <div className={`font-bold text-[#0D2B48] dark:text-white ${index === 0 ? 'text-[34px]' : 'text-[33px]'}`}>
              {metric.value}
            </div>
          </div>
          <div className="truncate text-[14px] text-[#41566A] dark:text-white/65">{metric.label}</div>
        </div>
      ))}
    </div>
  );
}
