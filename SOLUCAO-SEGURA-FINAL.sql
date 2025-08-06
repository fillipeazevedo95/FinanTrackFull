-- SOLUÇÃO SEGURA FINAL PARA USER_PROFILES
-- Este script não remove funções compartilhadas com outras tabelas

-- ========================================
-- PARTE 1: LIMPEZA SEGURA
-- ========================================

-- Desabilitar RLS temporariamente
ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "Usuários podem ver apenas seu próprio perfil" ON public.user_profiles;
DROP POLICY IF EXISTS "Usuários podem inserir apenas seu próprio perfil" ON public.user_profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas seu próprio perfil" ON public.user_profiles;
DROP POLICY IF EXISTS "Usuários podem deletar apenas seu próprio perfil" ON public.user_profiles;

-- Remover apenas triggers e funções específicas (não as compartilhadas)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Remover tabela existente
DROP TABLE IF EXISTS public.user_profiles;

-- ========================================
-- PARTE 2: RECRIAÇÃO COMPLETA
-- ========================================

-- Criar tabela user_profiles
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

-- Criar índice
CREATE INDEX user_profiles_user_id_idx ON public.user_profiles(user_id);

-- ========================================
-- PARTE 3: CONFIGURAR RLS E POLÍTICAS
-- ========================================

-- Habilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas simples e funcionais
CREATE POLICY "user_profiles_select_policy" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_insert_policy" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update_policy" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_delete_policy" ON public.user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- PARTE 4: FUNÇÕES E TRIGGERS
-- ========================================

-- A função update_updated_at_column() já existe e é usada por outras tabelas
-- Apenas criar o trigger para user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Função para criar perfil automaticamente
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
    -- Se der erro, não falha o registro
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para novos usuários
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ========================================
-- PARTE 5: CRIAR PERFIS EXISTENTES
-- ========================================

-- Criar perfil para usuários existentes
INSERT INTO public.user_profiles (user_id, theme, currency, display_name)
SELECT 
  au.id,
  'light',
  'BRL',
  COALESCE(au.email, 'Usuário')
FROM auth.users au
WHERE au.id NOT IN (SELECT user_id FROM public.user_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- ========================================
-- PARTE 6: CONFIGURAR STORAGE
-- ========================================

-- Remover políticas de storage existentes
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

-- ========================================
-- PARTE 7: VERIFICAÇÃO FINAL
-- ========================================

-- Verificar se tudo foi criado
SELECT 
  'SUCESSO: Tabela criada com' as status,
  COUNT(*) as total_profiles,
  'perfis' as info
FROM public.user_profiles;

-- Testar acesso do usuário atual
SELECT 
  'TESTE: Perfil do usuário atual' as status,
  user_id,
  theme,
  currency,
  display_name
FROM public.user_profiles 
WHERE user_id = auth.uid();

-- ========================================
-- INSTRUÇÕES FINAIS
-- ========================================

-- AGORA FAÇA:
-- 1. Crie o bucket 'avatars' no Storage (público)
-- 2. Recarregue a aplicação: http://localhost:3001/
-- 3. Teste todas as funcionalidades de personalização
-- 4. TUDO DEVE FUNCIONAR PERFEITAMENTE!
