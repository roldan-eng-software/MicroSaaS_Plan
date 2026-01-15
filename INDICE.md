# 📖 ÍNDICE DE DOCUMENTAÇÃO

## Bem-vindo à Documentação do MicroSaaS Marcenaria MDF!

Aqui você encontra **tudo** que precisa para entender, desenvolver e evoluir o projeto.

---

## 📚 Documentos Disponíveis

### 1. **README.md** - Para Começar ⭐
   - O quê é este projeto?
   - Como instalar?
   - Como rodar?
   - API endpoints
   - **Leia isto primeiro!**

### 2. **DESENVOLVIMENTO.md** - Para Desenvolvedores 💻
   - Arquitetura do sistema
   - Como funciona o backend?
   - Como funciona o frontend?
   - Como comunicam?
   - Como adicionar novos endpoints?
   - Boas práticas

### 3. **TROUBLESHOOTING.md** - Para Resolver Problemas 🔧
   - Erros mais comuns
   - Causa de cada erro
   - Solução passo-a-passo
   - Debugging tips
   - **Quando algo der errado, vem aqui!**

### 4. **RESUMO.md** - Para Entender a Jornada 🎯
   - O que foi feito
   - Por que foi feito
   - Aprendizados
   - Próximos passos
   - Estatísticas do projeto

---

## 🎯 Por Onde Começar?

### Se você é **Novo no Projeto**:
1. Leia **README.md** (5 min)
2. Execute os comandos de "Como Iniciar"
3. Abra http://localhost:5173
4. Teste criar um cliente

### Se você é **Desenvolvedor**:
1. Leia **README.md** (visão geral)
2. Estude **DESENVOLVIMENTO.md** (arquitetura)
3. Explore o código em `backend/main.py` e `frontend/src/App.tsx`
4. Faça uma mudança pequena (teste!)

### Se algo **Deu Errado**:
1. Procure seu erro em **TROUBLESHOOTING.md**
2. Siga a solução
3. Teste novamente
4. Se persistir, releia o README

### Se quer **Melhorar o Projeto**:
1. Leia **RESUMO.md** (roadmap)
2. Escolha uma feature do "Próximos Passos"
3. Implemente
4. Teste
5. Atualize a documentação

---

## 🚀 Guia Rápido

### Iniciar o Projeto (2 min)

**Terminal 1 - Backend**:
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
bun run dev
```

**Navegador**:
```
http://localhost:5173
```

### Testar a API

```bash
# Listar clientes
curl http://localhost:8000/api/customers

# Criar cliente
curl -X POST http://localhost:8000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"João Silva"}'
```

### Fazer Mudança Pequena

1. Edite `backend/main.py` ou `frontend/src/App.tsx`
2. Salve (auto-reload)
3. Abra http://localhost:5173
4. Veja a mudança

---

## 🗂️ Estrutura de Arquivos

```
MicroSaaS_Plan/
│
├── 📖 README.md              ← COMECE AQUI
├── 💻 DESENVOLVIMENTO.md     ← Para devs
├── 🔧 TROUBLESHOOTING.md    ← Problemas
├── 🎯 RESUMO.md             ← Jornada
├── 📚 INDICE.md             ← Este arquivo
│
├── backend/
│   ├── venv/
│   ├── main.py              ← API (500 linhas)
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── App.tsx          ← Dashboard (400 linhas)
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    ├── vite.config.ts
    └── bun.lockb
```

---

## 💡 Perguntas Frequentes

### P: Posso rodar isto no Windows?
**R**: Sim! Use WSL2 (Windows Subsystem for Linux 2). Siga o README.

### P: Preciso de PostgreSQL agora?
**R**: Não. O MVP usa dados em memória. PostgreSQL é para Fase 3.

### P: Como faço deploy?
**R**: Veja RESUMO.md > Fase 6. Recomendado: Vercel + Railway.

### P: Posso adicionar mais endpoints?
**R**: Sim! Veja DESENVOLVIMENTO.md > "Como Adicionar Novo Endpoint".

### P: Devo usar TypeScript no backend também?
**R**: Não necessário agora. Python é melhor para FastAPI.

---

## 🎓 Mapa de Aprendizado

```
Iniciante
    ↓
[Leia README.md]
    ↓
Básico
    ↓
[Execute: bun run dev + uvicorn]
    ↓
Intermediário
    ↓
[Leia DESENVOLVIMENTO.md]
    ↓
[Modifique App.tsx ou main.py]
    ↓
Avançado
    ↓
[Implemente feature nova]
    ↓
[Leia TROUBLESHOOTING quando necessário]
    ↓
Expert
```

---

## 📊 Documentação Statistics

| Documento | Linhas | Tópicos | Tempo Leitura |
|-----------|--------|---------|---------------|
| README.md | 300+ | 12 | 15 min |
| DESENVOLVIMENTO.md | 250+ | 8 | 20 min |
| TROUBLESHOOTING.md | 350+ | 15 | 30 min |
| RESUMO.md | 280+ | 20 | 25 min |
| **Total** | **1,180+** | **55+** | **90 min** |

---

## ✅ Checklist de Onboarding

- [ ] Leu README.md
- [ ] Rodou `cd backend && uvicorn main:app --reload`
- [ ] Rodou `cd frontend && bun run dev`
- [ ] Abriu http://localhost:5173
- [ ] Testou criar um cliente
- [ ] Testou criar um orçamento
- [ ] Leu DESENVOLVIMENTO.md
- [ ] Explorou `backend/main.py`
- [ ] Explorou `frontend/src/App.tsx`
- [ ] Bookmarked TROUBLESHOOTING.md

---

## 🔗 Links Úteis

**Documentação Oficial**:
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Bun](https://bun.sh/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

**Next Steps**:
- [Supabase PostgreSQL](https://supabase.com/docs)
- [Vercel Deploy](https://vercel.com/docs)
- [Railway Backend](https://railway.app/docs)

---

## 📞 Suporte

Problema não documentado?

1. Procure em **TROUBLESHOOTING.md**
2. Procure em **DESENVOLVIMENTO.md**
3. Procure na documentação oficial do FastAPI/React
4. Teste com `curl` (backend) ou F12 (frontend)

---

## 📝 Próxima Leitura

**Para começar agora**: `README.md`  
**Para entender profundo**: `DESENVOLVIMENTO.md`  
**Para sair dos problemas**: `TROUBLESHOOTING.md`  
**Para context**: `RESUMO.md`

---

**Versão**: 1.0  
**Data**: 15/01/2026  
**Status**: ✅ Completo
