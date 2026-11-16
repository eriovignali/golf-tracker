// Offline support: always try the network first so updates show up, fall back to the saved copy.
const CACHE = 'sgcaddie-v2';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-180.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
if (e.request.method !== 'GET') return;
const same = new URL(e.request.url).origin === location.origin;
const net = fetch(same ? new Request(e.request.url, { cache: 'no-cache' }) : e.request).then(r => { if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; });
const saved = caches.match(e.request);
const slow = new Promise(res => setTimeout(res, 3000)).then(() => saved);
e.respondWith(Promise.race([net.catch(() => saved), slow.then(r => r || net)]));
});
