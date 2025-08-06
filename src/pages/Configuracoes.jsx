import { useState, useEffect, useRef } from 'react'
import { User, Mail, Lock, Bell, Palette, Database, LogOut, Upload, Check, X, AlertCircle, Download, Smartphone } from 'lucide-react'
import { auth, userSettings, storage, dataExport, receitas, despesas, supabase } from '../supabase/client'
import { useUser } from '../contexts/UserContext'
import Avatar from '../components/Avatar'

const Configuracoes = () => {
  const {
    user,
    profile,
    theme,
    currency,
    loading: userLoading,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    toggleTheme,
    changeCurrency,
    formatCurrency
  } = useUser()

  const [activeTab, setActiveTab] = useState('perfil')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const fileInputRef = useRef(null)

  // Estados dos formulários
  const [formData, setFormData] = useState({
    email: '',
    display_name: '',
    novaSenha: '',
    confirmarSenha: ''
  })

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true
  })

  // Estados para PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallButton, setShowInstallButton] = useState(false)

  // Validações de senha (reutilizando do Login)
  const passwordValidations = {
    minLength: formData.novaSenha.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.novaSenha),
    hasLowercase: /[a-z]/.test(formData.novaSenha),
    hasNumber: /\d/.test(formData.novaSenha),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.novaSenha)
  }

  const isPasswordValid = Object.values(passwordValidations).every(Boolean)
  const passwordsMatch = formData.novaSenha === formData.confirmarSenha && formData.confirmarSenha !== ''

  useEffect(() => {
    if (user && profile) {
      setFormData({
        email: user.email || '',
        display_name: profile.display_name || '',
        novaSenha: '',
        confirmarSenha: ''
      })
    }
  }, [user, profile])

  // Carregar configurações de notificação
  useEffect(() => {
    const loadNotificationSettings = async () => {
      if (user?.id) {
        try {
          const { data, error } = await userSettings.getSettings(user.id)
          if (error) throw error

          if (data) {
            setNotificationSettings({
              email_notifications: data.email_notifications ?? true,
              push_notifications: data.push_notifications ?? true
            })
          }
        } catch (error) {
          console.error('Erro ao carregar configurações de notificação:', error)
        }
      }
    }

    loadNotificationSettings()
  }, [user?.id])

  // Detectar evento de instalação PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setShowInstallButton(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  // Salvar perfil do usuário
  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      // Atualizar email no auth se mudou
      if (formData.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: formData.email
        })
        if (authError) throw authError
      }

      // Atualizar perfil
      const { error } = await updateProfile({
        display_name: formData.display_name
      })

      if (error) throw error

      showMessage('success', 'Perfil atualizado com sucesso!')

    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      showMessage('error', `Erro ao salvar perfil: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Upload de avatar
  const handleAvatarUpload = async (file) => {
    setSaving(true)
    try {
      const { error } = await uploadAvatar(file)
      if (error) throw error

      showMessage('success', 'Avatar atualizado com sucesso!')

    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      showMessage('error', `Erro ao fazer upload: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Remover avatar
  const handleRemoveAvatar = async () => {
    setSaving(true)
    try {
      const { error } = await removeAvatar()
      if (error) throw error

      showMessage('success', 'Avatar removido com sucesso!')

    } catch (error) {
      console.error('Erro ao remover avatar:', error)
      showMessage('error', `Erro ao remover avatar: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Alterar senha
  const handleChangePassword = async () => {
    if (!isPasswordValid || !passwordsMatch) {
      showMessage('error', 'Verifique os requisitos da senha')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.novaSenha
      })

      if (error) throw error

      showMessage('success', 'Senha alterada com sucesso!')
      setFormData(prev => ({
        ...prev,
        senha: '',
        novaSenha: '',
        confirmarSenha: ''
      }))

    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      showMessage('error', `Erro ao alterar senha: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Alterar tema
  const handleThemeChange = async (newTheme) => {
    setSaving(true)
    try {
      const { error } = await updateProfile({ theme: newTheme })
      if (error) throw error

      showMessage('success', 'Tema atualizado com sucesso!')

    } catch (error) {
      console.error('Erro ao alterar tema:', error)
      showMessage('error', `Erro ao alterar tema: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Alterar moeda
  const handleCurrencyChange = async (newCurrency) => {
    setSaving(true)
    try {
      const { error } = await changeCurrency(newCurrency)
      if (error) throw error

      showMessage('success', 'Moeda atualizada com sucesso!')

    } catch (error) {
      console.error('Erro ao alterar moeda:', error)
      showMessage('error', `Erro ao alterar moeda: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Exportar dados
  const handleExportData = async () => {
    setSaving(true)
    try {
      const { data, error } = await dataExport.exportUserData(user.id)
      if (error) throw error

      // Criar arquivo JSON e fazer download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `finantrack-dados-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showMessage('success', 'Dados exportados com sucesso!')

    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      showMessage('error', `Erro ao exportar dados: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Excluir conta
  const handleDeleteAccount = async () => {
    const confirmText = 'EXCLUIR MINHA CONTA'
    const userInput = prompt(
      `Esta ação é irreversível! Todos os seus dados serão permanentemente excluídos.\n\nPara confirmar, digite: ${confirmText}`
    )

    if (userInput !== confirmText) {
      showMessage('error', 'Confirmação incorreta. Conta não foi excluída.')
      return
    }

    setSaving(true)
    try {
      // Deletar dados do usuário
      await receitas.getAll(user.id).then(({ data }) => {
        if (data) {
          data.forEach(item => receitas.delete(item.id))
        }
      })

      await despesas.getAll(user.id).then(({ data }) => {
        if (data) {
          data.forEach(item => despesas.delete(item.id))
        }
      })

      await userSettings.delete(user.id)
      await storage.deleteAvatar(user.id)

      // Deletar conta do auth
      // Fazer logout (a exclusão da conta será feita pelo Supabase automaticamente)
      await auth.signOut()
      if (error) throw error

      showMessage('success', 'Conta excluída com sucesso!')

    } catch (error) {
      console.error('Erro ao excluir conta:', error)
      showMessage('error', `Erro ao excluir conta: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Salvar preferências de notificação
  const handleSavePreferences = async () => {
    setSaving(true)
    try {
      const { error } = await userSettings.updateSettings(user.id, {
        email_notifications: notificationSettings.email_notifications,
        push_notifications: notificationSettings.push_notifications
      })

      if (error) throw error

      showMessage('success', 'Preferências de notificação salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
      showMessage('error', 'Erro ao salvar preferências: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // Função para instalar o PWA
  const handleInstallApp = async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('PWA instalado com sucesso')
        showMessage('success', 'App instalado com sucesso!')
      } else {
        console.log('Instalação do PWA cancelada')
      }

      setDeferredPrompt(null)
      setShowInstallButton(false)
    } catch (error) {
      console.error('Erro ao instalar PWA:', error)
      showMessage('error', 'Erro ao instalar o app: ' + error.message)
    }
  }

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      await auth.signOut()
    }
  }

  const tabs = [
    { id: 'perfil', name: 'Perfil', icon: User },
    { id: 'seguranca', name: 'Segurança', icon: Lock },
    { id: 'notificacoes', name: 'Notificações', icon: Bell },
    { id: 'aparencia', name: 'Aparência', icon: Palette },
    { id: 'app', name: 'App', icon: Smartphone },
    { id: 'dados', name: 'Dados', icon: Database },
  ]

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie suas preferências e conta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu lateral */}
        <div className="lg:col-span-1">
          <div className="card">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${
                      activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="lg:col-span-3">
          <div className="card">
            {/* Perfil */}
            {activeTab === 'perfil' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Informações do Perfil</h3>

                <div className="flex items-center space-x-6">
                  <Avatar
                    src={profile?.avatar_url}
                    alt={profile?.display_name || user?.email}
                    size="xl"
                    editable={true}
                    onUpload={handleAvatarUpload}
                    onRemove={profile?.avatar_url ? handleRemoveAvatar : null}
                  />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Foto do Perfil</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Clique na foto para alterar ou arraste uma imagem.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Formatos suportados: JPG, PNG, GIF. Máximo 5MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome de Exibição</label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                      className="input-field mt-1"
                      placeholder="Seu nome completo"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="input-field mt-1"
                      placeholder="seu@email.com"
                      disabled={saving}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Alterar o email pode exigir reconfirmação
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Salvar Alterações</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Segurança */}
            {activeTab === 'seguranca' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Segurança da Conta</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                    <input
                      type="password"
                      value={formData.novaSenha}
                      onChange={(e) => setFormData({...formData, novaSenha: e.target.value})}
                      className={`input-field mt-1 ${
                        formData.novaSenha && !isPasswordValid
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : formData.novaSenha && isPasswordValid
                            ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                            : ''
                      }`}
                      placeholder="••••••••"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      value={formData.confirmarSenha}
                      onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
                      className={`input-field mt-1 ${
                        formData.confirmarSenha && !passwordsMatch
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : formData.confirmarSenha && passwordsMatch
                            ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                            : ''
                      }`}
                      placeholder="••••••••"
                      disabled={saving}
                    />
                    {formData.confirmarSenha && !passwordsMatch && (
                      <p className="mt-1 text-sm text-red-600">As senhas não coincidem</p>
                    )}
                  </div>
                </div>

                {/* Indicadores de requisitos de senha */}
                {formData.novaSenha && (
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Requisitos da senha:</h4>
                    <div className="space-y-2">
                      {Object.entries({
                        minLength: 'Pelo menos 8 caracteres',
                        hasUppercase: 'Uma letra maiúscula (A-Z)',
                        hasLowercase: 'Uma letra minúscula (a-z)',
                        hasNumber: 'Um número (0-9)',
                        hasSpecial: 'Um caractere especial (!@#$%^&*)'
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center space-x-2">
                          {passwordValidations[key] ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm ${passwordValidations[key] ? 'text-green-700' : 'text-red-600'}`}>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleChangePassword}
                    disabled={saving || !isPasswordValid || !passwordsMatch || !formData.novaSenha}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Alterando...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <span>Alterar Senha</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Notificações */}
            {activeTab === 'notificacoes' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Preferências de Notificação</h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Notificações por Email</h4>
                      <p className="text-sm text-gray-500">Receba resumos mensais e alertas por email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.email_notifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, email_notifications: e.target.checked})}
                        className="sr-only peer"
                        disabled={saving}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 disabled:opacity-50"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Notificações Push</h4>
                      <p className="text-sm text-gray-500">Receba notificações no navegador</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.push_notifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, push_notifications: e.target.checked})}
                        className="sr-only peer"
                        disabled={saving}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 disabled:opacity-50"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSavePreferences}
                    disabled={saving}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Bell className="h-4 w-4" />
                        <span>Salvar Preferências</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Aparência */}
            {activeTab === 'aparencia' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aparência</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tema</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'light', label: 'Claro', icon: '☀️' },
                        { value: 'dark', label: 'Escuro', icon: '🌙' }
                      ].map((tema) => (
                        <button
                          key={tema.value}
                          onClick={() => handleThemeChange(tema.value)}
                          disabled={saving}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            theme === tema.value
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                          } disabled:opacity-50`}
                        >
                          <div className="text-2xl mb-2">{tema.icon}</div>
                          <div className="text-sm font-medium">{tema.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Moeda Padrão</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'BRL', label: 'Real', symbol: 'R$', flag: '🇧🇷' },
                        { value: 'USD', label: 'Dólar', symbol: '$', flag: '🇺🇸' },
                        { value: 'EUR', label: 'Euro', symbol: '€', flag: '🇪🇺' }
                      ].map((moeda) => (
                        <button
                          key={moeda.value}
                          onClick={() => handleCurrencyChange(moeda.value)}
                          disabled={saving}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            currency === moeda.value
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                          } disabled:opacity-50`}
                        >
                          <div className="text-2xl mb-2">{moeda.flag}</div>
                          <div className="text-sm font-medium">{moeda.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{moeda.symbol}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Exemplo de Formatação</h4>
                    <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      {formatCurrency(1234.56)}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      Assim os valores serão exibidos na aplicação
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* App */}
            {activeTab === 'app' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aplicativo</h3>

                <div className="space-y-6">
                  {/* Instalação PWA */}
                  {showInstallButton ? (
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white shadow-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-white/20 rounded-full p-3 flex-shrink-0">
                            <Smartphone className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold">Instalar FinanTrack</h4>
                            <p className="text-primary-100 text-sm">
                              Instale o app no seu dispositivo para acesso rápido e offline
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleInstallApp}
                          disabled={saving}
                          className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors duration-200 flex items-center space-x-2 flex-shrink-0 disabled:opacity-50"
                        >
                          <Download className="h-4 w-4" />
                          <span>Instalar App</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2">
                          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                            App já instalado
                          </h4>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            O FinanTrack já está instalado no seu dispositivo ou não é suportado pelo navegador.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Informações do App */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Sobre o Aplicativo
                    </h4>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <span>Acesso offline às suas finanças</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <span>Notificações push para lembretes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <span>Interface otimizada para dispositivos móveis</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <span>Sincronização automática quando online</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dados */}
            {activeTab === 'dados' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Gerenciar Dados</h3>

                <div className="space-y-6">
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Download className="h-6 w-6 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-blue-800">Exportar Dados</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Baixe uma cópia completa de todos os seus dados financeiros em formato JSON.
                          Inclui receitas, despesas, configurações e informações do perfil.
                        </p>
                        <button
                          onClick={handleExportData}
                          disabled={saving}
                          className="btn-secondary mt-3 flex items-center space-x-2 disabled:opacity-50"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span>Exportando...</span>
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                              <span>Exportar Dados</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-red-800">Excluir Conta</h4>
                        <p className="text-sm text-red-700 mt-1">
                          Esta ação é <strong>irreversível</strong>. Todos os seus dados serão permanentemente excluídos:
                        </p>
                        <ul className="text-sm text-red-700 mt-2 list-disc list-inside space-y-1">
                          <li>Todas as receitas e despesas</li>
                          <li>Configurações e preferências</li>
                          <li>Foto de perfil</li>
                          <li>Conta de usuário</li>
                        </ul>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={saving}
                          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 mt-3 flex items-center space-x-2 disabled:opacity-50"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Excluindo...</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4" />
                              <span>Excluir Conta</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mensagens de feedback */}
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border max-w-sm ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Botão de logout */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Sair da Conta</h3>
            <p className="text-sm text-gray-500">Desconectar-se do FinanTrack</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={saving}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Configuracoes
