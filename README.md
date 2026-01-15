# 🪵 MicroSaaS Marcenaria MDF

**Plataforma de Gestão de Orçamentos e Pedidos para Marcenarias de Móveis Planejados**

## 📋 Visão Geral

Sistema web completo (Full-Stack) desenvolvido para marcenarias de móveis planejados em MDF, permitindo:
- ✅ Gestão de clientes
- ✅ Criação e acompanhamento de orçamentos
- ✅ Cálculo automático de descontos
- ✅ Dashboard com estatísticas

**Status**: MVP Funcional ✅ (15/01/2026)

---

## 🛠️ Stack Técnico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Backend** | FastAPI | 0.104.1 |
| **Frontend** | React + TypeScript | 18.x |
| **Build Tool** | Vite + Bun | 7.3 / 1.2 |
| **Banco de Dados** | Em Memória (MVP) | - |
| **Linguagem Backend** | Python | 3.14 |
| **OS Desenvolvimento** | Fedora Linux | 40+ |

---

## 📦 Estrutura de Pastas

```
MicroSaaS_Plan/
├── backend/
│   ├── venv/                 # Ambiente virtual Python
│   ├── main.py              # Aplicação FastAPI
│   └── requirements.txt      # Dependências Python
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx         # Componente principal
│   │   ├── main.tsx        # Entrada
│   │   ├── index.css       # Estilos globais
│   │   └── assets/
│   ├── package.json        # Dependências Node
│   ├── bun.lockb           # Lock file Bun
│   └── vite.config.ts      # Config Vite
│
└── README.md              # Este arquivo
```

---

## 🚀 Como Iniciar

### Pré-requisitos
- Python 3.14+ instalado
- Bun 1.0+ instalado
- Terminal Linux/Mac (ou WSL no Windows)

### 1️⃣ Backend (Terminal 1)

```bash
# Entrar na pasta backend
cd backend

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências (se necessário)
pip install fastapi uvicorn[standard] python-multipart pydantic

# Iniciar servidor
uvicorn main:app --reload --port 8000
```

**Resultado esperado**:
```
INFO: Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

### 2️⃣ Frontend (Terminal 2)

```bash
# Entrar na pasta frontend
cd frontend

# Instalar dependências
bun install

# Iniciar dev server
bun run dev
```

**Resultado esperado**:
```
Local:   http://localhost:5173
```

### 3️⃣ Acessar a Aplicação

Abra no navegador: **http://localhost:5173**

---

## 📡 API Endpoints

### Clientes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/customers` | Listar todos os clientes |
| `POST` | `/api/customers` | Criar novo cliente |

**Exemplo POST**:
```bash
curl -X POST http://localhost:8000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "(11) 99999-9999"
  }'
```

### Orçamentos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/budgets` | Listar todos os orçamentos |
| `POST` | `/api/budgets` | Criar novo orçamento |

**Exemplo POST**:
```bash
curl -X POST http://localhost:8000/api/budgets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cozinha Planejada",
    "customer_id": "1",
    "subtotal_amount": 5000.00,
    "discount_percent": 10,
    "final_amount": 4500.00,
    "status": "draft"
  }'
```

---

## 💾 Dados Persistência

**Versão Atual**: Dados em **memória (RAM)**
- ✅ Rápido para desenvolvimento
- ✅ Sem necessidade de banco
- ❌ Dados perdidos ao reiniciar

**Próximas versões**: PostgreSQL/Supabase

---

## 🎨 Features Implementados

✅ Dashboard com cards de estatísticas
✅ Tabela de clientes com criação via prompt
✅ Tabela de orçamentos com cálculo automático
✅ Botão "Atualizar" para recarregar dados
✅ Interface dark mode responsiva
✅ CORS configurado para comunicação frontend/backend

---

## 🧪 Testes Manuais

### Teste 1: Criar Cliente

```bash
# 1. No terminal 3, execute:
curl -X POST http://localhost:8000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Silva","email":"maria@test.com"}'

# 2. Abra http://localhost:5173
# 3. Clique "Atualizar"
# 4. Novo cliente deve aparecer na tabela
```

### Teste 2: Criar Orçamento

```bash
# 1. No frontend, clique "Novo Orçamento"
# 2. Digite: "Balcão Cozinha"
# 3. Clique "Atualizar"
# 4. Novo orçamento deve aparecer
```

### Teste 3: Persistência

```bash
# 1. Crie alguns clientes/orçamentos
# 2. No backend, pressione Ctrl+C
# 3. Reinicie: uvicorn main:app --reload --port 8000
# ❌ Dados são perdidos (esperado em MVP)
```

---

## ⚙️ Variáveis de Ambiente

Crie `.env` na pasta `backend/` (opcional para MVP):

```bash
# Supabase (futuro)
DATABASE_URL=postgresql://user:pass@host/db
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=your_key
```

---

## 🐛 Troubleshooting

### Erro: "ModuleNotFoundError: No module named 'fastapi'"

```bash
cd backend
source venv/bin/activate
pip install fastapi uvicorn[standard] python-multipart pydantic
```

### Erro: "CORS error" no console do navegador

**Solução**: Backend tem CORS configurado. Verifique se está rodando em `http://localhost:8000`.

### Frontend carrega lento

```bash
# Limpar cache Vite
cd frontend
rm -rf node_modules
bun install
bun run dev
```

### Backend diz "Application startup complete" mas não funciona

Aguarde 2-3 segundos após a mensagem. Às vezes há delay.

---

## 📊 Roadmap (Próximos Passos)

### Fase 2: Persistência
- [ ] Conectar PostgreSQL/Supabase
- [ ] Migration scripts SQL
- [ ] Backup automático

### Fase 3: Autenticação
- [ ] Login com email/senha
- [ ] JWT tokens
- [ ] Roles (admin, vendedor, cliente)

### Fase 4: Funcionalidades
- [ ] Edição de orçamentos
- [ ] Deletar clientes/orçamentos
- [ ] Geração de PDF
- [ ] Histórico de mudanças

### Fase 5: Design
- [ ] Tailwind CSS
- [ ] Sidebar + Header profissional
- [ ] React Router para múltiplas páginas
- [ ] Temas (light/dark)

### Fase 6: Deploy
- [ ] Vercel (Frontend)
- [ ] Railway/Render (Backend)
- [ ] CI/CD com GitHub Actions
- [ ] Monitoramento e logs

---

## 👨‍💻 Desenvolvimento

### Adicionar Dependência Backend

```bash
cd backend
source venv/bin/activate
pip install nome_package
pip freeze > requirements.txt
```

### Adicionar Dependência Frontend

```bash
cd frontend
bun add nome_package
```

---

## 📞 Suporte

Para dúvidas sobre:
- **Backend**: Consulte FastAPI docs: https://fastapi.tiangolo.com/
- **Frontend**: React docs: https://react.dev/
- **Python 3.14**: Python docs: https://docs.python.org/3.14/

---

## 📝 Licença

Projeto pessoal - Livre para uso e modificação.

---

**Última atualização**: 15 de Janeiro de 2026  
**Status**: ✅ MVP Funcional
