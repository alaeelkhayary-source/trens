// Service worker mínim: permet instal·lar l'app i obrir-la sense connexió.
// Sempre prova la xarxa primer, així sempre tens la versió i les dades més noves.
const CACHE = 'trens-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return; // dades d'FGC i mapes: directe a la xarxa
  e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r; })
    .catch(() => caches.match(req).then(r => r || caches.match('./'))));
});
// En tocar una notificació d'avís, obre (o porta al davant) la web.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const c = cs.find(x => 'focus' in x); return c ? c.focus() : self.clients.openWindow('./');
  }));
});
