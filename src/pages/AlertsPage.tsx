import { Bell, BellRing, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { STATIONS } from '../data/stations';
import { requestNotificationPermission } from '../services/notifications';
import { useWeatherStore } from '../store/weatherStore';

export function AlertsPage() {
  const { alertRules, addAlertRule, updateAlertRule, removeAlertRule } = useWeatherStore();
  const [stationId, setStationId] = useState(STATIONS[0].id);
  const [threshold, setThreshold] = useState(8);
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const stationsById = useMemo(() => Object.fromEntries(STATIONS.map((station) => [station.id, station])), []);

  async function enableNotifications() {
    const result = await requestNotificationPermission();
    setPermission(result);
  }

  return (
    <main className="px-4">
      <section className="rounded-ios border border-black/5 bg-white p-5 shadow-card dark:border-white/8 dark:bg-[#1b1e24]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[28px] font-bold text-[#0D2B48] dark:text-white">Оповещения</h2>
            <p className="mt-2 text-[15px] text-[#526273] dark:text-white/65">
              Правила проверяются после каждого обновления данных.
            </p>
          </div>
          <BellRing size={34} className="text-iosBlue" />
        </div>

        <button
          type="button"
          onClick={enableNotifications}
          className="mt-5 w-full rounded-2xl bg-iosBlue px-4 py-3 text-[16px] font-semibold text-white transition active:scale-[0.99]"
        >
          {permission === 'granted' ? 'Push-уведомления включены' : 'Включить push-уведомления'}
        </button>
      </section>

      <section className="mt-4 rounded-ios border border-black/5 bg-white p-4 shadow-card dark:border-white/8 dark:bg-[#1b1e24]">
        <div className="grid grid-cols-[1fr_88px_46px] gap-2">
          <select
            value={stationId}
            onChange={(event) => setStationId(event.target.value)}
            className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-[#0D2B48] dark:border-white/10 dark:bg-[#101215] dark:text-white"
          >
            {STATIONS.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            max={40}
            step={0.5}
            value={threshold}
            onChange={(event) => setThreshold(Number(event.target.value))}
            className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-center font-semibold text-[#0D2B48] dark:border-white/10 dark:bg-[#101215] dark:text-white"
          />
          <button
            type="button"
            onClick={() => addAlertRule(stationId, threshold)}
            className="grid place-items-center rounded-2xl bg-iosBlue text-white"
            aria-label="Добавить правило"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {alertRules.map((rule) => (
            <article key={rule.id} className="flex items-center gap-3 rounded-2xl bg-[#F7F8FA] p-3 dark:bg-white/5">
              <button
                type="button"
                onClick={() => updateAlertRule({ ...rule, enabled: !rule.enabled })}
                className={`grid h-10 w-10 place-items-center rounded-full ${
                  rule.enabled ? 'bg-iosBlue text-white' : 'bg-white text-[#526273] dark:bg-[#101215]'
                }`}
                aria-label="Переключить правило"
              >
                <Bell size={20} />
              </button>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[#0D2B48] dark:text-white">
                  {stationsById[rule.stationId]?.name} &gt; {rule.threshold} м/с
                </div>
                <div className="text-[13px] text-[#526273] dark:text-white/60">
                  {rule.enabled ? 'Активно' : 'Выключено'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeAlertRule(rule.id)}
                className="grid h-10 w-10 place-items-center rounded-full text-[#526273] dark:text-white/65"
                aria-label="Удалить"
              >
                <Trash2 size={19} />
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
