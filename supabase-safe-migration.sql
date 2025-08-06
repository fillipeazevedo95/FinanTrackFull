-- Migração Segura para Funcionalidades de Personalização
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar e criar tabela user_profiles se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    CREATE TABLE user_profiles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
      avatar_url TEXT,
      theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
      currency TEXT DEFAULT 'BRL' CHECK (currency IN ('BRL', 'USD', 'EUR')),
      display_name TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Criar índices
    CREATE INDEX user_profiles_user_id_idx ON user_profiles(user_id);
    
    -- Habilitar RLS
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'Tabela user_profiles criada com sucesso';
  ELSE
    RAISE NOTICE 'Tabela user_profiles já existe';
  END IF;
END $$;

-- 2. Criar políticas RLS se não existirem
DO $$
BEGIN
  -- Política de SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Usuários podem ver apenas seu próprio perfil'
  ) THEN
    CREATE POLICY "Usuários podem ver apenas seu próprio perfil" ON user_profiles
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Política de INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Usuários podem inserir apenas seu próprio perfil'
  ) THEN
    CREATE POLICY "Usuários podem inserir apenas seu próprio perfil" ON user_profiles
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Política de UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Usuários podem atualizar apenas seu próprio perfil'
  ) THEN
    CREATE POLICY "Usuários podem atualizar apenas seu próprio perfil" ON user_profiles
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  -- Política de DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Usuários podem deletar apenas seu próprio perfil'
  ) THEN
    CREATE POLICY "Usuários podem deletar apenas seu próprio perfil" ON user_profiles
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3. Criar função handle_new_user se não existir
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (new.id, COALESCE(new.email, 'Usuário'))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar trigger se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created' 
    AND event_object_table = 'users'
    AND event_object_schema = 'auth'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    RAISE NOTICE 'Trigger on_auth_user_created criado com sucesso';
  ELSE
    RAISE NOTICE 'Trigger on_auth_user_created já existe';
  END IF;
END $$;

-- 5. Criar trigger para updated_at se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_user_profiles_updated_at' 
    AND event_object_table = 'user_profiles'
  ) THEN
    CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE 'Trigger update_user_profiles_updated_at criado com sucesso';
  ELSE
    RAISE NOTICE 'Trigger update_user_profiles_updated_at já existe';
  END IF;
END $$;

-- 6. Criar perfis para usuários existentes
INSERT INTO user_profiles (user_id, display_name)
SELECT id, COALESCE(email, 'Usuário')
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles);

-- 7. Verificar resultado
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN avatar_url IS NOT NULL THEN 1 END) as profiles_with_avatar,
  COUNT(CASE WHEN theme = 'dark' THEN 1 END) as dark_theme_users
FROM user_profiles;

-- Instruções para configurar o Storage:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá para Storage
-- 3. Clique em "Create bucket"
-- 4. Nome: "avatars"
-- 5. Marque como "Public bucket"
-- 6. Clique em "Save"
-- 7. Execute as políticas de storage do arquivo supabase-storage-setup.sql
