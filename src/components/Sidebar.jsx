import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  Menu,
  DollarSign,
  User,
  Bell
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { auth } from '../supabase/client'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Receitas', href: '/receitas', icon: TrendingUp },
    { name: 'Despesas', href: '/despesas', icon: TrendingDown },
    { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ]

  useEffect(() => {
    const getUser = async () => {
      const { data } = await auth.getCurrentUser()
      setUser(data.user)
    }
    getUser()
  }, [])

  // Fechar menu do usuário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  const handleLogout = async () => {
    await auth.signOut()
  }

  return (
    <>
      {/* Menu Mobile (Overlay) */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
            onClick={onClose}
          />
          <div className="fixed top-0 right-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:hidden">
            <div className="flex h-full flex-col">
              {/* Header do menu mobile */}
              <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">FinanTrack</span>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                >
                  ×
                </button>
              </div>

              {/* Navegação mobile */}
              <nav className="flex-1 space-y-1 px-4 py-6">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className={`
                        group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative
                        ${isActive
                          ? 'bg-primary-50 text-primary-700 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-r"></div>
                      )}

                      <Icon className={`
                        mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200
                        ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}
                      `} />
                      <span className="transition-colors duration-200">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Footer do menu mobile */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all duration-200 group"
                >
                  <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="transition-colors duration-200">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default Sidebar
