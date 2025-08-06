  -- Configuração do Supabase Storage para avatares
  -- Execute estes comandos no SQL Editor do Supabase

  -- Criar bucket para avatares (se não existir)
  -- Nota: Este comando pode precisar ser executado via interface do Supabase Storage
  -- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

  -- Políticas de Storage para o bucket avatars
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

  -- Função para criar perfil automaticamente quando usuário se registra
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger AS $$
  BEGIN
    INSERT INTO public.user_profiles (user_id, display_name)
    VALUES (new.id, new.email);
    RETURN new;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Trigger para criar perfil automaticamente (remover se já existir)
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

  -- Instruções para configurar o bucket via interface:
  -- 1. Acesse o Supabase Dashboard
  -- 2. Vá para Storage
  -- 3. Clique em "Create bucket"
  -- 4. Nome: "avatars"
  -- 5. Marque como "Public bucket"
  -- 6. Clique em "Save"
