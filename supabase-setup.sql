-- Configuração das tabelas para o sistema de controle financeiro
-- Execute estes comandos no SQL Editor do Supabase

-- Habilitar RLS (Row Level Security)
-- Isso garante que cada usuário só acesse seus próprios dados

-- Tabela de receitas
CREATE TABLE IF NOT EXISTS receitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  categoria TEXT NOT NULL,
  data DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_type TEXT CHECK (recurrence_type IN ('fixed_monthly', 'custom_repeat')),
  recurrence_count INTEGER,
  parent_transaction_id UUID,
  recurrence_group_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de despesas
CREATE TABLE IF NOT EXISTS despesas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  categoria TEXT NOT NULL,
  data DATE NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_type TEXT CHECK (recurrence_type IN ('fixed_monthly', 'custom_repeat')),
  recurrence_count INTEGER,
  parent_transaction_id UUID,
  recurrence_group_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS nas tabelas
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver) e recriar
DROP POLICY IF EXISTS "Usuários podem ver suas próprias receitas" ON receitas;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias receitas" ON receitas;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias receitas" ON receitas;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias receitas" ON receitas;

DROP POLICY IF EXISTS "Usuários podem ver suas próprias despesas" ON despesas;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias despesas" ON despesas;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias despesas" ON despesas;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias despesas" ON despesas;

-- Políticas de segurança para receitas
-- Usuários só podem ver/editar suas próprias receitas
CREATE POLICY "Usuários podem ver suas próprias receitas" ON receitas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias receitas" ON receitas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias receitas" ON receitas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias receitas" ON receitas
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas de segurança para despesas
-- Usuários só podem ver/editar suas próprias despesas
CREATE POLICY "Usuários podem ver suas próprias despesas" ON despesas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias despesas" ON despesas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias despesas" ON despesas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias despesas" ON despesas
  FOR DELETE USING (auth.uid() = user_id);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS receitas_user_id_idx ON receitas(user_id);
CREATE INDEX IF NOT EXISTS receitas_data_idx ON receitas(data);
CREATE INDEX IF NOT EXISTS receitas_recurrence_group_idx ON receitas(recurrence_group_id);
CREATE INDEX IF NOT EXISTS receitas_parent_transaction_idx ON receitas(parent_transaction_id);
CREATE INDEX IF NOT EXISTS despesas_user_id_idx ON despesas(user_id);
CREATE INDEX IF NOT EXISTS despesas_data_idx ON despesas(data);
CREATE INDEX IF NOT EXISTS despesas_is_paid_idx ON despesas(is_paid);
CREATE INDEX IF NOT EXISTS despesas_recurrence_group_idx ON despesas(recurrence_group_id);
CREATE INDEX IF NOT EXISTS despesas_parent_transaction_idx ON despesas(parent_transaction_id);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_receitas_updated_at BEFORE UPDATE ON receitas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_despesas_updated_at BEFORE UPDATE ON despesas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabela de perfil do usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  avatar_url TEXT,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  currency TEXT DEFAULT 'BRL' CHECK (currency IN ('BRL', 'USD', 'EUR')),
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para a tabela de perfil
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);

-- Trigger para atualizar updated_at na tabela de perfil
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS para user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas seu próprio perfil" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas seu próprio perfil" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas seu próprio perfil" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar apenas seu próprio perfil" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);
