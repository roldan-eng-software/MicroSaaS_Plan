# 🪵 Marcenaria MDF - Sistema de Orçamentos

Um aplicativo completo para gerenciar clientes e orçamentos de uma marcenaria. Construído com **FastAPI** no backend e **React + TypeScript** no frontend.

---

## 📋 Tabela de Conteúdos

- [Características](#características)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Funcionalidades](#funcionalidades)
- [Troubleshooting](#troubleshooting)

---

## ✨ Características

### 🎯 Funcionalidades Principais

- **👥 Gerenciamento de Clientes**
  - Criar, editar, deletar clientes
  - Armazenar email e telefone
  - Exportar para Excel

- **📋 Gerenciamento de Orçamentos**
  - Criar, editar, deletar orçamentos
  - Cálculo automático de desconto
  - Associar cliente ao orçamento
  - Status: Rascunho, Aprovado, Rejeitado

- **📊 Dashboard Avançado**
  - KPIs em tempo real
  - Gráficos de faturamento
  - Análise de status de orçamentos
  - Top 5 clientes por faturamento
  - Crescimento mensal

- **📄 Geração de PDF**
  - PDF profissional de orçamentos
  - Dados do cliente e orçamento
  - Download automático

- **📧 Sistema de Emails**
  - Email de confirmação de orçamento
  - Email de aprovação/rejeição
  - Template HTML personalizado
  - Integração com EmailJS

- **📥 Exportação de Dados**
  - Excel de clientes
  - Excel de orçamentos
  - Relatório mensal completo

- **🔐 Autenticação**
  - Login com Supabase
  - Registro de novo usuário
  - Token JWT
  - Rotas protegidas

- **🎨 Interface Moderna**
  - Sidebar colapsável
  - Dark mode ready
  - Notificações Toast
  - Error Boundary
  - Design responsivo com Tailwind CSS

---

## 🔧 Pré-requisitos

### Backend
- Python 3.9+
- pip ou poetry
- PostgreSQL (ou Supabase)

### Frontend
- Node.js 18+
- Bun ou npm
- Navegador moderno

### Serviços Externos
- **Supabase** (autenticação e banco de dados)
- **EmailJS** (envio de emails)

---

## 📦 Instalação

### Backend

```bash
# Clonar repositório (ou navegar para a pasta backend)
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Executar servidor
uvicorn main:app --reload
# Servidor rodará em: http://localhost:8000
```

### Frontend

```bash
# Navegar para a pasta frontend
cd frontend

# Instalar dependências
bun install
# ou
npm install

# Executar servidor de desenvolvimento
bun run dev
# ou
npm run dev
# Aplicação rodará em: http://localhost:5173
```

---

## ⚙️ Configuração

### 1. Supabase Setup

1. Acesse https://app.supabase.com
2. Crie um novo projeto
3. Vá em **Settings → API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_KEY`

### 2. EmailJS Setup

1. Acesse https://dashboard.emailjs.com
2. Crie uma conta
3. Configure um serviço de email
4. Crie um template de email com as variáveis:
   - `{{customer_name}}`
   - `{{customer_email}}`
   - `{{budget_title}}`
   - `{{budget_amount}}`
   - `{{budget_id}}`
   - `{{date}}`
   - `{{time}}`
5. Copie:
   - **Service ID** → `VITE_EMAILJS_SERVICE_ID`
   - **Template ID** → `VITE_EMAILJS_TEMPLATE_ID`
   - **Public Key** → `VITE_EMAILJS_PUBLIC_KEY`

### 3. Variáveis de Ambiente

**Frontend (`.env.local`):**
```plaintext
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_KEY=sua-chave-publica-aqui
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=sua-chave-publica-aqui
VITE_API_URL=http://localhost:8000/api
```

**Backend (`.env`):**
```plaintext
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-publica-aqui
DATABASE_URL=sua-url-postgres
RESEND_API_KEY=sua-chave-resend-opcional
```

---

## 🚀 Execução

### Modo Desenvolvimento

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # ou venv\Scripts\activate no Windows
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
bun run dev
```

Acesse: http://localhost:5173

### Dados de Teste

```
Email: teste@example.com
Senha: 123456
```

---

## 📁 Estrutura do Projeto

```
marcenaria-project/
├── backend/
│   ├── main.py                 # API principal
│   ├── database.py             # Configuração DB
│   ├── email_service.py        # Serviço de emails
│   ├── pdf_generator.py        # Geração de PDF
│   ├── export_generator.py     # Exportação Excel
│   ├── requirements.txt        # Dependências Python
│   └── .env                    # Variáveis de ambiente
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── Toast.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useCustomers.ts
│   │   │   ├── useBudgets.ts
│   │   │   └── useEmailJS.ts
│   │   ├── lib/
│   │   │   ├── supabaseClient.ts
│   │   │   └── api.ts
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Customers.tsx
│   │   │   ├── Budgets.tsx
│   │   │   └── Settings.tsx
│   │   ├── App.tsx             # Componente principal
│   │   ├── main.tsx            # Entry point
│   │   └── index.css           # Estilos globais
│   ├── package.json            # Dependências Node
│   ├── .env.local              # Variáveis de ambiente
│   └── vite.config.ts          # Config Vite
```

---

## 📡 API Endpoints

### Autenticação (Supabase)
```
POST /auth/v1/signup       - Criar conta
POST /auth/v1/token        - Fazer login
POST /auth/v1/logout       - Fazer logout
```

### Clientes
```
GET    /api/customers              - Listar clientes
POST   /api/customers              - Criar cliente
PUT    /api/customers/{id}         - Editar cliente
DELETE /api/customers/{id}         - Deletar cliente
GET    /api/export/customers       - Exportar Excel
```

### Orçamentos
```
GET    /api/budgets                - Listar orçamentos
POST   /api/budgets                - Criar orçamento
PUT    /api/budgets/{id}           - Editar orçamento
DELETE /api/budgets/{id}           - Deletar orçamento
GET    /api/budgets/{id}/pdf       - Download PDF
GET    /api/export/budgets         - Exportar Excel
GET    /api/export/monthly-report  - Relatório mensal
```

---

## 🎯 Funcionalidades Detalhadas

### Login e Autenticação
1. Usuário acessa página de login
2. Cria nova conta ou faz login
3. Token JWT é armazenado no localStorage
4. Token é enviado em todas as requisições
5. Rotas protegidas verificam se usuário está autenticado

### Criar Orçamento
1. Usuário acessa página de Orçamentos
2. Preenche formulário com dados
3. Desconto é calculado automaticamente
4. Ao clicar "Criar":
   - Orçamento é salvo no backend
   - Email de confirmação é enviado ao cliente
   - Toast de sucesso aparece
   - Tabela é atualizada

### Gerar PDF
1. Usuário clica em 📄 na linha do orçamento
2. Backend gera PDF com dados do orçamento
3. PDF é baixado automaticamente
4. Toast de sucesso aparece

### Enviar Email de Aprovação
1. Usuário edita orçamento e muda status
2. Clica em 👌 para enviar email
3. EmailJS envia email ao cliente
4. Toast de sucesso aparece
5. Cliente recebe email com novo status

---

## 🐛 Troubleshooting

### Erro 401 no Login
**Problema:** "HTTP 401: Unauthorized"
**Solução:**
- Verifique se está usando a chave **anon public** do Supabase (não a Service Role Secret)
- Confirme que `.env.local` tem a chave correta
- Reinicie o servidor frontend

### Email não está sendo enviado
**Problema:** "EmailJS não está configurado"
**Solução:**
- Verifique variáveis em `.env.local`
- Confirme que SERVICE_ID, TEMPLATE_ID e PUBLIC_KEY estão corretos
- Teste em https://dashboard.emailjs.com se o template está ativo

### PDF não está baixando
**Problema:** "Erro ao gerar PDF"
**Solução:**
- Certifique-se que backend está rodando em `http://localhost:8000`
- Verifique se cliente está associado ao orçamento
- Abra console (F12) para ver erro específico

### ToastContainer não aparece
**Problema:** Notificações não aparecem no canto superior direito
**Solução:**
- Verifique se `ToastContainer` está em `App.tsx`
- Abra console para ver se há erros
- Recarregue a página (F5)

### Rotas protegidas não funcionam
**Problema:** Consegue acessar páginas sem fazer login
**Solução:**
- Verifique se `ProtectedRoute` está em `App.tsx`
- Confirme que localStorage tem `access_token`
- Teste fazer logout e tentar acessar diretamente

### Dashboard sem dados
**Problema:** Gráficos vazios mesmo com orçamentos criados
**Solução:**
- Crie pelo menos um orçamento
- Recarregue a página (F5)
- Abra console para ver se há erros nas requisições
- Verifique se `useBudgets` está funcionando

---

## 📚 Tecnologias Utilizadas

### Backend
- **FastAPI** - Framework web Python
- **SQLAlchemy** - ORM
- **Supabase** - Autenticação e banco de dados
- **ReportLab** - Geração de PDF
- **OpenPyXL** - Exportação Excel
- **EmailJS/Resend** - Envio de emails

### Frontend
- **React 19** - Interface
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **React Router** - Navegação
- **Recharts** - Gráficos
- **Supabase JS** - Cliente Supabase
- **EmailJS** - Envio de emails

---

## 📖 Documentação Adicional

- [Supabase Docs](https://supabase.com/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)

---

## 📝 Licença

Este projeto é de código aberto e disponível sob a licença MIT.

---

## 👨‍💻 Autor

Desenvolvido por **[Seu Nome/Empresa]**

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para abrir issues ou pull requests.

---

## 📞 Suporte

Se encontrar problemas, abra uma **issue** no repositório ou entre em contato via email.

---

**Feito com ❤️ para marcenarias** 🪵
