# 🪵 Contexto do Projeto - Roldan Marcenaria SaaS

## 📋 Resumo do Projeto

Sistema SaaS para gestão de orçamentos e clientes para negócio de marcenaria/carpintaria. 
- **Frontend**: React + TypeScript (Vite)
- **Backend**: FastAPI + Python
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth (JWT)
- **Hospedagem**: Vercel (frontend), Render/Railway (backend)

---

## ✅ Status Atual (19/01/2026)

### ✨ Funcionalidades Implementadas
- ✅ Autenticação com Supabase
- ✅ CRUD de Clientes (Customers)
- ✅ CRUD de Orçamentos (Budgets)
- ✅ Cálculo automático do Total Final (Subtotal - Desconto)
- ✅ Exportação de dados (Excel/PDF)
- ✅ Integração WhatsApp
- ✅ Validação CPF/CNPJ
- ✅ RLS (Row Level Security) no banco

### 🔧 Banco de Dados - Estrutura Reconstruída

**Tabelas Criadas (19/01/2026):**

```
📦 customers
├── id (UUID, PK)
├── user_id (VARCHAR 255) - FK para auth
├── name, cep, endereco, numero, complemento
├── bairro, cidade, estado
├── telefone, email
├── cpf_cnpj, tipo_pessoa, detalhes
└── timestamps

📦 budgets
├── id (UUID, PK)
├── user_id (VARCHAR 255) - FK para auth
├── title, budget_number
├── customer_id (UUID, FK) → customers
├── project_name, project_details
├── validity, delivery_deadline
├── subtotal_amount, discount_percent, discount_amount
├── discount_type, final_amount
├── payment_conditions, payment_methods
├── drawing_url (armazena URLs de desenhos)
├── observations, status
└── timestamps
```

**Índices Criados:**
- `idx_customers_user_id` - Filtro por usuário
- `idx_customers_email` - Busca por email
- `idx_customers_cpf_cnpj` - Validação de documento
- `idx_budgets_user_id` - Filtro por usuário
- `idx_budgets_customer_id` - Relação com cliente
- `idx_budgets_status` - Filtro por status
- `idx_budgets_budget_number` - Busca por número

---

## 🎯 Próximas Tarefas

### 1️⃣ Melhorias Imediatas (Priority: HIGH)
- [ ] Upload de arquivos (desenhos/imagens) para campos `drawing_url`
- [ ] Adição de campos faltantes no formulário de orçamento
- [ ] Validação de campos obrigatórios
- [ ] Editar orçamento completo (todos os campos)

### 2️⃣ Features de Produto (Priority: MEDIUM)
- [ ] Histórico de versões de orçamentos
- [ ] Status mais granulares (rascunho, enviado, aprovado, recusado)
- [ ] Modelos de orçamento salvos
- [ ] Duplicação de orçamentos existentes
- [ ] Busca e filtros avançados

### 3️⃣ Melhorias UX/UI (Priority: MEDIUM)
- [ ] Dashboard com métricas (total orçado, taxa de conversão)
- [ ] Relatórios mensais/anuais
- [ ] Notificações de ações importantes
- [ ] Interface mobile-responsive melhorada
- [ ] Dark mode

### 4️⃣ Integrações (Priority: LOW)
- [ ] Integração com sistemas de pagamento
- [ ] Sincronização com planilhas Google
- [ ] API pública para parceiros

---

## 📁 Estrutura de Arquivos

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Budgets.tsx      ← Página principal de orçamentos
│   │   ├── Customers.tsx    ← Gestão de clientes
│   │   └── ...
│   ├── hooks/
│   │   ├── useBudgets.ts    ← Lógica de orçamentos
│   │   ├── useCustomers.ts  ← Lógica de clientes
│   │   └── ...
│   └── lib/
│       └── api.ts           ← Cliente HTTP autenticado

backend/
├── main.py                  ← FastAPI principal
├── pdf_generator.py         ← Geração de PDFs
├── export_generator.py      ← Exportação Excel
├── whatsapp_service.py      ← Integração WhatsApp
└── requirements.txt
```

---

## 🔐 Autenticação & Segurança

**Token JWT (Supabase Auth):**
- Extraído do header `Authorization: Bearer <token>`
- Decodificado manualmente no backend (extrai `sub` = user_id)
- Usado para filtrar dados por usuário em todas as queries

**RLS Policies:**
- SELECT: `auth.uid()::text = user_id`
- INSERT: `auth.uid()::text = user_id`
- UPDATE: `auth.uid()::text = user_id`
- DELETE: `auth.uid()::text = user_id`

---

## 📝 Endpoints Principais

### Clientes
```
GET    /api/customers              - Listar clientes
POST   /api/customers              - Criar cliente
PUT    /api/customers/{id}         - Atualizar cliente
DELETE /api/customers/{id}         - Deletar cliente
```

### Orçamentos
```
GET    /api/budgets                - Listar orçamentos
POST   /api/budgets                - Criar orçamento
PUT    /api/budgets/{id}           - Atualizar orçamento
DELETE /api/budgets/{id}           - Deletar orçamento
GET    /api/budgets/{id}/pdf       - Download PDF
GET    /api/budgets/{id}/whatsapp  - Gerar link WhatsApp
```

### Exportação
```
GET    /api/export/customers       - Exportar clientes (Excel)
GET    /api/export/budgets         - Exportar orçamentos (Excel)
GET    /api/export/monthly-report  - Relatório mensal (Excel)
```

---

## 🚀 Como Continuar o Desenvolvimento

### Setup Inicial
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate no Windows
pip install -r requirements.txt
python main.py

# Frontend
cd frontend
npm install
npm run dev
```

### Variáveis de Ambiente

**Backend (.env):**
```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_supabase
```

**Frontend (.env):**
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_publica
```

### Testando a Autenticação
1. Faça login no frontend (Firebase/Supabase)
2. Token é armazenado automaticamente
3. Requisições ao backend levam o token no header
4. Backend extrai `user_id` e filtra dados

---

## 🐛 Issues Resolvidos Recentemente

**19/01/2026:**
- ❌ Campo `user_id` não estava na tabela `budgets` → CORRIGIDO
- ❌ `LONGTEXT` não existe em PostgreSQL → Mudado para `TEXT`
- ❌ Banco corrompido com múltiplas versões → RECONSTRUÍDO do zero
- ✅ Todas as tabelas recriadas com RLS ativado
- ✅ Sistema funcionando normalmente

---

## 💡 Dicas para Próximas Sessões

1. **Antes de fazer mudanças no DB:**
   - Sempre faça backup ou esteja pronto para reconstruir
   - Teste as migrations em dev antes de prod

2. **Para adicionar novos campos:**
   - Atualize o schema SQL no Supabase
   - Atualize o Pydantic model no backend
   - Atualize a interface TypeScript no frontend
   - Teste o fluxo completo

3. **Para debugar:**
   - Check console do navegador (frontend logs)
   - Check terminal do backend (Python logs)
   - Check Database no Supabase (dados reais)

4. **Commits recomendados:**
   - Feature: "feat: adicionar upload de desenhos"
   - Fix: "fix: validação de campos obrigatórios"
   - Docs: "docs: atualizar schema do banco"

---

## 📞 Contatos/Recursos

- **Supabase Docs:** https://supabase.com/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **React Docs:** https://react.dev
- **Seu Projeto Supabase:** https://app.supabase.com

---

**Projeto Status:** 🟢 Ativo e Funcional  
**Última Atualização:** 19/01/2026 14:58 -03  
**Desenvolvedor:** Roldan Eng Software  
**Stack:** Python/FastAPI + React + Supabase