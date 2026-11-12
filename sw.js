/* Lernhub Service Worker: offline-fähig (Netzwerk zuerst, sonst Cache) + Push-Erinnerungen bei geschlossener App. */
const CACHE = "lernhub-v7";
const SHELL = [
  "./",
  "index.html",
  "css/extra.css",
  "css/neu.css",
  "js/mascot.js",
  "js/extra.js",
  "js/plus.js",
  "js/cloud.js",
  "js/social.js",
  "js/konto.js",
  "js/methoden.js",
  "js/feed.js",
  "js/games.js",
  "js/chat.js",
  "js/invite.js",
  "js/schulen.js",
  "content/schulfaecher.js",
  "content/videos.js",
  "content/erweiterungen.js",
  "content/cloud-config.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
];
const NO_CACHE = /\/(__reload|content\/bridge-token\.js|content\/status\.json)/;

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith("lernhub-") && k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (e) => {
  const req = e.request,
    url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || NO_CACHE.test(url.pathname)) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches
          .match(req, { ignoreSearch: true })
          .then(
            (r) => r || (req.mode === "navigate" ? caches.match("index.html") : Response.error()),
          ),
      ),
  );
});

self.addEventListener("push", (e) => {
  let d = {};
  try {
    d = e.data ? e.data.json() : {};
  } catch (_) {
    d = { body: e.data ? e.data.text() : "" };
  }
  const title = String(d.title || "🐧 Lernhub").slice(0, 80);
  e.waitUntil(
    self.registration.showNotification(title, {
      body: String(d.body || "Zeit für eine kurze Lektion!").slice(0, 200),
      icon: "icons/icon-192.png",
      badge: "icons/icon-192.png",
      tag: "lernhub-remind",
      renotify: true,
      lang: "de",
      data: { url: "./index.html" },
    }),
  );
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = new URL("./index.html", self.registration.scope).href;
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list)
        if (c.url.startsWith(self.registration.scope) && "focus" in c) return c.focus();
      return self.clients.openWindow(target);
    }),
  );
});
