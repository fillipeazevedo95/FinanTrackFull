import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { auth } from '../supabase/client'
import { useUser } from '../contexts/UserContext'

// Componentes de layout
import Header from '../components/Header'

// Páginas
import Dashboard from '../pages/Dashboard'
import Receitas from '../pages/Receitas'
import Despesas from '../pages/Despesas'
import Relatorios from '../pages/Relatorios'
import Configuracoes from '../pages/Configuracoes'
import Login from '../pages/Login'

// Componente para rotas protegidas
const ProtectedRoute = ({ children }) => {
  const { user, setUser, loading } = useUser()

  useEffect(() => {
    // Verificar se há usuário logado
    const checkUser = async () => {
      const { data } = await auth.getCurrentUser()
      setUser(data.user)
    }

    if (!user) {
      checkUser()
    }

    // Escutar mudanças de autenticação
    const { data: { subscription } } = auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [user, setUser])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Layout principal da aplicação
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Rota de login */}
        <Route path="/login" element={<Login />} />
        
        {/* Rotas protegidas */}
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/receitas" element={
          <ProtectedRoute>
            <AppLayout>
              <Receitas />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/despesas" element={
          <ProtectedRoute>
            <AppLayout>
              <Despesas />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/relatorios" element={
          <ProtectedRoute>
            <AppLayout>
              <Relatorios />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/configuracoes" element={
          <ProtectedRoute>
            <AppLayout>
              <Configuracoes />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        {/* Redirecionar rotas não encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default AppRoutes
