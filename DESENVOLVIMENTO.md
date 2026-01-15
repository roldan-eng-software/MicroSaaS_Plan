# 📚 Guia de Desenvolvimento - MicroSaaS Marcenaria MDF

## Índice
1. [Arquitetura do Sistema](#arquitetura)
2. [Backend - FastAPI](#backend)
3. [Frontend - React](#frontend)
4. [Comunicação API](#api)
5. [Próximos Passos](#próximos-passos)

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  http://localhost:5173                                  │
│  ├─ App.tsx (Dashboard)                                 │
│  ├─ Tabela Clientes                                     │
│  └─ Tabela Orçamentos                                   │
└──────────────────┬──────────────────────────────────────┘
                   │ Fetch API (HTTP)
                   ↓
┌─────────────────────────────────────────────────────────┐
│              Backend (FastAPI + Python)                  │
│  http://localhost:8000                                  │
│  ├─ GET  /api/customers     → Listar clientes          │
│  ├─ POST /api/customers     → Criar cliente            │
│  ├─ GET  /api/budgets       → Listar orçamentos        │
│  └─ POST /api/budgets       → Criar orçamento          │
└──────────────────┬──────────────────────────────────────┘
                   │ Dados em Memória
                   ↓
              customers_db: []
              budgets_db: []
```

---

## Backend - FastAPI

### Estrutura do main.py

```python
# 1. Imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 2. App instance
app = FastAPI()

# 3. CORS Config (permite frontend acessar)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"])

# 4. Modelos Pydantic (validação)
class Customer(BaseModel):
    id: str
    name: str
    email: str | None = None

# 5. Dados em memória
customers_db: List[dict] = []

# 6. Endpoints
@app.get("/api/customers")
async def list_customers():
    return customers_db

@app.post("/api/customers")
async def create_customer(customer: dict):
    customer["id"] = str(len(customers_db) + 1)
    customers_db.append(customer)
    return customer
```

### Como Adicionar Novo Endpoint

```python
# Exemplo: Deletar cliente
@app.delete("/api/customers/{customer_id}")
async def delete_customer(customer_id: str):
    global customers_db
    customers_db = [c for c in customers_db if c["id"] != customer_id]
    return {"message": "Cliente deletado"}

# Exemplo: Atualizar cliente
@app.put("/api/customers/{customer_id}")
async def update_customer(customer_id: str, customer: dict):
    for i, c in enumerate(customers_db):
        if c["id"] == customer_id:
            customers_db[i] = {**c, **customer}
            return customers_db[i]
    return {"error": "Cliente não encontrado"}
```

---

## Frontend - React

### Fluxo de Dados

```
Estado (useState)
    ↓
[customers] → fetch API → Tabela
    ↓
Clique "Novo Cliente" → fetch POST → Atualiza estado
```

### Estrutura App.tsx

```typescript
// 1. State
const [customers, setCustomers] = useState<Customer[]>([]);
const [loading, setLoading] = useState(false);

// 2. Fetch dados
useEffect(() => {
    loadData();
}, []);

const loadData = async () => {
    const res = await fetch("http://localhost:8000/api/customers");
    setCustomers(await res.json());
};

// 3. Criar
const handleCreate = async (name: string) => {
    await fetch("http://localhost:8000/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: "" })
    });
    loadData(); // Recarrega lista
};

// 4. Render
return (
    <div>
        <button onClick={() => handleCreate("Novo")}>Criar</button>
        {customers.map(c => <div key={c.id}>{c.name}</div>)}
    </div>
);
```

---

## API - Comunicação

### Request / Response

**GET Clientes**:
```
REQUEST:
GET http://localhost:8000/api/customers

RESPONSE (200 OK):
[
  { "id": "1", "name": "João Silva", "email": "joao@test.com" },
  { "id": "2", "name": "Maria Santos", "email": "maria@test.com" }
]
```

**POST Criar Cliente**:
```
REQUEST:
POST http://localhost:8000/api/customers
Content-Type: application/json

{
  "name": "Ana Costa",
  "email": "ana@test.com",
  "phone": "(11) 99999-9999"
}

RESPONSE (200 OK):
{
  "id": "3",
  "name": "Ana Costa",
  "email": "ana@test.com",
  "phone": "(11) 99999-9999"
}
```

### Debugging API

**Ver requisições no navegador**:
1. F12 → Network tab
2. Clique em "Novo Cliente"
3. Procure por POST `/api/customers`
4. Veja Request e Response

**Testar com curl**:
```bash
# GET
curl http://localhost:8000/api/customers

# POST
curl -X POST http://localhost:8000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
```

---

## Próximos Passos

### 1. Adicionar Edição/Deleção

**Backend**:
```python
@app.delete("/api/customers/{id}")
@app.put("/api/customers/{id}")
```

**Frontend**:
```typescript
const handleDelete = (id: string) => {
    fetch(`http://localhost:8000/api/customers/${id}`, {
        method: "DELETE"
    }).then(() => loadData());
};
```

### 2. Validação de Dados

```python
from pydantic import BaseModel, EmailStr

class Customer(BaseModel):
    name: str  # Obrigatório
    email: EmailStr  # Valida email
    phone: str | None = None  # Opcional
```

### 3. Banco de Dados

```python
# Trocar dados_db por SQLAlchemy
from sqlalchemy.orm import Session
from database import get_db

@app.post("/api/customers")
async def create_customer(customer: Customer, db: Session = Depends(get_db)):
    db_customer = CustomerDB(**customer.dict())
    db.add(db_customer)
    db.commit()
    return customer
```

---

## Dicas Importantes

✅ **Sempre teste após editar**:
- Backend: Veja se tem erro no terminal
- Frontend: Verifique F12 > Console

✅ **Reinicie para pegar mudanças**:
- Backend: Ctrl+C, depois `uvicorn main:app --reload`
- Frontend: Ctrl+C, depois `bun run dev`

✅ **CORS é importante**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

**Data**: 15/01/2026  
**Versão**: 1.0 (MVP)
