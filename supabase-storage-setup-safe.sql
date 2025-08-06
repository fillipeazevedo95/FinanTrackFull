-- FinanTrack - Configuração Segura do Storage e Resolução de Conflitos
-- Este script resolve o erro do trigger duplicado e configura o storage de forma segura

-- 1. RESOLVER ERRO DO TRIGGER DUPLICADO
-- Remove o trigger existente antes de recriar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. REMOVER POLÍTICAS EXISTENTES (evita erro de duplicação)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- 3. CRIAR POLÍTICAS DE STORAGE PARA AVATARES
-- Permitir que usuários vejam avatares públicos
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Permitir que usuários autenticados façam upload de seus próprios avatares
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Permitir que usuários atualizem seus próprios avatares
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Permitir que usuários deletem seus próprios avatares
CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. FUNÇÃO PARA CRIAR PERFIL DE USUÁRIO AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, theme, currency)
  VALUES (
    new.id,
    new.email,
    'light',
    'BRL'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RECRIAR O TRIGGER CORRETAMENTE
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. HABILITAR RLS (Row Level Security) se não estiver habilitado
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICA PARA USER_PROFILES (se não existir)
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 8. COMENTÁRIOS DE SUCESSO
-- Se chegou até aqui, tudo foi configurado com sucesso!
-- Agora você precisa:
-- 1. Criar o bucket 'avatars' no Storage (público)
-- 2. Testar o upload de avatar nas configurações
-- 3. Testar a alternância de tema no header
-- 4. Testar a seleção de moeda nas configurações
