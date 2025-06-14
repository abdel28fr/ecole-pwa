const CACHE_NAME = 'najm-plus-academy-v1.0.1';
const urlsToCache = [
  '/',
  '/manifest.json'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache).catch((error) => {
          console.error('Service Worker: Failed to cache files', error);
          // استمر حتى لو فشل في تخزين بعض الملفات
          return Promise.resolve();
        });
      })
      .then(() => {
        console.log('Service Worker: Installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated successfully');
      return self.clients.claim();
    })
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', (event) => {
  // تجاهل الطلبات غير HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إرجاع الملف من الكاش إذا وُجد
        if (response) {
          return response;
        }

        // إذا لم يوجد في الكاش، جلبه من الشبكة
        return fetch(event.request).then((response) => {
          // التحقق من صحة الاستجابة
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // نسخ الاستجابة لحفظها في الكاش
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // في حالة عدم توفر الإنترنت، إرجاع صفحة أوفلاين
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// معالجة رسائل من التطبيق الرئيسي
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// إشعارات Push (للمستقبل)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'إشعار جديد من أكاديمية نجم بلوس',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'فتح التطبيق',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'إغلاق',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('أكاديمية نجم بلوس', options)
  );
});

// معالجة النقر على الإشعارات
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    event.notification.close();
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// تحديث الكاش عند توفر إصدار جديد
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(
      // يمكن إضافة منطق مزامنة البيانات هنا
      Promise.resolve()
    );
  }
});

console.log('Service Worker: Loaded successfully');
