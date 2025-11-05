// FarmCare Pro Service Worker
const CACHE_NAME = 'farmcare-pro-v1.0.0';
const urlsToCache = [
  '/',
  '/static/style.css',
  '/static/scripts.js',
  '/static/manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  console.log('🔧 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('🚀 Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('✅ Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        if (response) {
          console.log('📦 Service Worker: Serving from cache:', event.request.url);
          return response;
        }

        console.log('🌐 Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request).then(function(response) {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Add to cache for future use
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(function(error) {
          console.error('❌ Service Worker: Fetch failed:', error);
          
          // Return offline page for navigation requests
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
          
          throw error;
        });
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', function(event) {
  if (event.tag === 'health-prediction') {
    console.log('🔄 Service Worker: Background sync - health prediction');
    event.waitUntil(syncHealthPredictions());
  }
});

// Push notification handling
self.addEventListener('push', function(event) {
  console.log('📱 Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/static/icons/icon-192x192.png',
    badge: '/static/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/static/icons/action-explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/static/icons/action-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('FarmCare Pro', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', function(event) {
  console.log('📱 Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function for background sync
async function syncHealthPredictions() {
  try {
    // Get pending predictions from IndexedDB
    const pendingPredictions = await getPendingPredictions();
    
    for (const prediction of pendingPredictions) {
      try {
        const response = await fetch('/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(prediction.data)
        });
        
        if (response.ok) {
          // Remove from pending list
          await removePendingPrediction(prediction.id);
          console.log('✅ Service Worker: Synced prediction:', prediction.id);
        }
      } catch (error) {
        console.error('❌ Service Worker: Failed to sync prediction:', error);
      }
    }
  } catch (error) {
    console.error('❌ Service Worker: Background sync failed:', error);
  }
}

// IndexedDB helpers (simplified)
async function getPendingPredictions() {
  // In a real implementation, this would use IndexedDB
  return [];
}

async function removePendingPrediction(id) {
  // In a real implementation, this would remove from IndexedDB
  console.log('Removing pending prediction:', id);
}

// Message handling from main thread
self.addEventListener('message', function(event) {
  console.log('📨 Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Error handling
self.addEventListener('error', function(event) {
  console.error('❌ Service Worker: Error:', event.error);
});

self.addEventListener('unhandledrejection', function(event) {
  console.error('❌ Service Worker: Unhandled rejection:', event.reason);
});

console.log('🚀 FarmCare Pro Service Worker loaded successfully');