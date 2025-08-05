import { useState } from 'react'
import { Download, Smartphone, Monitor, X } from 'lucide-react'
import { usePWA } from '../hooks/usePWA'

const InstallPWA = () => {
  const { isInstallable, isInstalled, installPWA, deviceType } = usePWA()
  const [showModal, setShowModal] = useState(false)

  if (isInstalled || !isInstallable) {
    return null
  }

  const handleInstall = async () => {
    const success = await installPWA()
    if (success) {
      setShowModal(false)
    }
  }

  const getDeviceInfo = () => {
    switch (deviceType) {
      case 'mobile':
        return {
          icon: Smartphone,
          title: 'Instalar no Celular',
          description: 'Adicione o FinanTrack à sua tela inicial para acesso rápido',
          benefits: [
            'Acesso instantâneo da tela inicial',
            'Funciona offline',
            'Notificações push',
            'Experiência nativa'
          ]
        }
      case 'tablet':
        return {
          icon: Smartphone,
          title: 'Instalar no Tablet',
          description: 'Instale o FinanTrack para uma experiência otimizada',
          benefits: [
            'Interface otimizada para tablet',
            'Funciona offline',
            'Sincronização automática',
            'Acesso rápido'
          ]
        }
      default:
        return {
          icon: Monitor,
          title: 'Instalar no Computador',
          description: 'Instale o FinanTrack como um aplicativo nativo',
          benefits: [
            'Aplicativo independente',
            'Notificações desktop',
            'Funciona offline',
            'Inicialização rápida'
          ]
        }
    }
  }

  const deviceInfo = getDeviceInfo()
  const Icon = deviceInfo.icon

  return (
    <>
      {/* Botão flutuante de instalação */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-4 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-40"
        title="Instalar App"
      >
        <Download className="w-6 h-6" />
      </button>

      {/* Modal de instalação */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            {/* Botão fechar */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Conteúdo do modal */}
            <div className="text-center">
              {/* Ícone */}
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-primary-600" />
              </div>

              {/* Título */}
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {deviceInfo.title}
              </h2>

              {/* Descrição */}
              <p className="text-gray-600 mb-6">
                {deviceInfo.description}
              </p>

              {/* Benefícios */}
              <div className="text-left mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Benefícios:</h3>
                <ul className="space-y-2">
                  {deviceInfo.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botões */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Agora Não
                </button>
                <button
                  onClick={handleInstall}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default InstallPWA
