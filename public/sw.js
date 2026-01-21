self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
  // オフライン対応を高度にする場合はここにキャッシュロジックを書きます
  e.respondWith(fetch(e.request));
});