import { useState, useEffect } from 'react'
import { Menu, Bell, User } from 'lucide-react'
import { auth } from '../supabase/client'

const Header = ({ onMenuClick }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await auth.getCurrentUser()
      setUser(data.user)
    }
    
    getUser()
  }, [])

  const handleLogout = async () => {
    await auth.signOut()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Botão do menu mobile */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Título da página (pode ser dinâmico) */}
            <h1 className="ml-4 lg:ml-0 text-2xl font-semibold text-gray-900">
              Controle Financeiro
            </h1>
          </div>

          {/* Ações do usuário */}
          <div className="flex items-center space-x-4">
            {/* Notificações */}
            <button className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <Bell className="h-6 w-6" />
            </button>

            {/* Menu do usuário */}
            <div className="relative">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.email || 'Usuário'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Bem-vindo de volta!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
