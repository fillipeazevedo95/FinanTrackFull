-- Migração para adicionar funcionalidade de controle de pagamento
-- Execute estes comandos no SQL Editor do Supabase para atualizar tabelas existentes

-- Adicionar campo is_paid à tabela despesas
ALTER TABLE despesas 
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;

-- Adicionar índice para melhor performance nas consultas por status de pagamento
CREATE INDEX IF NOT EXISTS despesas_is_paid_idx ON despesas(is_paid);

-- Adicionar índice composto para consultas por usuário e status de pagamento
CREATE INDEX IF NOT EXISTS despesas_user_paid_idx ON despesas(user_id, is_paid);

-- Comentários sobre o campo:
-- is_paid: indica se a despesa foi efetivamente paga (true) ou ainda está pendente (false)
-- Padrão: false (despesas não pagas por padrão)

-- Verificar se a migração foi aplicada corretamente
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'despesas' AND column_name = 'is_paid';
