-- Migração para adicionar funcionalidade de transações recorrentes
-- Execute estes comandos no SQL Editor do Supabase para atualizar tabelas existentes

-- Adicionar campos de recorrência à tabela receitas
ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_type TEXT CHECK (recurrence_type IN ('fixed_monthly', 'custom_repeat')),
ADD COLUMN IF NOT EXISTS recurrence_count INTEGER,
ADD COLUMN IF NOT EXISTS parent_transaction_id UUID,
ADD COLUMN IF NOT EXISTS recurrence_group_id UUID;

-- Adicionar campos de recorrência à tabela despesas
ALTER TABLE despesas 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_type TEXT CHECK (recurrence_type IN ('fixed_monthly', 'custom_repeat')),
ADD COLUMN IF NOT EXISTS recurrence_count INTEGER,
ADD COLUMN IF NOT EXISTS parent_transaction_id UUID,
ADD COLUMN IF NOT EXISTS recurrence_group_id UUID;

-- Adicionar índices para os novos campos
CREATE INDEX IF NOT EXISTS receitas_recurrence_group_idx ON receitas(recurrence_group_id);
CREATE INDEX IF NOT EXISTS receitas_parent_transaction_idx ON receitas(parent_transaction_id);
CREATE INDEX IF NOT EXISTS receitas_is_recurring_idx ON receitas(is_recurring);

CREATE INDEX IF NOT EXISTS despesas_recurrence_group_idx ON despesas(recurrence_group_id);
CREATE INDEX IF NOT EXISTS despesas_parent_transaction_idx ON despesas(parent_transaction_id);
CREATE INDEX IF NOT EXISTS despesas_is_recurring_idx ON despesas(is_recurring);

-- Comentários sobre os campos:
-- is_recurring: indica se a transação é recorrente
-- recurrence_type: tipo de recorrência ('fixed_monthly' ou 'custom_repeat')
-- recurrence_count: número de repetições (usado apenas para 'custom_repeat')
-- parent_transaction_id: referência à transação original (primeira da série)
-- recurrence_group_id: identificador único para agrupar todas as transações de uma série recorrente
