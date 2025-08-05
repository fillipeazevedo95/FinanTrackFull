const CACHE_NAME = 'finantrack-v1.0.0'
const STATIC_CACHE = 'finantrack-static-v1.0.0'
const DYNAMIC_CACHE = 'finantrack-dynamic-v1.0.0'

// Arquivos para cache estático (sempre em cache)
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Arquivos para cache dinâmico (cachear conforme uso)
const CACHE_STRATEGIES = {
  // Cache first para assets estáticos
  CACHE_FIRST: 'cache-first',
  // Network first para dados dinâmicos
  NETWORK_FIRST: 'network-first',
  // Stale while revalidate para páginas
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
}

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('[SW] Static files cached')
        return self.skipWaiting()
      })
  )
})

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Deletar caches antigos
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Activated')
        return self.clients.claim()
      })
  )
})

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorar requisições não HTTP
  if (!request.url.startsWith('http')) return

  // Estratégia baseada no tipo de recurso
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request))
  } else if (isAPIRequest(url)) {
    event.respondWith(networkFirst(request))
  } else if (isPageRequest(request)) {
    event.respondWith(staleWhileRevalidate(request))
  }
})

// Verificar se é asset estático
function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2)$/)
}

// Verificar se é requisição de API
function isAPIRequest(url) {
  return url.hostname.includes('supabase.co') || 
         url.pathname.startsWith('/api/')
}

// Verificar se é requisição de página
function isPageRequest(request) {
  return request.method === 'GET' && 
         request.headers.get('accept')?.includes('text/html')
}

// Estratégia: Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('[SW] Cache first failed:', error)
    return new Response('Offline - Recurso não disponível', { 
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}

// Estratégia: Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('[SW] Network first failed, trying cache:', error)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    return new Response(JSON.stringify({ 
      error: 'Offline - Dados não disponíveis',
      offline: true 
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Estratégia: Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => {
    // Se falhar, retorna página offline
    return caches.match('/offline.html') || 
           new Response('Offline', { status: 503 })
  })

  return cachedResponse || fetchPromise
}

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'sync-financial-data') {
    event.waitUntil(syncFinancialData())
  }
})

// Função para sincronizar dados financeiros
async function syncFinancialData() {
  try {
    // Aqui você pode implementar lógica para sincronizar
    // dados offline com o servidor quando a conexão voltar
    console.log('[SW] Syncing financial data...')
    
    // Exemplo: buscar dados pendentes do IndexedDB e enviar para API
    // const pendingData = await getPendingDataFromIndexedDB()
    // await sendPendingDataToAPI(pendingData)
    
    return Promise.resolve()
  } catch (error) {
    console.error('[SW] Sync failed:', error)
    return Promise.reject(error)
  }
}

// Notificações push
self.addEventListener('push', (event) => {
  console.log('[SW] Push received')
  
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir App',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/icon-192x192.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('FinanTrack', options)
  )
})

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received.')

  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})
