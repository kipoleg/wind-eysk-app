import { Moon, RefreshCw, Ruler, Star, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import { STATIONS } from '../data/stations';
import { useWeatherStore } from '../store/weatherStore';
import type { ThemeMode, WindUnit } from '../types/weather';

const refreshOptions = [1, 5, 10, 15];

export function SettingsPage() {
  const { settings, favorites, updateSettings, toggleFavorite } = useWeatherStore();

  return (
    <main className="space-y-4 px-4">
      <section className="rounded-ios border border-black/5 bg-white p-5 shadow-card dark:border-white/8 dark:bg-[#1b1e24]">
        <h2 className="text-[28px] font-bold text-[#0D2B48] dark:text-white">Настройки</h2>
        <div className="mt-5 space-y-5">
          <SettingRow icon={<Sun />} title="Тема">
            <Segmented
              value={settings.theme}
              options={[
                ['light', 'Светлая'],
                ['dark', 'Темная'],
                ['system', 'Авто']
              ]}
              onChange={(value) => updateSettings({ theme: value as ThemeMode })}
            />
          </SettingRow>

          <SettingRow icon={<RefreshCw />} title="Интервал обновления">
            <div className="flex gap-2">
              {refreshOptions.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => updateSettings({ refreshInterval: minutes })}
                  className={`rounded-full px-3 py-2 text-[14px] font-semibold ${
                    settings.refreshInterval === minutes ? 'bg-iosBlue text-white' : 'bg-[#F1F3F6] text-[#526273] dark:bg-white/8 dark:text-white/70'
                  }`}
                >
                  {minutes} мин
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow icon={<Ruler />} title="Единицы измерения">
            <Segmented
              value={settings.unit}
              options={[
                ['ms', 'м/с'],
                ['kmh', 'км/ч'],
                ['knots', 'узлы']
              ]}
              onChange={(value) => updateSettings({ unit: value as WindUnit })}
            />
          </SettingRow>

          <SettingRow icon={<Moon />} title="Standalone PWA">
            <span className="text-[15px] text-[#526273] dark:text-white/60">Готово для iPhone и Android</span>
          </SettingRow>
        </div>
      </section>

      <section className="rounded-ios border border-black/5 bg-white p-5 shadow-card dark:border-white/8 dark:bg-[#1b1e24]">
        <h3 className="text-[20px] font-bold text-[#0D2B48] dark:text-white">Избранные станции</h3>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {STATIONS.map((station) => {
            const active = favorites.includes(station.id);
            return (
              <button
                key={station.id}
                type="button"
                onClick={() => toggleFavorite(station.id)}
                className="flex items-center justify-between rounded-2xl bg-[#F7F8FA] p-3 text-left dark:bg-white/5"
              >
                <span>
                  <span className="block text-[13px] text-[#526273] dark:text-white/60">{station.id}</span>
                  <span className="font-semibold text-[#0D2B48] dark:text-white">{station.name}</span>
                </span>
                <Star size={24} fill={active ? '#0A84FF' : 'none'} className={active ? 'text-iosBlue' : 'text-[#526273]'} />
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function SettingRow({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-black/5 pb-5 last:border-b-0 last:pb-0 dark:border-white/8">
      <div className="flex items-center gap-3 text-[#0D2B48] dark:text-white">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#EAF4FF] text-iosBlue dark:bg-white/8">{icon}</span>
        <span className="font-semibold">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Segmented({
  value,
  options,
  onChange
}: {
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 rounded-2xl bg-[#EEF1F5] p-1 dark:bg-[#101215]">
      {options.map(([optionValue, label]) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onChange(optionValue)}
          className={`rounded-xl px-3 py-2 text-[14px] font-semibold ${
            value === optionValue ? 'bg-white text-iosBlue shadow-sm dark:bg-[#252934]' : 'text-[#526273] dark:text-white/65'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
