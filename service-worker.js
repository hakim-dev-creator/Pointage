// نظام الرواتب - Service Worker
const CACHE_NAME = 'salary-system-v1';
const ASSETS = [
  '/',
  '/index.html'
];

// تثبيت: حفظ الملفات في الكاش
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// تفعيل: حذف الكاش القديم
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// طلبات الشبكة: الشبكة أولاً ثم الكاش
self.addEventListener('fetch', (e) => {
  // Firebase وطلبات الـ API لا تُكاش
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('firestore') ||
      e.request.url.includes('gstatic')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // حفظ نسخة في الكاش
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => {
        // عند انقطاع الإنترنت: الكاش
        return caches.match(e.request);
      })
  );
});
