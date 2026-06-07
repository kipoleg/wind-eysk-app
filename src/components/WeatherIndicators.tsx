import { Cloud, Droplets, Gauge, Sun, Thermometer, Umbrella } from 'lucide-react';
import type { WeatherPoint } from '../types/weather';
import { formatNumber, formatTemp } from '../utils/format';

type WeatherIndicatorsProps = {
  point: WeatherPoint | null;
};

export function WeatherIndicators({ point }: WeatherIndicatorsProps) {
  const items = [
    { label: 'Давление', value: `${formatNumber(point?.pressure, 0)} гПа`, icon: Gauge },
    { label: 'Влажность', value: `${formatNumber(point?.humidity, 0)} %`, icon: Droplets },
    { label: 'Облачность', value: `${formatNumber(point?.cloudiness, 0)} %`, icon: Cloud },
    { label: 'Осадки', value: `${formatNumber(point?.precipitation, 1)} мм`, icon: Umbrella },
    { label: 'Вода', value: formatTemp(point?.waterTemp), icon: Thermometer },
    { label: 'UV индекс', value: formatNumber(point?.uvIndex, 0), icon: Sun }
  ];

  return (
    <div className="mt-7 grid grid-cols-2 overflow-hidden rounded-[13px] border border-black/5 bg-white/80 shadow-[0_8px_22px_rgba(29,29,31,0.04)] dark:border-white/8 dark:bg-white/5 sm:grid-cols-3 lg:grid-cols-6">
      {items.map(({ label, value, icon: Icon }) => (
        <div key={label} className="border-b border-r border-black/5 p-3 last:border-r-0 dark:border-white/8 lg:border-b-0">
          <div className="text-[14px] text-[#526273] dark:text-white/60">{label}</div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-[23px] font-bold text-[#0D2B48] dark:text-white">{value}</span>
            <Icon size={25} strokeWidth={1.6} className="text-[#159CE8]" />
          </div>
        </div>
      ))}
    </div>
  );
}
