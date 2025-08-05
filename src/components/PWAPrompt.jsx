import { useState, useEffect } from 'react'
import { Download, Smartphone, X, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { usePWA } from '../hooks/usePWA'

const PWAPrompt = () => {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    updateAvailable,
    installPWA,
    updateServiceWorker,
    deviceType
  } = usePWA()

  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [showOfflineNotice, setShowOfflineNotice] = useState(false)
  const [dismissed, setDismissed] = useState({
    install: false,
    update: false,
    offline: false
  })

  useEffect(() => {
    // Mostrar prompt de instalação após 30 segundos se disponível
    if (isInstallable && !isInstalled && !dismissed.install) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true)
      }, 30000) // 30 segundos

      return () => clearTimeout(timer)
    }
  }, [isInstallable, isInstalled, dismissed.install])

  useEffect(() => {
    // Mostrar prompt de atualização se disponível
    if (updateAvailable && !dismissed.update) {
      setShowUpdatePrompt(true)
    }
  }, [updateAvailable, dismissed.update])

  useEffect(() => {
    // Mostrar aviso offline
    if (!isOnline && !dismissed.offline) {
      setShowOfflineNotice(true)
    } else if (isOnline) {
      setShowOfflineNotice(false)
      setDismissed(prev => ({ ...prev, offline: false }))
    }
  }, [isOnline, dismissed.offline])

  const handleInstall = async () => {
    const success = await installPWA()
    if (success) {
      setShowInstallPrompt(false)
    }
  }

  const handleUpdate = async () => {
    await updateServiceWorker()
    setShowUpdatePrompt(false)
  }

  const dismissPrompt = (type) => {
    setDismissed(prev => ({ ...prev, [type]: true }))
    
    switch (type) {
      case 'install':
        setShowInstallPrompt(false)
        break
      case 'update':
        setShowUpdatePrompt(false)
        break
      case 'offline':
        setShowOfflineNotice(false)
        break
    }
  }

  const getInstallText = () => {
    switch (deviceType) {
      case 'mobile':
        return {
          title: 'Instalar FinanTrack',
          description: 'Adicione o FinanTrack à sua tela inicial para acesso rápido e experiência nativa.',
          buttonText: 'Instalar App'
        }
      case 'tablet':
        return {
          title: 'Instalar FinanTrack',
          description: 'Instale o FinanTrack no seu tablet para uma experiência otimizada.',
          buttonText: 'Instalar App'
        }
      default:
        return {
          title: 'Instalar FinanTrack',
          description: 'Instale o FinanTrack no seu computador para acesso rápido e notificações.',
          buttonText: 'Instalar App'
        }
    }
  }

  const installText = getInstallText()

  return (
    <>
      {/* Prompt de Instalação */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  {deviceType === 'mobile' ? (
                    <Smartphone className="w-5 h-5 text-primary-600" />
                  ) : (
                    <Download className="w-5 h-5 text-primary-600" />
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900">
                  {installText.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {installText.description}
                </p>
                
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={handleInstall}
                    className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors duration-200"
                  >
                    {installText.buttonText}
                  </button>
                  <button
                    onClick={() => dismissPrompt('install')}
                    className="text-gray-400 hover:text-gray-500 text-xs font-medium px-3 py-1.5 rounded-md transition-colors duration-200"
                  >
                    Agora não
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => dismissPrompt('install')}
                className="flex-shrink-0 text-gray-400 hover:text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt de Atualização */}
      {showUpdatePrompt && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
          <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-blue-900">
                  Atualização Disponível
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Uma nova versão do FinanTrack está disponível com melhorias e correções.
                </p>
                
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={handleUpdate}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors duration-200"
                  >
                    Atualizar Agora
                  </button>
                  <button
                    onClick={() => dismissPrompt('update')}
                    className="text-blue-600 hover:text-blue-700 text-xs font-medium px-3 py-1.5 rounded-md transition-colors duration-200"
                  >
                    Depois
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => dismissPrompt('update')}
                className="flex-shrink-0 text-blue-400 hover:text-blue-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aviso Offline */}
      {showOfflineNotice && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <WifiOff className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-yellow-900">
                  Modo Offline
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Você está offline. Algumas funcionalidades podem estar limitadas.
                </p>
                
                <button
                  onClick={() => dismissPrompt('offline')}
                  className="text-yellow-600 hover:text-yellow-700 text-xs font-medium mt-2 transition-colors duration-200"
                >
                  Entendi
                </button>
              </div>
              
              <button
                onClick={() => dismissPrompt('offline')}
                className="flex-shrink-0 text-yellow-400 hover:text-yellow-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de Status Online/Offline (fixo) */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
          isOnline 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default PWAPrompt
