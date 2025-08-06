-- Teste de Acesso ao user_profiles
-- Execute este script para testar se o acesso está funcionando

-- 1. VERIFICAR USUÁRIO ATUAL
SELECT 
  'Usuário atual:' as info,
  auth.uid() as user_id,
  auth.email() as email,
  auth.role() as role;

-- 2. VERIFICAR SE A TABELA EXISTE E TEM DADOS
SELECT 
  'Total de perfis:' as info,
  COUNT(*) as total
FROM public.user_profiles;

-- 3. TESTAR ACESSO COM RLS (como a aplicação faz)
SELECT 
  'Perfil do usuário atual (com RLS):' as info,
  *
FROM public.user_profiles 
WHERE user_id = auth.uid();

-- 4. TESTAR ACESSO SEM RLS (para debug)
SET row_security = off;
SELECT 
  'Todos os perfis (sem RLS):' as info,
  user_id,
  theme,
  currency,
  display_name,
  created_at
FROM public.user_profiles 
LIMIT 5;
SET row_security = on;

-- 5. VERIFICAR POLÍTICAS RLS
SELECT 
  'Políticas RLS:' as info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 6. CRIAR PERFIL PARA O USUÁRIO ATUAL SE NÃO EXISTIR
INSERT INTO public.user_profiles (user_id, theme, currency, display_name)
SELECT 
  auth.uid(),
  'light',
  'BRL',
  'Usuário Teste'
WHERE auth.uid() IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid()
  );

-- 7. VERIFICAR NOVAMENTE APÓS INSERÇÃO
SELECT 
  'Perfil após inserção:' as info,
  *
FROM public.user_profiles 
WHERE user_id = auth.uid();

-- 8. TESTAR UPDATE
UPDATE public.user_profiles 
SET theme = 'dark', updated_at = NOW()
WHERE user_id = auth.uid();

-- 9. VERIFICAR APÓS UPDATE
SELECT 
  'Perfil após update:' as info,
  *
FROM public.user_profiles 
WHERE user_id = auth.uid();

-- 10. REVERTER UPDATE PARA LIGHT
UPDATE public.user_profiles 
SET theme = 'light', updated_at = NOW()
WHERE user_id = auth.uid();
