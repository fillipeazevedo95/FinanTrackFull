-- Correção Simples e Direta para user_profiles
-- Execute este script para resolver os problemas de acesso

-- 1. DESABILITAR RLS TEMPORARIAMENTE PARA LIMPEZA
ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Usuários podem ver apenas seu próprio perfil" ON public.user_profiles;
DROP POLICY IF EXISTS "Usuários podem inserir apenas seu próprio perfil" ON public.user_profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas seu próprio perfil" ON public.user_profiles;
DROP POLICY IF EXISTS "Usuários podem deletar apenas seu próprio perfil" ON public.user_profiles;

-- 3. REMOVER TRIGGER E FUNÇÃO EXISTENTES
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 4. RECRIAR TABELA DO ZERO (mais seguro)
DROP TABLE IF EXISTS public.user_profiles;

CREATE TABLE public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  avatar_url TEXT,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  currency TEXT DEFAULT 'BRL' CHECK (currency IN ('BRL', 'USD', 'EUR')),
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CRIAR ÍNDICE PARA PERFORMANCE
CREATE INDEX user_profiles_user_id_idx ON public.user_profiles(user_id);

-- 6. HABILITAR RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 7. CRIAR POLÍTICAS SIMPLES E FUNCIONAIS
CREATE POLICY "Enable read access for users based on user_id" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for users based on user_id" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON public.user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- 8. CRIAR FUNÇÃO PARA NOVOS USUÁRIOS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, theme, currency, display_name)
  VALUES (
    new.id,
    'light',
    'BRL',
    COALESCE(new.email, 'Usuário')
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Se der erro, não falha o registro do usuário
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. CRIAR TRIGGER PARA NOVOS USUÁRIOS
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. CRIAR PERFIL PARA USUÁRIOS EXISTENTES
INSERT INTO public.user_profiles (user_id, theme, currency, display_name)
SELECT 
  au.id,
  'light',
  'BRL',
  COALESCE(au.email, 'Usuário')
FROM auth.users au
WHERE au.id NOT IN (SELECT user_id FROM public.user_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- 11. FUNÇÃO PARA ATUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. TRIGGER PARA ATUALIZAR TIMESTAMP
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- 13. CONFIGURAR POLÍTICAS DE STORAGE PARA AVATARES
-- Remover políticas existentes primeiro
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Criar políticas de storage
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 14. VERIFICAR SE TUDO FOI CRIADO CORRETAMENTE
SELECT
  'Tabela criada' as status,
  COUNT(*) as total_profiles
FROM public.user_profiles;

-- 15. TESTAR ACESSO DIRETO
SELECT
  'Teste de acesso' as status,
  user_id,
  theme,
  currency,
  display_name
FROM public.user_profiles
WHERE user_id = auth.uid();

-- SUCESSO! Agora:
-- 1. Crie o bucket 'avatars' no Storage (público)
-- 2. Teste a aplicação em http://localhost:3001/
