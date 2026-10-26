// Service Worker for Dungeon of Discipline PWA & Real Web Push Notifications

// Lifecycle Events
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

// Handle Real Web Push Notifications from Server (Supabase Edge Function)
self.addEventListener('push', (event) => {
  let data = {};
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    data = {
      title: '⚔️ Dungeon of Discipline',
      body: event.data ? event.data.text() : 'Você tem um lembrete pendente!',
    };
  }

  const title = data.title || '⚔️ Dungeon of Discipline';
  const options = {
    body: data.body || 'Está na hora de cumprir sua missão diária!',
    icon: data.icon || new URL('icon.png', self.registration.scope).href,
    badge: data.badge || new URL('icon.png', self.registration.scope).href,
    tag: data.tag || `dod-${Date.now()}`,
    renotify: true,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || self.registration.scope,
      questId: data.questId || null,
    },
    actions: [
      { action: 'open', title: 'Abrir Jogo' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification Click Handler — Focus existing tab or open new
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || self.registration.scope;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open, focus it
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client && client.url !== targetUrl) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});