import { useState, useEffect, useRef } from 'react'
import { User, Mail, Lock, Bell, Palette, Database, LogOut, Upload, Check, X, AlertCircle, Download } from 'lucide-react'
import { auth, userSettings, storage, dataExport, receitas, despesas, supabase } from '../supabase/client'

const Configuracoes = () => {
  const [user, setUser] = useState(null)
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('perfil')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const fileInputRef = useRef(null)

  // Estados dos formulários
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    senha: '',
    novaSenha: '',
    confirmarSenha: ''
  })

  const [configuracoes, setConfiguracoes] = useState({
    notificacoes_email: true,
    notificacoes_push: true,
    tema: 'claro',
    moeda: 'BRL'
  })

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
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data } = await auth.getCurrentUser()
      setUser(data.user)

      if (data.user) {
        // Carregar dados básicos do usuário
        setFormData(prev => ({
          ...prev,
          email: data.user.email || '',
          nome: data.user.user_metadata?.nome || ''
        }))

        // Carregar configurações do banco
        const { data: settingsData, error } = await userSettings.get(data.user.id)

        if (error && error.code !== 'PGRST116') { // PGRST116 = não encontrado
          console.error('Erro ao carregar configurações:', error)
        } else if (settingsData) {
          setSettings(settingsData)
          setConfiguracoes({
            notificacoes_email: settingsData.notificacoes_email ?? true,
            notificacoes_push: settingsData.notificacoes_push ?? true,
            tema: settingsData.tema || 'claro',
            moeda: settingsData.moeda || 'BRL'
          })

          // Atualizar nome se existir nas configurações
          if (settingsData.nome) {
            setFormData(prev => ({
              ...prev,
              nome: settingsData.nome
            }))
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
      showMessage('error', 'Erro ao carregar dados do usuário')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  // Salvar perfil do usuário
  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      // Atualizar dados do auth (email e metadata)
      const updates = {
        email: formData.email,
        data: {
          nome: formData.nome
        }
      }

      const { error: authError } = await supabase.auth.updateUser(updates)
      if (authError) throw authError

      // Salvar nome nas configurações também
      const settingsData = {
        user_id: user.id,
        nome: formData.nome,
        tema: configuracoes.tema,
        moeda: configuracoes.moeda,
        notificacoes_email: configuracoes.notificacoes_email,
        notificacoes_push: configuracoes.notificacoes_push
      }

      const { error: settingsError } = await userSettings.upsert(settingsData)
      if (settingsError) throw settingsError

      showMessage('success', 'Perfil atualizado com sucesso!')

      // Recarregar dados do usuário
      const { data } = await auth.getCurrentUser()
      setUser(data.user)

    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      showMessage('error', `Erro ao salvar perfil: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Upload de avatar (temporariamente desabilitado)
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Por favor, selecione apenas arquivos de imagem')
      return
    }

    // Validar tamanho (máximo 1MB)
    if (file.size > 1024 * 1024) {
      showMessage('error', 'A imagem deve ter no máximo 1MB')
      return
    }

    setSaving(true)
    try {
      // Por enquanto, vamos apenas simular o upload
      // Quando o storage estiver configurado, descomente o código abaixo

      /*
      const { data, error } = await storage.uploadAvatar(user.id, file)
      if (error) throw error

      // Atualizar URL do avatar nas configurações
      const settingsData = {
        user_id: user.id,
        nome: formData.nome,
        avatar_url: data.publicUrl,
        tema: configuracoes.tema,
        moeda: configuracoes.moeda,
        notificacoes_email: configuracoes.notificacoes_email,
        notificacoes_push: configuracoes.notificacoes_push
      }

      const { error: settingsError } = await userSettings.upsert(settingsData)
      if (settingsError) throw settingsError

      setSettings(prev => ({ ...prev, avatar_url: data.publicUrl }))
      */

      showMessage('success', 'Upload de avatar será implementado após configurar o storage!')

    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      showMessage('error', `Erro ao fazer upload: ${error.message}`)
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

  // Salvar preferências
  const handleSavePreferences = async () => {
    setSaving(true)
    try {
      const settingsData = {
        user_id: user.id,
        nome: formData.nome,
        avatar_url: settings?.avatar_url,
        tema: configuracoes.tema,
        moeda: configuracoes.moeda,
        notificacoes_email: configuracoes.notificacoes_email,
        notificacoes_push: configuracoes.notificacoes_push
      }

      const { error } = await userSettings.upsert(settingsData)
      if (error) throw error

      showMessage('success', 'Preferências salvas com sucesso!')

    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
      showMessage('error', `Erro ao salvar preferências: ${error.message}`)
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
    { id: 'dados', name: 'Dados', icon: Database },
  ]

  if (loading) {
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
                  <div className="relative">
                    {settings?.avatar_url ? (
                      <img
                        src={settings.avatar_url}
                        alt="Avatar"
                        className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-600">
                        <User className="h-10 w-10 text-white" />
                      </div>
                    )}
                    {saving && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={saving}
                      className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Alterar Foto</span>
                    </button>
                    <p className="text-sm text-gray-500 mt-1">JPG, PNG ou GIF. Máximo 1MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="input-field mt-1"
                      placeholder="Seu nome completo"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="input-field mt-1"
                      placeholder="seu@email.com"
                      disabled={saving}
                    />
                    <p className="text-xs text-gray-500 mt-1">
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
                        checked={configuracoes.notificacoes_email}
                        onChange={(e) => setConfiguracoes({...configuracoes, notificacoes_email: e.target.checked})}
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
                        checked={configuracoes.notificacoes_push}
                        onChange={(e) => setConfiguracoes({...configuracoes, notificacoes_push: e.target.checked})}
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
                <h3 className="text-lg font-medium text-gray-900">Aparência</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Tema</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'claro', label: 'Claro', icon: '☀️' },
                        { value: 'escuro', label: 'Escuro', icon: '🌙' },
                        { value: 'auto', label: 'Automático', icon: '🔄' }
                      ].map((tema) => (
                        <button
                          key={tema.value}
                          onClick={() => setConfiguracoes({...configuracoes, tema: tema.value})}
                          disabled={saving}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            configuracoes.tema === tema.value
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          } disabled:opacity-50`}
                        >
                          <div className="text-2xl mb-2">{tema.icon}</div>
                          <div className="text-sm font-medium">{tema.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Moeda Padrão</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'BRL', label: 'Real', symbol: 'R$', flag: '🇧🇷' },
                        { value: 'USD', label: 'Dólar', symbol: '$', flag: '🇺🇸' },
                        { value: 'EUR', label: 'Euro', symbol: '€', flag: '🇪🇺' }
                      ].map((moeda) => (
                        <button
                          key={moeda.value}
                          onClick={() => setConfiguracoes({...configuracoes, moeda: moeda.value})}
                          disabled={saving}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            configuracoes.moeda === moeda.value
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          } disabled:opacity-50`}
                        >
                          <div className="text-2xl mb-2">{moeda.flag}</div>
                          <div className="text-sm font-medium">{moeda.label}</div>
                          <div className="text-xs text-gray-500">{moeda.symbol}</div>
                        </button>
                      ))}
                    </div>
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
                        <Palette className="h-4 w-4" />
                        <span>Salvar Preferências</span>
                      </>
                    )}
                  </button>
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
