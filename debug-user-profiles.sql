-- Script de Debug para user_profiles
-- Execute este script para diagnosticar os problemas

-- 1. VERIFICAR SE A TABELA EXISTE
SELECT 
  table_name, 
  table_schema
FROM information_schema.tables 
WHERE table_name = 'user_profiles';

-- 2. VERIFICAR ESTRUTURA DA TABELA
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 3. VERIFICAR POLÍTICAS RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 4. VERIFICAR SE RLS ESTÁ HABILITADO
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 5. VERIFICAR REGISTROS EXISTENTES
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN avatar_url IS NOT NULL THEN 1 END) as with_avatar,
  COUNT(CASE WHEN theme = 'dark' THEN 1 END) as dark_theme
FROM user_profiles;

-- 6. VERIFICAR USUÁRIO ATUAL
SELECT 
  auth.uid() as current_user_id,
  auth.email() as current_user_email;

-- 7. VERIFICAR SE PERFIL DO USUÁRIO ATUAL EXISTE
SELECT 
  up.*
FROM user_profiles up
WHERE up.user_id = auth.uid();

-- 8. TESTAR ACESSO DIRETO (sem RLS)
SET row_security = off;
SELECT * FROM user_profiles LIMIT 5;
SET row_security = on;

-- 9. VERIFICAR TRIGGERS
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_schema = 'auth';

-- 10. VERIFICAR FUNÇÕES
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
