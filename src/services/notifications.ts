import type { AlertRule, StationWeather } from '../types/weather';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return Notification.requestPermission();
}

export async function notifyWindAlert(stationName: string, wind: number, threshold: number): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const title = `${stationName}: ветер выше ${threshold} м/с`;
  const options: NotificationOptions = {
    body: `Текущий ветер ${wind.toFixed(1)} м/с. Откройте приложение, чтобы посмотреть график и прогноз.`,
    badge: '/icons/icon-192.png',
    icon: '/icons/icon-192.png',
    tag: `wind-alert-${stationName}-${threshold}`,
    data: { url: '/' }
  };

  const registration = await navigator.serviceWorker?.ready.catch(() => null);
  if (registration?.showNotification) {
    await registration.showNotification(title, options);
    return;
  }

  new Notification(title, options);
}

export async function evaluateAlertRules(
  rules: AlertRule[],
  stations: Record<string, StationWeather>,
  updateRule: (rule: AlertRule) => void
): Promise<void> {
  if (Notification.permission !== 'granted') return;

  const now = Date.now();
  for (const rule of rules) {
    if (!rule.enabled) continue;
    const stationWeather = stations[rule.stationId];
    const wind = stationWeather?.current?.avgWind;
    if (wind === null || wind === undefined || wind <= rule.threshold) continue;

    const last = rule.lastTriggeredAt ? new Date(rule.lastTriggeredAt).getTime() : 0;
    if (now - last < 30 * 60 * 1000) continue;

    await notifyWindAlert(stationWeather.station.name, wind, rule.threshold);
    updateRule({ ...rule, lastTriggeredAt: new Date(now).toISOString() });
  }
}
