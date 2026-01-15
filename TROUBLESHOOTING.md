# 🔧 Troubleshooting - Guia de Erros Comuns

## Índice
1. [Erros Backend (Python)](#backend)
2. [Erros Frontend (Node/React)](#frontend)
3. [Erros de Comunicação](#comunicação)
4. [Erros de Ambiente](#ambiente)

---

## Backend

### ❌ ModuleNotFoundError: No module named 'fastapi'

**Sintoma**:
```
File "/home/devpython/Roldan-Eng-Software/MicroSaaS_Plan/backend/main.py", line 1, in <module>
    from fastapi import FastAPI
ModuleNotFoundError: No module named 'fastapi'
```

**Causa**: FastAPI não instalado no venv

**Solução**:
```bash
cd backend
source venv/bin/activate
pip install fastapi uvicorn[standard] python-multipart pydantic
```

**Prevenção**: Sempre rode `pip install -r requirements.txt` após clonar o projeto.

---

### ❌ ModuleNotFoundError: No module named 'sqlalchemy'

**Sintoma**:
```
File "/home/devpython/Roldan-Eng-Software/MicroSaaS_Plan/backend/main.py", line 5, in <module>
    from sqlalchemy.orm import Session
ModuleNotFoundError: No module named 'sqlalchemy'
```

**Causa**: Você editou main.py com imports de SQLAlchemy, mas não instalou

**Solução 1** (Instalar):
```bash
pip install sqlalchemy psycopg[binary]
```

**Solução 2** (Reverter para versão simples):
Use o `main.py` sem SQLAlchemy (dados em memória)

---

### ❌ CORS Error no Console do Navegador

**Sintoma**:
```
Access to XMLHttpRequest at 'http://localhost:8000/api/customers' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Causa**: Backend não tem CORS configurado ou URL errada

**Solução**:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Verificar**:
- Backend rodando em `http://localhost:8000`? ✓
- Frontend rodando em `http://localhost:5173`? ✓
- Uvicorn mostra "Application startup complete"? ✓

---

### ❌ Port 8000 Já Está em Uso

**Sintoma**:
```
OSError: [Errno 98] Address already in use
```

**Causa**: Outro processo usando porta 8000

**Solução**:
```bash
# Matar processo na porta 8000
lsof -ti:8000 | xargs kill -9

# Ou usar porta diferente
uvicorn main:app --reload --port 8001
```

---

### ❌ Uvicorn Travado em "Waiting for application startup"

**Sintoma**:
```
INFO:     Application startup complete.
(nada acontece por 30 segundos)
```

**Causa**: Às vezes há delay ou import pesado

**Solução**:
1. Aguarde 3-5 segundos
2. Se persistir, Ctrl+C e reinicie
3. Verifique se há `time.sleep()` ou imports pesados

---

## Frontend

### ❌ 404 em http://localhost:5173

**Sintoma**:
```
Cannot GET /
```

**Causa**: Frontend não iniciou

**Verificar**:
```bash
cd frontend
bun run dev
```

Espere pela mensagem:
```
Local:   http://localhost:5173
```

---

### ❌ "Cannot find module 'react-router-dom'"

**Sintoma**:
```
Error: Cannot find module 'react-router-dom' 
```

**Causa**: Dependência não instalada

**Solução**:
```bash
cd frontend
bun add react-router-dom
```

---

### ❌ Vite Erro: "Failed to resolve import"

**Sintoma**:
```
[vite] ✘ [plugin:vite:import-analysis] Failed to resolve import 
"./components/Header" from "/frontend/src/App.tsx"
```

**Causa**: Arquivo não existe ou caminho errado

**Solução**:
```bash
# Verificar se arquivo existe
ls -la frontend/src/components/Header.tsx

# Se não existe, criar:
touch frontend/src/components/Header.tsx
```

---

### ❌ Dados não aparecem na tabela

**Sintoma**:
```
"Nenhum cliente registrado"
```

**Causa**: API retorna erro ou lista vazia

**Debug**:
```
1. F12 → Console
2. Procure por mensagens de erro
3. F12 → Network tab
4. Verifique requisição GET /api/customers
5. Ver Response (deve ser array [])
```

---

### ❌ Clique em "Novo Cliente" não funciona

**Sintoma**:
Clica no botão mas nada acontece

**Debug**:
```
1. F12 → Console (tem erro?)
2. F12 → Network (POST foi feito?)
3. Verifique backend (rodando?)
4. Teste curl:
   curl -X POST http://localhost:8000/api/customers \
     -H "Content-Type: application/json" \
     -d '{"name":"Test"}'
```

---

## Comunicação

### ❌ Frontend chama Backend mas retorna 500

**Sintoma**:
```
POST http://localhost:8000/api/customers  500 Internal Server Error
```

**Causa**: Erro no backend

**Debug**:
1. Verifique terminal do backend
2. Deve haver erro/traceback
3. Corrija e reinicie

---

### ❌ POST funciona mas GET retorna vazio

**Sintoma**:
```
POST: {"id":"1", "name":"João", ...} ✓
GET: [] ✗
```

**Causa**: Dados não foram salvos

**Verificar**:
```python
# No backend, verifique:
customers_db = []  # Está sendo populado?

# Adicione debug:
@app.post("/api/customers")
async def create_customer(customer: dict):
    print(f"Recebido: {customer}")  # Debug
    customers_db.append(customer)
    print(f"Total agora: {customers_db}")  # Debug
    return customer
```

---

### ❌ Dados desaparecem ao reiniciar

**Sintoma**:
Criei 5 clientes → Reiniciei backend → Dados perdidos

**Causa**: Dados em memória (esperado no MVP)

**Próximo passo**: Usar PostgreSQL/Supabase

---

## Ambiente

### ❌ Python 3.14 "muito novo"

**Sintoma**:
```
error: the configured Python interpreter version (3.14) is newer 
than PyO3's maximum supported version (3.13)
```

**Causa**: Algumas libs não suportam Python 3.14

**Solução 1** (Downgrade Python):
```bash
# Se tiver Python 3.11 ou 3.13 instalado
python3.11 -m venv venv
source venv/bin/activate
```

**Solução 2** (Esperar updates):
Libs como pydantic-core estão adicionando suporte

---

### ❌ Bun: "command not found"

**Sintoma**:
```
bun: command not found
```

**Causa**: Bun não instalado

**Solução**:
```bash
# Linux/Mac
curl -fsSL https://bun.sh/install | bash

# Ou via npm
npm install -g bun

# Verificar
bun --version
```

---

### ❌ Venv ativo mas Python errado

**Sintoma**:
```bash
(venv) $ python --version
Python 3.11
```

Mas você precisa 3.14

**Solução**:
```bash
# Deletar venv e recriar com Python correto
rm -rf venv
python3.14 -m venv venv
source venv/bin/activate
python --version  # Agora deve ser 3.14
```

---

## Checklist de Verificação

Quando algo não funciona, execute isto em ordem:

```bash
# 1. Verifique Backend
curl http://localhost:8000/
# Esperado: {"message":"..."}

# 2. Verifique Frontend
open http://localhost:5173
# Esperado: Dashboard carrega

# 3. Verifique CORS
curl -X POST http://localhost:8000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@t.com"}'
# Esperado: {"id":"...", "name":"Test", ...}

# 4. Verifique GET
curl http://localhost:8000/api/customers
# Esperado: [{"id":"...", "name":"Test", ...}]

# 5. Verifique Frontend lista
# Abra http://localhost:5173
# Clique "Atualizar"
# Deve aparecer "Test"
```

---

## Contato e Suporte

Documentações oficiais:
- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **Bun**: https://bun.sh/docs
- **Vite**: https://vitejs.dev/

---

**Data**: 15/01/2026  
**Versão**: 1.0
