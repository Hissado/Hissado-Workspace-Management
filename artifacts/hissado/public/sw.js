const CACHE = 'hissado-v1';
const SHELL = ['/', '/index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Skip non-GET and API requests — always go network
  if (e.request.method !== 'GET' || url.pathname.startsWith('/api/')) return;

  // For navigation requests (HTML pages), use network-first with cache fallback
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match('/') || caches.match('/index.html'))
    );
    return;
  }

  // For assets, use stale-while-revalidate
  e.respondWith(
    caches.open(CACHE).then((c) =>
      c.match(e.request).then((cached) => {
        const fresh = fetch(e.request).then((res) => {
          if (res.ok) c.put(e.request, res.clone());
          return res;
        });
        return cached || fresh;
      })
    )
  );
});

// Push notification support
self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || 'Hissado Client';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    data: data.url || '/',
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const url = e.notification.data || '/';
      for (const client of clients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
