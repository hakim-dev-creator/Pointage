// Salary System - Service Worker with Offline Support
const CACHE_NAME = 'salary-v3';

// الملفات التي نحفظها للعمل بدون إنترنت
const ASSETS_TO_CACHE = [
  '/Pointage/',
  '/Pointage/index.html',
  '/Pointage/manifest.json'
];

// تثبيت: حفظ الملفات الأساسية فقط
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// تفعيل: حذف الكاش القديم
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // ❌ Firebase وGoogle APIs: لا تتدخل أبداً - اتركها تمر بحرية
  if (url.includes('firebase') ||
      url.includes('firestore') ||
      url.includes('googleapis') ||
      url.includes('gstatic') ||
      url.includes('identitytoolkit') ||
      url.includes('securetoken') ||
      url.includes('accounts.google')) {
    return; // لا respondWith - يمر مباشرة
  }

  // ✅ ملفات التطبيق: الشبكة أولاً، الكاش عند انقطاع الإنترنت
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // حفظ نسخة في الكاش
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => {
        // انقطع الإنترنت - أرجع من الكاش
        return caches.match(e.request) || caches.match('/Pointage/index.html');
      })
  );
});
