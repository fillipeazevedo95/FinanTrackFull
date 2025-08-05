import { useState, useEffect } from 'react'

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isIOSStandalone = window.navigator.standalone === true
      setIsInstalled(isStandalone || isIOSStandalone)
    }

    // Listener para evento de instalação
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      console.log('PWA foi instalado')
    }

    // Listeners para status online/offline
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Listener para atualizações do service worker
    const handleSWUpdate = () => {
      setUpdateAvailable(true)
    }

    // Registrar listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Verificar service worker para atualizações
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleSWUpdate)
    }

    // Verificar estado inicial
    checkIfInstalled()

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleSWUpdate)
      }
    }
  }, [])

  // Função para instalar o PWA
  const installPWA = async () => {
    if (!deferredPrompt) return false

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      }
      return false
    } catch (error) {
      console.error('Erro ao instalar PWA:', error)
      return false
    }
  }

  // Função para atualizar o service worker
  const updateServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          setUpdateAvailable(false)
          window.location.reload()
        }
      } catch (error) {
        console.error('Erro ao atualizar service worker:', error)
      }
    }
  }

  // Função para solicitar permissão de notificação
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
      } catch (error) {
        console.error('Erro ao solicitar permissão de notificação:', error)
        return false
      }
    }
    return false
  }

  // Função para enviar notificação local
  const sendNotification = (title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options
      })

      // Auto-fechar após 5 segundos
      setTimeout(() => notification.close(), 5000)
      
      return notification
    }
    return null
  }

  // Função para registrar sincronização em background
  const registerBackgroundSync = async (tag) => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register(tag)
        return true
      } catch (error) {
        console.error('Erro ao registrar background sync:', error)
        return false
      }
    }
    return false
  }

  // Função para compartilhar (Web Share API)
  const shareContent = async (data) => {
    if (navigator.share) {
      try {
        await navigator.share(data)
        return true
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Erro ao compartilhar:', error)
        }
        return false
      }
    }
    return false
  }

  // Função para detectar tipo de dispositivo
  const getDeviceType = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)
    const isTablet = /ipad|android(?!.*mobile)/.test(userAgent)
    
    if (isTablet) return 'tablet'
    if (isMobile) return 'mobile'
    return 'desktop'
  }

  // Função para verificar capacidades do dispositivo
  const getCapabilities = () => {
    return {
      hasServiceWorker: 'serviceWorker' in navigator,
      hasNotifications: 'Notification' in window,
      hasBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      hasWebShare: 'share' in navigator,
      hasPushManager: 'serviceWorker' in navigator && 'PushManager' in window,
      hasIndexedDB: 'indexedDB' in window,
      hasLocalStorage: 'localStorage' in window,
      hasGeolocation: 'geolocation' in navigator,
      hasCamera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      deviceType: getDeviceType()
    }
  }

  return {
    // Estados
    isInstallable,
    isInstalled,
    isOnline,
    updateAvailable,
    
    // Funções
    installPWA,
    updateServiceWorker,
    requestNotificationPermission,
    sendNotification,
    registerBackgroundSync,
    shareContent,
    getCapabilities,
    
    // Informações do dispositivo
    deviceType: getDeviceType(),
    capabilities: getCapabilities()
  }
}
