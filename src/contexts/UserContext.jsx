import { createContext, useContext, useState, useEffect } from 'react'
import { userProfile } from '../supabase/client'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [theme, setTheme] = useState('light')
  const [currency, setCurrency] = useState('BRL')
  const [loading, setLoading] = useState(true)

  // Carregar perfil do usuário
  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await userProfile.get(userId)
      
      if (error && error.code === 'PGRST116') {
        // Perfil não existe, criar um novo
        const newProfile = {
          user_id: userId,
          theme: 'light',
          currency: 'BRL',
          display_name: user?.email || ''
        }
        
        const { data: createdProfile, error: createError } = await userProfile.create(newProfile)
        if (createError) {
          console.error('Erro ao criar perfil:', createError)
          return
        }
        
        setProfile(createdProfile)
        setTheme(createdProfile.theme)
        setCurrency(createdProfile.currency)
      } else if (data) {
        setProfile(data)
        setTheme(data.theme)
        setCurrency(data.currency)
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    }
  }

  // Atualizar perfil
  const updateProfile = async (updates) => {
    if (!user) return

    try {
      const { data, error } = await userProfile.update(user.id, updates)
      if (error) throw error

      setProfile(data)
      
      // Atualizar estados locais
      if (updates.theme) setTheme(updates.theme)
      if (updates.currency) setCurrency(updates.currency)
      
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      return { data: null, error }
    }
  }

  // Upload de avatar
  const uploadAvatar = async (file) => {
    if (!user) return

    try {
      const { data: avatarUrl, error } = await userProfile.uploadAvatar(user.id, file)
      if (error) throw error

      // Atualizar perfil com nova URL do avatar
      const { data: updatedProfile, error: updateError } = await updateProfile({
        avatar_url: avatarUrl
      })
      
      if (updateError) throw updateError

      return { data: avatarUrl, error: null }
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error)
      return { data: null, error }
    }
  }

  // Remover avatar
  const removeAvatar = async () => {
    if (!user) return

    try {
      await userProfile.deleteAvatar(user.id)
      
      // Atualizar perfil removendo URL do avatar
      const { data, error } = await updateProfile({
        avatar_url: null
      })
      
      return { data, error }
    } catch (error) {
      console.error('Erro ao remover avatar:', error)
      return { data: null, error }
    }
  }

  // Alternar tema
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    await updateProfile({ theme: newTheme })
  }

  // Alterar moeda
  const changeCurrency = async (newCurrency) => {
    await updateProfile({ currency: newCurrency })
  }

  // Formatação de moeda
  const formatCurrency = (value) => {
    const numValue = parseFloat(value) || 0
    
    const formats = {
      BRL: { locale: 'pt-BR', currency: 'BRL' },
      USD: { locale: 'en-US', currency: 'USD' },
      EUR: { locale: 'de-DE', currency: 'EUR' }
    }
    
    const format = formats[currency] || formats.BRL
    
    return new Intl.NumberFormat(format.locale, {
      style: 'currency',
      currency: format.currency,
      minimumFractionDigits: 2
    }).format(numValue)
  }

  // Aplicar tema ao documento
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Carregar perfil quando usuário muda
  useEffect(() => {
    if (user) {
      loadUserProfile(user.id)
    } else {
      setProfile(null)
      setTheme('light')
      setCurrency('BRL')
    }
    setLoading(false)
  }, [user])

  const value = {
    user,
    setUser,
    profile,
    theme,
    currency,
    loading,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    toggleTheme,
    changeCurrency,
    formatCurrency
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider
