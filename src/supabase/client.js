import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase usando variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Debug das configurações
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key (primeiros 20 chars):', supabaseAnonKey?.substring(0, 20) + '...')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções de autenticação
export const auth = {
  // Fazer login
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Fazer cadastro
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  // Fazer logout
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Obter usuário atual
  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  // Escutar mudanças de autenticação
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Funções para receitas
export const receitas = {
  // Buscar todas as receitas do usuário
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('receitas')
      .select('*')
      .eq('user_id', userId)
      .order('data', { ascending: false })
    return { data, error }
  },

  // Criar nova receita
  create: async (receita) => {
    const { data, error } = await supabase
      .from('receitas')
      .insert([receita])
      .select()
    return { data, error }
  },

  // Atualizar receita
  update: async (id, receita) => {
    const { data, error } = await supabase
      .from('receitas')
      .update(receita)
      .eq('id', id)
      .select()
    return { data, error }
  },

  // Deletar receita
  delete: async (id) => {
    const { data, error } = await supabase
      .from('receitas')
      .delete()
      .eq('id', id)
    return { data, error }
  }
}

// Funções para despesas
export const despesas = {
  // Buscar todas as despesas do usuário
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('despesas')
      .select('*')
      .eq('user_id', userId)
      .order('data', { ascending: false })
    return { data, error }
  },

  // Criar nova despesa
  create: async (despesa) => {
    const { data, error } = await supabase
      .from('despesas')
      .insert([despesa])
      .select()
    return { data, error }
  },

  // Atualizar despesa
  update: async (id, despesa) => {
    const { data, error } = await supabase
      .from('despesas')
      .update(despesa)
      .eq('id', id)
      .select()
    return { data, error }
  },

  // Deletar despesa
  delete: async (id) => {
    const { data, error } = await supabase
      .from('despesas')
      .delete()
      .eq('id', id)
    return { data, error }
  }
}

// Funções para configurações do usuário
export const userSettings = {
  // Buscar configurações do usuário
  get: async (userId) => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  // Criar ou atualizar configurações
  upsert: async (settings) => {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert(settings, { onConflict: 'user_id' })
      .select()
      .single()
    return { data, error }
  },

  // Deletar configurações (para exclusão de conta)
  delete: async (userId) => {
    const { data, error } = await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', userId)
    return { data, error }
  }
}

// Funções para upload de avatar
export const storage = {
  // Upload de avatar
  uploadAvatar: async (userId, file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/avatar.${fileExt}`

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (error) return { data: null, error }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return { data: { path: data.path, publicUrl }, error: null }
  },

  // Deletar avatar
  deleteAvatar: async (userId) => {
    const { data, error } = await supabase.storage
      .from('avatars')
      .remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.jpeg`])
    return { data, error }
  }
}

// Funções para exportação de dados
export const dataExport = {
  // Exportar todos os dados do usuário
  exportUserData: async (userId) => {
    try {
      // Buscar receitas
      const { data: receitasData } = await receitas.getAll(userId)

      // Buscar despesas
      const { data: despesasData } = await despesas.getAll(userId)

      // Buscar configurações
      const { data: settingsData } = await userSettings.get(userId)

      // Buscar dados do usuário
      const { data: userData } = await auth.getCurrentUser()

      const exportData = {
        usuario: {
          email: userData.user?.email,
          created_at: userData.user?.created_at
        },
        configuracoes: settingsData,
        receitas: receitasData || [],
        despesas: despesasData || [],
        exportado_em: new Date().toISOString()
      }

      return { data: exportData, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}
