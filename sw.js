// OTIS - service worker minimo (so para a app ser instalavel no telemovel)
self.addEventListener("install", function(){ self.skipWaiting(); });
self.addEventListener("activate", function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function(e){ e.respondWith(fetch(e.request).catch(function(){ return new Response("", {status:504}); })); });
