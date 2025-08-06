# Funcionalidade de Controle de Pagamento - FinanTrack

## Visão Geral

A funcionalidade de controle de pagamento permite aos usuários marcar despesas como "pagas" ou "pendentes", oferecendo um controle mais preciso entre gastos planejados e gastos efetivamente realizados.

## Funcionalidades Implementadas

### 1. Campo "Pago" nas Despesas
- **Campo no banco**: `is_paid` (boolean, padrão: false)
- **Interface**: Checkbox "Despesa paga" nos formulários de criação/edição
- **Funcionalidade**: Permite marcar despesas como pagas ou pendentes

### 2. Indicadores Visuais
- **Status na lista**: Botão clicável mostrando "✓ Pago" (verde) ou "✗ Pendente" (vermelho)
- **Fundo das linhas**: Despesas pagas têm fundo verde claro
- **Alternância rápida**: Clique no status para alternar entre pago/pendente

### 3. Cálculos Atualizados
- **Dashboard**: Considera apenas despesas pagas nos totais e gráficos
- **Relatórios**: Filtra apenas despesas pagas nos gráficos e estatísticas
- **Novos cards**: Separação entre despesas pagas e pendentes

## Como Usar

### Marcando uma Despesa como Paga

#### Ao Criar uma Nova Despesa:
1. Preencha os dados da despesa normalmente
2. Marque o checkbox "Despesa paga" se a despesa já foi paga
3. Clique em "Salvar"

#### Na Lista de Despesas:
1. Localize a despesa na lista
2. Clique no botão de status (coluna "Status")
3. O status alternará automaticamente entre "Pago" e "Pendente"

### Visualizando Estatísticas

#### Página de Despesas:
- **Total Geral**: Soma de todas as despesas (pagas + pendentes)
- **Despesas Pagas**: Soma apenas das despesas marcadas como pagas
- **Despesas Pendentes**: Soma das despesas ainda não pagas

#### Dashboard:
- **Despesas Pagas**: Mostra apenas o valor das despesas efetivamente pagas
- **Despesas Pendentes**: Novo card mostrando valor das despesas pendentes
- **Saldo**: Calculado considerando apenas despesas pagas

#### Relatórios:
- **Gráficos**: Consideram apenas despesas pagas
- **Comparações**: Baseadas em gastos reais (despesas pagas)

## Estrutura do Banco de Dados

### Campo Adicionado
```sql
ALTER TABLE despesas 
ADD COLUMN is_paid BOOLEAN DEFAULT false;
```

### Índices Criados
```sql
CREATE INDEX despesas_is_paid_idx ON despesas(is_paid);
CREATE INDEX despesas_user_paid_idx ON despesas(user_id, is_paid);
```

## Migração do Banco de Dados

Para aplicar as mudanças em um banco existente:
```sql
-- Execute o arquivo: supabase-payment-migration.sql
```

Para novos bancos:
```sql
-- Use o arquivo atualizado: supabase-setup.sql
```

## Funções do Cliente Supabase

### Novas Funções Adicionadas:
- `updatePaymentStatus(id, isPaid)`: Atualiza status de pagamento
- `getPaidOnly(userId)`: Busca apenas despesas pagas
- `getUnpaidOnly(userId)`: Busca apenas despesas não pagas
- `getPaymentStats(userId)`: Retorna estatísticas de pagamento

## Benefícios da Funcionalidade

### 1. Controle Financeiro Preciso
- Distinção clara entre gastos planejados e realizados
- Melhor visão do fluxo de caixa real

### 2. Planejamento Aprimorado
- Visualização de compromissos pendentes
- Controle de contas a pagar

### 3. Relatórios Mais Precisos
- Gráficos baseados em gastos reais
- Análises mais confiáveis

### 4. Interface Intuitiva
- Alternância rápida de status
- Indicadores visuais claros
- Estatísticas separadas

## Casos de Uso

### 1. Controle de Contas Mensais
- Cadastrar todas as contas do mês como pendentes
- Marcar como pagas conforme são quitadas
- Acompanhar o que ainda precisa ser pago

### 2. Planejamento de Gastos
- Registrar gastos futuros como pendentes
- Visualizar impacto no orçamento
- Controlar execução do planejamento

### 3. Análise de Fluxo de Caixa
- Dashboard mostra situação real vs planejada
- Relatórios baseados em gastos efetivos
- Melhor tomada de decisões financeiras

## Limitações e Considerações

### 1. Compatibilidade
- Despesas existentes são marcadas como "não pagas" por padrão
- Necessário aplicar migração do banco de dados

### 2. Transações Recorrentes
- Status de pagamento é individual para cada instância
- Não há propagação automática do status na série

### 3. Relatórios Históricos
- Mudança afeta apenas cálculos futuros
- Dados históricos mantêm comportamento anterior

## Próximas Melhorias

1. **Filtros Avançados**: Filtrar lista por status de pagamento
2. **Notificações**: Alertas para despesas pendentes próximas ao vencimento
3. **Relatórios Comparativos**: Planejado vs Realizado
4. **Integração Bancária**: Marcação automática via extrato
5. **Categorização de Status**: Diferentes tipos de status (agendado, processando, etc.)

## Suporte Técnico

Para problemas com a funcionalidade:
1. Verificar se a migração do banco foi aplicada
2. Confirmar se o campo `is_paid` existe na tabela `despesas`
3. Verificar logs do navegador para erros JavaScript
4. Testar funcionalidade com despesas novas primeiro
