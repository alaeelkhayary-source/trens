// Service worker mínim: permet instal·lar l'app i obrir-la sense connexió.
// Sempre prova la xarxa primer, així sempre tens la versió i les dades més noves.
const CACHE = 'trens-v6';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return; // dades d'FGC i mapes: directe a la xarxa
  // llibreries amb la versió al camí (vendor/…): no canvien mai, primer la memòria
  if (new URL(req.url).pathname.includes('/vendor/')) { e.respondWith(caches.match(req).then(r => r || fetch(req).then(n => { const cp = n.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return n; }))); return; }
  // cache:'no-cache' → salta la memòria del navegador (GitHub Pages la guarda 10 min) i sempre comprova si hi ha versió nova
  const net = req.mode === 'navigate' ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(req, { cache: 'no-cache' });
  e.respondWith(net.then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r; })
    .catch(() => caches.match(req).then(r => r || caches.match('./'))));
});
// En tocar una notificació d'avís, obre (o porta al davant) la web.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const c = cs.find(x => 'focus' in x); return c ? c.focus() : self.clients.openWindow('./');
  }));
});
// Avisos que envia el servidor (funcionen encara que la web estigui tancada)
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: 'Trens en viu', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Trens en viu', {
    body: d.body || '', tag: d.tag || undefined, renotify: !!d.tag, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: { url: './' }
  }));
});
