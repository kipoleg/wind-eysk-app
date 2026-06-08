/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 4
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://wind.sintez.info',
  new NetworkFirst({
    cacheName: 'wind-api',
    networkTimeoutSeconds: 8
  })
);

registerRoute(
  ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'assets'
  })
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images'
  })
);

self.addEventListener('push', (event) => {
  const fallback = {
    title: 'Ветер — Ейский район',
    body: 'Порог ветра достигнут.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png'
  };
  const data = event.data?.json?.() ?? fallback;
  event.waitUntil(
    self.registration.showNotification(data.title ?? fallback.title, {
      body: data.body ?? fallback.body,
      icon: data.icon ?? fallback.icon,
      badge: data.badge ?? fallback.badge,
      data: data.data ?? { url: '/' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const client = clients.find((item) => 'focus' in item);
      if (client) return client.focus();
      return self.clients.openWindow(url);
    })
  );
});

// ИСПРАВЛЕНО: Обработчик для автоматического сброса кэша и активации новой версии приложения
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});