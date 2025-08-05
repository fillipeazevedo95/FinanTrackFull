# FinanTrack - Sistema de Controle Financeiro

Um sistema completo de controle financeiro pessoal desenvolvido com React, Vite, TailwindCSS e Supabase.

## 🚀 Tecnologias Utilizadas

- **Frontend**: React + Vite + TailwindCSS + React Router
- **Backend**: Supabase (Auth + Database)
- **Gráficos**: Recharts
- **Ícones**: Lucide React
- **Estilização**: TailwindCSS

## 📋 Funcionalidades

- ✅ **Autenticação completa** (login/cadastro/logout)
- ✅ **Dashboard interativo** com gráficos e resumos
- ✅ **Gestão de receitas** (CRUD completo)
- ✅ **Gestão de despesas** (CRUD completo)
- ✅ **Relatórios detalhados** com filtros por período
- ✅ **Gráficos interativos** (linha, barras, pizza)
- ✅ **Design responsivo** para mobile e desktop
- ✅ **Sidebar navegável** com menu colapsível
- ✅ **Configurações de usuário**

## 🛠️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd FinanTrackLast
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Copie o arquivo `.env.example` para `.env`
4. Preencha as variáveis de ambiente:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 4. Configure o banco de dados

Execute o script SQL no editor SQL do Supabase (arquivo `supabase-setup.sql`):

```sql
-- O arquivo contém todas as tabelas e políticas de segurança necessárias
```

### 5. Execute o projeto
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Header.jsx      # Cabeçalho da aplicação
│   └── Sidebar.jsx     # Menu lateral
├── pages/              # Páginas da aplicação
│   ├── Dashboard.jsx   # Dashboard principal
│   ├── Receitas.jsx    # Gestão de receitas
│   ├── Despesas.jsx    # Gestão de despesas
│   ├── Relatorios.jsx  # Relatórios e gráficos
│   ├── Configuracoes.jsx # Configurações do usuário
│   └── Login.jsx       # Página de autenticação
├── routes/             # Configuração de rotas
│   └── AppRoutes.jsx   # Rotas protegidas
├── supabase/           # Configuração do Supabase
│   └── client.js       # Cliente e funções do Supabase
├── App.jsx             # Componente principal
├── main.jsx            # Ponto de entrada
└── style.css           # Estilos globais
```

## 🎨 Design e Interface

- **Design responsivo** que funciona em desktop, tablet e mobile
- **Sidebar colapsível** para navegação intuitiva
- **Tema moderno** com cores personalizadas
- **Gráficos interativos** para visualização de dados
- **Favicon personalizado** com tema financeiro

## 🔐 Segurança

- **Row Level Security (RLS)** habilitado no Supabase
- **Políticas de segurança** que garantem que cada usuário acesse apenas seus dados
- **Autenticação segura** via Supabase Auth
- **Rotas protegidas** que redirecionam usuários não autenticados

## 📊 Funcionalidades Detalhadas

### Dashboard
- Resumo financeiro com cards informativos
- Gráfico de evolução mensal (receitas vs despesas)
- Gráfico de pizza com distribuição de despesas por categoria
- Lista das transações mais recentes

### Receitas
- Adicionar, editar e excluir receitas
- Categorização (Salário, Freelance, Investimentos, etc.)
- Busca e filtros
- Visualização em tabela responsiva

### Despesas
- Adicionar, editar e excluir despesas
- Categorização (Alimentação, Transporte, Moradia, etc.)
- Busca e filtros
- Visualização em tabela responsiva

### Relatórios
- Filtros por mês e ano
- Gráficos comparativos por categoria
- Evolução mensal detalhada
- Tabela de resumo por categoria
- Opção de exportação (preparada para implementação)

### Configurações
- Gerenciamento de perfil do usuário
- Alteração de senha
- Configurações de notificações
- Preferências de aparência
- Opções de exportação e exclusão de dados

## 🚀 Scripts Disponíveis

```bash
npm run dev      # Inicia o servidor de desenvolvimento
npm run build    # Gera build de produção
npm run preview  # Visualiza o build de produção
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique se todas as dependências foram instaladas corretamente
2. Confirme se as variáveis de ambiente estão configuradas
3. Verifique se o banco de dados foi configurado com o script SQL
4. Consulte a documentação do [Supabase](https://supabase.com/docs)

---

Desenvolvido com ❤️ para ajudar no controle financeiro pessoal.
