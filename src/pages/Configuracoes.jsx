import { useState, useEffect } from 'react'
import { User, Mail, Lock, Bell, Palette, Database, LogOut } from 'lucide-react'
import { auth } from '../supabase/client'

const Configuracoes = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('perfil')
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    senha: '',
    novaSenha: '',
    confirmarSenha: ''
  })
  const [configuracoes, setConfiguracoes] = useState({
    notificacoes: true,
    tema: 'claro',
    moeda: 'BRL'
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data } = await auth.getCurrentUser()
      setUser(data.user)
      if (data.user) {
        setFormData({
          ...formData,
          email: data.user.email || '',
          nome: data.user.user_metadata?.nome || ''
        })
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
    } finally {
      setLoading(false)
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
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-600">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <button className="btn-secondary">Alterar Foto</button>
                    <p className="text-sm text-gray-500 mt-1">JPG, GIF ou PNG. Máximo 1MB.</p>
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
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="btn-primary">Salvar Alterações</button>
                </div>
              </div>
            )}

            {/* Segurança */}
            {activeTab === 'seguranca' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Segurança da Conta</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Senha Atual</label>
                    <input
                      type="password"
                      value={formData.senha}
                      onChange={(e) => setFormData({...formData, senha: e.target.value})}
                      className="input-field mt-1"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                    <input
                      type="password"
                      value={formData.novaSenha}
                      onChange={(e) => setFormData({...formData, novaSenha: e.target.value})}
                      className="input-field mt-1"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      value={formData.confirmarSenha}
                      onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
                      className="input-field mt-1"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="btn-primary">Alterar Senha</button>
                </div>
              </div>
            )}

            {/* Notificações */}
            {activeTab === 'notificacoes' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Preferências de Notificação</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Notificações por Email</h4>
                      <p className="text-sm text-gray-500">Receba resumos mensais por email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={configuracoes.notificacoes}
                        onChange={(e) => setConfiguracoes({...configuracoes, notificacoes: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Aparência */}
            {activeTab === 'aparencia' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Aparência</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tema</label>
                    <select
                      value={configuracoes.tema}
                      onChange={(e) => setConfiguracoes({...configuracoes, tema: e.target.value})}
                      className="input-field mt-1"
                    >
                      <option value="claro">Claro</option>
                      <option value="escuro">Escuro</option>
                      <option value="auto">Automático</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Moeda</label>
                    <select
                      value={configuracoes.moeda}
                      onChange={(e) => setConfiguracoes({...configuracoes, moeda: e.target.value})}
                      className="input-field mt-1"
                    >
                      <option value="BRL">Real (R$)</option>
                      <option value="USD">Dólar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="btn-primary">Salvar Preferências</button>
                </div>
              </div>
            )}

            {/* Dados */}
            {activeTab === 'dados' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Gerenciar Dados</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-800">Exportar Dados</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Baixe uma cópia de todos os seus dados financeiros
                    </p>
                    <button className="btn-secondary mt-2">Exportar Dados</button>
                  </div>
                  
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800">Excluir Conta</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.
                    </p>
                    <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 mt-2">
                      Excluir Conta
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botão de logout */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Sair da Conta</h3>
            <p className="text-sm text-gray-500">Desconectar-se do FinanTrack</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
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
