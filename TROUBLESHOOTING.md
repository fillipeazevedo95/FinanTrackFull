# Guia de Solução de Problemas - FinanTrack

## 🔧 Problemas Comuns e Soluções

### 1. Erro do TailwindCSS no PostCSS

**Problema**: Erro relacionado ao plugin do TailwindCSS no PostCSS

**Solução**:
```bash
# Remover versões conflitantes
npm uninstall tailwindcss @tailwindcss/postcss

# Instalar versão compatível
npm install -D tailwindcss@^3.4.0

# Verificar se o postcss.config.js está correto
```

Conteúdo do `postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 2. Problema com React não encontrado

**Solução**:
```bash
npm install react react-dom @vitejs/plugin-react
```

### 3. Erro de importação de módulos

**Problema**: Módulos não encontrados ou erros de importação

**Solução**:
1. Verifique se todas as dependências estão instaladas:
```bash
npm install
```

2. Limpe o cache do npm:
```bash
npm cache clean --force
```

3. Remova node_modules e reinstale:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 4. Problemas com o Supabase

**Problema**: Erros de conexão ou autenticação

**Soluções**:
1. Verifique se as variáveis de ambiente estão corretas no arquivo `.env`
2. Confirme se o projeto Supabase está ativo
3. Verifique se as tabelas foram criadas com o script SQL
4. Confirme se as políticas RLS estão habilitadas

### 5. Servidor não inicia

**Soluções**:
1. Verifique se a porta 3000 não está em uso:
```bash
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux
```

2. Use uma porta diferente:
```bash
npm run dev -- --port 3001
```

3. Verifique se o arquivo `vite.config.js` está correto:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})
```

### 6. Problemas de Build

**Problema**: Erro ao fazer build do projeto

**Soluções**:
1. Limpe o cache:
```bash
npm run build -- --force
```

2. Verifique se não há erros de TypeScript (mesmo em JS):
```bash
npm run build 2>&1 | grep -i error
```

### 7. Problemas de Estilização

**Problema**: Estilos do TailwindCSS não aparecem

**Soluções**:
1. Verifique se o arquivo `src/style.css` contém:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

2. Confirme se o arquivo está sendo importado no `main.jsx`:
```javascript
import './style.css'
```

3. Verifique o `tailwind.config.js`:
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ... resto da configuração
}
```

## 🚀 Comandos Úteis para Debug

### Verificar versões das dependências
```bash
npm list
```

### Verificar se há vulnerabilidades
```bash
npm audit
```

### Executar com logs detalhados
```bash
npm run dev -- --debug
```

### Verificar configuração do Vite
```bash
npx vite --help
```

## 📋 Checklist de Verificação

Antes de reportar um problema, verifique:

- [ ] Node.js versão 16+ instalado
- [ ] Todas as dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado corretamente
- [ ] Banco de dados Supabase configurado
- [ ] Porta 3000 disponível
- [ ] Cache limpo (`npm cache clean --force`)

## 🆘 Se nada funcionar

1. **Recrie o projeto do zero**:
```bash
# Backup dos arquivos importantes
cp -r src/ ../backup-src/
cp .env ../backup-env

# Recrie o projeto
npm create vite@latest novo-projeto -- --template react
cd novo-projeto
npm install

# Copie os arquivos de volta
cp -r ../backup-src/* src/
cp ../backup-env .env

# Instale as dependências específicas
npm install @supabase/supabase-js react-router-dom recharts lucide-react
npm install -D tailwindcss@^3.4.0 postcss autoprefixer @vitejs/plugin-react
```

2. **Verifique a documentação oficial**:
   - [Vite](https://vitejs.dev/)
   - [React](https://react.dev/)
   - [TailwindCSS](https://tailwindcss.com/)
   - [Supabase](https://supabase.com/docs)

3. **Contate o suporte** com as seguintes informações:
   - Versão do Node.js (`node --version`)
   - Sistema operacional
   - Mensagem de erro completa
   - Passos para reproduzir o problema
