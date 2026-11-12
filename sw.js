/* Garde la page en mémoire pour qu'elle s'ouvre même sans réseau ; les codes tournants viennent toujours du réseau. */
var NOM = "iris-pointage-v1";
var FICHIERS = ["./", "index.html", "qrcode.min.js", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", function (e) { e.waitUntil(caches.open(NOM).then(function (c) { return c.addAll(FICHIERS); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (n) { return n !== NOM; }).map(function (n) { return caches.delete(n); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(function (r) { var c = r.clone(); caches.open(NOM).then(function (ca) { ca.put(e.request, c); }); return r; }).catch(function () { return caches.match(e.request); }));
});
