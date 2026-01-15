# 📤 Guia de Deploy no Git

## ✅ Pré-requisitos

Antes de fazer upload, verifique:

```bash
# 1. Git está instalado?
git --version

# 2. Você está na pasta raiz do projeto?
pwd
# Esperado: .../MicroSaaS_Plan

# 3. Já é um repositório git?
git status
# Se sim: mostra branch + arquivos
# Se não: erro "not a git repository"
```

---

## 🚀 Se Ainda Não É Repositório Git

### Passo 1: Inicializar Git

```bash
# Na pasta raiz (MicroSaaS_Plan)
git init
```

**Resultado**:
```
Initialized empty Git repository in /home/devpython/Roldan-Eng-Software/MicroSaaS_Plan/.git/
```

### Passo 2: Adicionar Remote (GitHub/GitLab)

```bash
# Copie a URL do repositório que você criou no GitHub
git remote add origin https://github.com/seu-usuario/MicroSaaS_Plan.git

# Verificar
git remote -v
```

**Resultado esperado**:
```
origin  https://github.com/seu-usuario/MicroSaaS_Plan.git (fetch)
origin  https://github.com/seu-usuario/MicroSaaS_Plan.git (push)
```

---

## 📝 Fazer o Commit

### Passo 1: Verificar Arquivos

```bash
git status
```

**Resultado esperado**:
```
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        .gitignore
        README.md
        DESENVOLVIMENTO.md
        TROUBLESHOOTING.md
        RESUMO.md
        INDICE.md
        backend/
        frontend/

nothing added to commit but untracked files present (tracking will start)
```

### Passo 2: Verificar .gitignore

```bash
# Verificar se arquivos grandes são ignorados
git status --ignored
```

**Deve ignorar**:
- `backend/venv/` ✅
- `frontend/node_modules/` ✅
- `frontend/bun.lockb` ✅
- `__pycache__/` ✅
- `.env` ✅

### Passo 3: Adicionar Todos os Arquivos

```bash
# Adicionar TUDO (exceto .gitignore)
git add .

# Ou selecionar manualmente
git add README.md DESENVOLVIMENTO.md TROUBLESHOOTING.md RESUMO.md INDICE.md .gitignore
git add backend/main.py backend/requirements.txt
git add frontend/src frontend/package.json frontend/vite.config.ts
```

### Passo 4: Commit Inicial

```bash
git commit -m "initial: MVP Marcenaria MDF - Backend + Frontend + Docs"
```

**Resultado esperado**:
```
[main (root-commit) abc1234] initial: MVP Marcenaria MDF
 15 files changed, 2500 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 README.md
 create mode 100644 DESENVOLVIMENTO.md
 ...
```

### Passo 5: Push para GitHub

```bash
# Se for primeira vez
git push -u origin main

# Próximas vezes
git push
```

**Resultado esperado**:
```
Enumerating objects: 20, done.
Counting objects: 100% (20/20), done.
...
To https://github.com/seu-usuario/MicroSaaS_Plan.git
 * [new branch]      main -> main
Branch 'main' is set up to track remote branch 'main' from 'origin'.
```

---

## ✅ Verificar no GitHub

1. Abra https://github.com/seu-usuario/MicroSaaS_Plan
2. Você deve ver:
   - ✅ README.md (com instrução de como rodar)
   - ✅ Pasta `backend/`
   - ✅ Pasta `frontend/`
   - ✅ Arquivos de documentação
   - ✅ `.gitignore`

3. **NÃO deve ver**:
   - ❌ `backend/venv/`
   - ❌ `frontend/node_modules/`
   - ❌ `__pycache__/`
   - ❌ `.env`

---

## 🔄 Commits Futuros

Depois do commit inicial, para fazer mudanças:

```bash
# 1. Ver status
git status

# 2. Adicionar mudanças
git add .

# 3. Commit
git commit -m "feat: adicionar rota de orçamentos"

# 4. Push
git push
```

---

## 📋 Convenção de Commits

Use esta convenção para commits legíveis:

```bash
# Feature nova
git commit -m "feat: adicionar autenticação JWT"

# Bug fix
git commit -m "fix: corrigir CORS error no backend"

# Documentação
git commit -m "docs: atualizar README com instrução de deploy"

# Refactor (mudança sem nova feature)
git commit -m "refactor: reorganizar endpoints em routers"

# Performance
git commit -m "perf: otimizar query de clientes"

# Test (testes)
git commit -m "test: adicionar testes unitários"
```

---

## ⚠️ Cuidado: Não Commitar Dados Sensíveis

**NUNCA commitar**:
```
.env (com senhas/keys)
config.local.py
*.key
*.pem
```

**O .gitignore cuida disso**, mas verifique sempre:

```bash
git status
# Se ver .env ou .env.local aqui, NÃO faça push!
```

---

## 🆘 Se Algo Deu Errado

### Desfazer último commit (antes de push)

```bash
git reset --soft HEAD~1
# Arquivos voltam para "staged"
# Depois git commit novamente
```

### Remover arquivo já commitado

```bash
git rm --cached arquivo.txt
git commit -m "remove: arquivo desnecessário"
git push
```

### Ver histórico de commits

```bash
git log --oneline
```

---

## 📊 Status Final Esperado

Após tudo pronto:

```bash
$ git status
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

---

## 🎯 Próximas Features (Commit Messages)

```bash
# Quando tiver PostgreSQL
git commit -m "feat: integrar PostgreSQL com Supabase"

# Quando tiver autenticação
git commit -m "feat: adicionar login JWT"

# Quando tiver React Router
git commit -m "feat: adicionar rotas com React Router"

# Quando for para produção
git commit -m "chore: preparar para produção"
```

---

**Data**: 15/01/2026  
**Status**: ✅ Pronto para Git
