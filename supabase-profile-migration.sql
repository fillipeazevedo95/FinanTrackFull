-- Migração para adicionar funcionalidade de perfil do usuário
-- Execute estes comandos no SQL Editor do Supabase

-- Criar tabela de perfil do usuário
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

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente (verificar se já existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'on_auth_user_created'
    AND event_object_table = 'users'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;

-- Criar perfis para usuários existentes (se houver)
INSERT INTO user_profiles (user_id, display_name)
SELECT id, email
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles);

-- Comentários sobre os campos:
-- avatar_url: URL da imagem de avatar do usuário (Supabase Storage)
-- theme: tema da interface ('light' ou 'dark')
-- currency: moeda preferida ('BRL', 'USD', 'EUR')
-- display_name: nome de exibição do usuário
