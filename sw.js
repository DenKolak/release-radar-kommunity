/* ===================== Release Radar — Service Worker =====================
   Ziel: die App als installierbare PWA nutzbar machen und den zuletzt geladenen
   Stand offline verfügbar halten. Bewusst einfach gehalten:
   - Nur eigene (same-origin) Dateien werden zwischengespeichert (App-Shell:
     HTML, Manifest, Icons). Externe Aufrufe (Supabase, Google Fonts, jsDelivr)
     laufen immer unverändert über das Netzwerk — Sync, Auth und Schriftarten
     sollen nie einen veralteten Zwischenstand liefern.
   - Bei jedem Seitenaufruf wird zuerst versucht, die aktuelle Version aus dem
     Netz zu laden (Nutzer:innen sehen online immer den neuesten Stand); nur
     wenn das fehlschlägt (offline), wird auf den zwischengespeicherten Stand
     zurückgegriffen.
   - CACHE_NAME hochzählen, wenn sich die App-Shell-Dateien ändern — das
     verwirft beim nächsten Start automatisch den alten Cache.
============================================================================= */

const CACHE_NAME = "release-radar-shell-v1";
const APP_SHELL = [
  "./",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(() => { /* z. B. wenn eine der Dateien (noch) nicht existiert — Installation trotzdem nicht abbrechen */ })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if(req.method !== "GET") return; // z. B. Supabase-Schreibzugriffe niemals abfangen

  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return; // fremde Domains unverändert durchreichen

  // Seitenaufruf (Navigation): zuerst Netzwerk, offline auf den Cache zurückfallen.
  if(req.mode === "navigate"){
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match("./")))
    );
    return;
  }

  // Eigene statische Dateien (Icons, Manifest): aus dem Cache, im Hintergrund aktualisieren.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
