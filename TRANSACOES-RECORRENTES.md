# Funcionalidade de Transações Recorrentes - FinanTrack

## Visão Geral

A funcionalidade de transações recorrentes permite aos usuários criar receitas e despesas que se repetem automaticamente, facilitando o gerenciamento de transações regulares como salários, aluguéis, contas mensais, etc.

## Tipos de Recorrência

### 1. Fixa Mensal
- **Descrição**: Cria automaticamente 12 transações mensais
- **Uso**: Ideal para salários, aluguéis, contas fixas mensais
- **Comportamento**: Gera transações para os próximos 12 meses a partir da data inicial

### 2. Repetição Personalizada
- **Descrição**: Permite especificar quantas vezes a transação deve se repetir
- **Uso**: Ideal para contratos temporários, parcelamentos, etc.
- **Limite**: Máximo de 60 repetições
- **Comportamento**: Gera o número especificado de transações mensais

## Como Usar

### Criando uma Transação Recorrente

1. **Acesse a página de Receitas ou Despesas**
2. **Clique em "Nova Receita" ou "Nova Despesa"**
3. **Preencha os dados básicos** (descrição, valor, categoria, data)
4. **Marque a opção "Esta é uma receita/despesa recorrente"**
5. **Selecione o tipo de recorrência:**
   - **Fixa Mensal**: Para transações que se repetem por 12 meses
   - **Repetição Personalizada**: Para especificar o número de repetições
6. **Se escolheu "Repetição Personalizada", informe o número de repetições**
7. **Clique em "Salvar"**

### Identificando Transações Recorrentes

As transações recorrentes são identificadas visualmente na lista por:
- **Badge azul** indicando "Mensal" ou "Recorrente"
- **Contador de repetições** (ex: "6x") para repetições personalizadas

### Editando Transações Recorrentes

Ao tentar editar uma transação recorrente, você verá um modal com duas opções:

1. **Editar apenas esta transação**
   - Modifica somente a instância selecionada
   - A transação editada deixa de fazer parte da série recorrente

2. **Editar toda a série**
   - ⚠️ **Funcionalidade em desenvolvimento**
   - Modificará todas as transações da série

### Excluindo Transações Recorrentes

Ao tentar excluir uma transação recorrente, você verá um modal com duas opções:

1. **Excluir apenas esta transação**
   - Remove somente a instância selecionada
   - Mantém as outras transações da série

2. **Excluir toda a série**
   - Remove todas as transações da série recorrente
   - ⚠️ **Ação irreversível**

## Estrutura do Banco de Dados

### Novos Campos Adicionados

- `is_recurring`: Boolean indicando se é uma transação recorrente
- `recurrence_type`: Tipo de recorrência ('fixed_monthly' ou 'custom_repeat')
- `recurrence_count`: Número de repetições (usado apenas para 'custom_repeat')
- `parent_transaction_id`: Referência à transação original
- `recurrence_group_id`: Identificador único para agrupar transações da mesma série

## Migração do Banco de Dados

Para aplicar as mudanças em um banco existente, execute o arquivo:
```sql
supabase-recurring-migration.sql
```

Para novos bancos, use o arquivo atualizado:
```sql
supabase-setup.sql
```

## Limitações Atuais

1. **Edição em massa**: A funcionalidade de editar toda a série ainda não está implementada
2. **Frequência**: Atualmente suporta apenas recorrência mensal
3. **Data limite**: Não há controle de data final para transações fixas mensais

## Próximas Melhorias

1. **Recorrência semanal/quinzenal**: Adicionar mais opções de frequência
2. **Data de término**: Permitir definir quando a recorrência deve parar
3. **Edição em massa**: Implementar edição de toda a série
4. **Relatórios específicos**: Relatórios focados em transações recorrentes
5. **Notificações**: Alertas para transações recorrentes próximas

## Suporte Técnico

Para dúvidas ou problemas com a funcionalidade de transações recorrentes, consulte:
- Logs do navegador (F12 > Console)
- Verificar se a migração do banco foi aplicada corretamente
- Confirmar se os novos campos estão presentes nas tabelas `receitas` e `despesas`
