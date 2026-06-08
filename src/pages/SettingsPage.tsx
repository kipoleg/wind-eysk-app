import { RefreshCw, Sun } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useWeatherStore } from '../store/weatherStore';
import type { ThemeMode } from '../types/weather';

const refreshOptions = [1, 5, 10, 15];

export function SettingsPage() {
  const { settings, updateSettings } = useWeatherStore();
  const [isUpdating, setIsUpdating] = useState(false);

  // Функция жесткого сброса кэша специально для обхода ограничений iOS и Apache
  const handleAppUpdate = async () => {
    setIsUpdating(true);
    try {
      // 1. Сносим все зарегистрированные Service Workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      
      // 2. Полностью вычищаем CacheStorage
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }

      // 3. ИСПРАВЛЕНО: Перенаправляем строго на корень /eisk/, чтобы Apache не выдавал 404
      window.location.href = window.location.origin + '/eisk/?update=' + Date.now();
    } catch (error) {
      console.error('Ошибка при обновлении кэша:', error);
      window.location.reload();
    }
  };

  return (
    <main className="space-y-4 px-4">
      <section className="rounded-ios border border-black/5 bg-white p-5 shadow-card dark:border-white/8 dark:bg-[#1b1e24]">
        <h2 className="text-[28px] font-bold text-[#0D2B48] dark:text-white">Настройки</h2>
        <div className="mt-5 space-y-5">
          
          {/* 1. Тема */}
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

          {/* 2. Интервал обновления */}
          <SettingRow icon={<RefreshCw />} title="Интервал обновления">
            <div className="flex gap-2">
              {refreshOptions.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => updateSettings({ refreshInterval: minutes })}
                  className={`rounded-full px-3 py-2 text-[14px] font-semibold transition-colors ${
                    settings.refreshInterval === minutes 
                      ? 'bg-iosBlue text-white' 
                      : 'bg-[#F1F3F6] text-[#526273] dark:bg-white/10 dark:text-white/70 hover:dark:bg-white/15'
                  }`}
                >
                  {minutes} мин
                </button>
              ))}
            </div>
          </SettingRow>

          {/* 3. Версия приложения + Кнопка принудительного обновления кэша */}
          <div className="flex items-center justify-between border-b border-black/5 pb-5 dark:border-white/8">
            <div className="flex flex-col gap-1">
              <div className="text-[13px] font-medium text-[#526273] dark:text-white/60">
                Версия приложения
              </div>
              <div className="text-[16px] font-semibold text-[#0D2B48] dark:text-white">
                1.5
              </div>
            </div>
            
            <button
              onClick={handleAppUpdate}
              disabled={isUpdating}
              className={`rounded-full px-4 py-1.5 text-[13px] font-bold shadow-sm transition-all active:scale-95 ${
                isUpdating 
                  ? 'bg-[#F1F3F6] text-[#526273]/50 cursor-not-allowed dark:bg-white/5 dark:text-white/30' 
                  : 'bg-iosBlue text-white hover:bg-iosBlue/90'
              }`}
            >
              {isUpdating ? 'Обновление...' : 'Обновить'}
            </button>
          </div>

          {/* 4. Обратная связь / Баги */}
          <div className="flex flex-col gap-1 border-b border-black/5 pb-5 dark:border-white/8">
            <div className="text-[13px] font-medium text-[#526273] dark:text-white/60">
              Нашли баг?
            </div>
            <a 
              href="mailto:wind@sintez.info" 
              className="text-[16px] font-semibold text-iosBlue hover:underline inline-flex items-center gap-1.5 w-max"
            >
              wind@sintez.info
            </a>
          </div>

          {/* 5. Разработка */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center gap-3 text-[#0D2B48] dark:text-white">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#EAF4FF] text-iosBlue dark:bg-white/8 font-bold text-[14px]">
                S
              </span>
              <span className="font-semibold">Разработка</span>
            </div>
            <a 
              href="https://www.sintez.info/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[15px] text-iosBlue hover:underline font-medium inline-flex items-center gap-1 w-max"
            >
              Создано в Синтез
              <span className="text-[12px]">↗</span>
            </a>
          </div>

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
    <div className="grid grid-cols-3 rounded-2xl bg-[#EEF1F5] p-1 dark:bg-[#14161d]">
      {options.map(([optionValue, label]) => {
        const isActive = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            className={`rounded-xl px-3 py-2 text-[14px] font-semibold transition-all ${
              isActive 
                ? 'bg-white text-iosBlue shadow-sm dark:bg-[#2a2f3d] dark:text-white' 
                : 'text-[#526273] dark:text-white/45 hover:dark:text-white/70'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}