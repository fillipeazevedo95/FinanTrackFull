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
