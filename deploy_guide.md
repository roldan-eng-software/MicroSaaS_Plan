# 🚀 Guia de Deploy - Marcenaria MDF

Guia completo para fazer deploy da aplicação em produção.

---

## 📋 Tabela de Conteúdos

- [Deploy do Frontend](#deploy-do-frontend)
- [Deploy do Backend](#deploy-do-backend)
- [Configuração de Produção](#configuração-de-produção)
- [CI/CD](#cicd)

---

## 🌐 Deploy do Frontend

### Opção 1: Vercel (Recomendado)

**Pré-requisitos:**
- Conta no [Vercel](https://vercel.com)
- Repositório no GitHub

**Passo a Passo:**

1. **Conectar GitHub ao Vercel:**
   ```bash
   # No VSCode, faça commit e push
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Criar projeto no Vercel:**
   - Acesse https://vercel.com
   - Clique em **New Project**
   - Selecione seu repositório GitHub
   - Clique em **Import**

3. **Configurar variáveis de ambiente:**
   - Clique em **Settings → Environment Variables**
   - Adicione:
     ```
     VITE_SUPABASE_URL=https://seu-projeto.supabase.co
     VITE_SUPABASE_KEY=sua-chave-publica
     VITE_EMAILJS_SERVICE_ID=service_xxxxx
     VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
     VITE_EMAILJS_PUBLIC_KEY=xxxxx
     VITE_API_URL=https://seu-backend.com/api
     ```

4. **Deploy automático:**
   - Clique em **Deploy**
   - Vercel fará build e deploy automaticamente
   - Seu site estará em: `https://seu-projeto.vercel.app`

5. **Atualizações futuras:**
   - Qualquer push para `main` vai fazer deploy automaticamente

### Opção 2: Netlify

1. Acesse https://netlify.com
2. Clique em **Connect from Git**
3. Selecione repositório GitHub
4. Configure Build:
   - **Build command:** `bun run build` (ou `npm run build`)
   - **Publish directory:** `dist`
5. Adicione Environment Variables (mesmo que Vercel)
6. Clique em **Deploy**

### Opção 3: GitHub Pages

1. Configure `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/nome-do-repo/',
     plugins: [react()],
   })
   ```

2. Crie `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
           with:
             node-version: '18'
         - run: npm install
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

3. Seu site estará em: `https://seu-usuario.github.io/nome-do-repo`

---

## 🔗 Deploy do Backend

### Opção 1: Railway (Mais Fácil)

**Pré-requisitos:**
- Conta no [Railway](https://railway.app)
- Repositório GitHub

**Passo a Passo:**

1. **Conectar GitHub ao Railway:**
   - Acesse https://railway.app
   - Clique em **New Project**
   - Clique em **Deploy from GitHub repo**
   - Selecione seu repositório

2. **Adicionar PostgreSQL:**
   - No dashboard, clique em **+ New**
   - Selecione **Database → PostgreSQL**
   - Será criado automaticamente

3. **Configurar variáveis de ambiente:**
   - Clique na guia **Variables**
   - Adicione:
     ```
     SUPABASE_URL=https://seu-projeto.supabase.co
     SUPABASE_KEY=sua-chave-publica
     DATABASE_URL=postgres://usuario:senha@host:5432/db
     RESEND_API_KEY=sua-chave-resend-opcional
     ```

4. **Configurar porta:**
   - Railway expõe a porta automaticamente
   - Verifique no dashboard qual é a URL

5. **Update CORS:**
   - Em `main.py`, atualize:
     ```python
     allow_origins=["https://seu-frontend.vercel.app"]
     ```

### Opção 2: Heroku (antigo, agora pago)

Railway é melhor agora (Heroku descontinuou free tier).

### Opção 3: AWS/Google Cloud

Mais complexo, mas altamente escalável:
- AWS Elastic Beanstalk
- Google Cloud Run
- Azure App Service

---

## ⚙️ Configuração de Produção

### 1. Variáveis de Ambiente

**Frontend (.env.production):**
```plaintext
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_KEY=sua-chave-publica
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxx
VITE_API_URL=https://seu-backend.railway.app/api
```

**Backend (.env production):**
```plaintext
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-publica
DATABASE_URL=postgresql://usuario:senha@host/db
RESEND_API_KEY=sua-chave
```

### 2. Atualizar CORS

**main.py:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Desenvolvimento
        "https://seu-frontend.vercel.app",  # Produção
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Verificação de Segurança

**Checklist:**
- [ ] `.env` está em `.gitignore`
- [ ] Senhas não estão no código
- [ ] HTTPS está ativado
- [ ] CORS está configurado
- [ ] Chaves da API não estão expostas
- [ ] Database está com backup automático

### 4. Performance

**Frontend:**
```bash
# Build otimizado
bun run build

# Verificar tamanho
ls -lh dist/
# Deve ser < 500KB
```

**Backend:**
```bash
# Usar Gunicorn em produção
pip install gunicorn
gunicorn main:app -w 4 -b 0.0.0.0:8000
```

---

## 🔄 CI/CD

### GitHub Actions (Automático)

Crie `.github/workflows/test-and-deploy.yml`:

```yaml
name: Test and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm run lint
      - run: cd frontend && npm run build

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - run: cd backend && pip install -r requirements.txt
      - run: cd backend && python -m pytest  # Se tiver testes

  deploy:
    needs: [test-frontend, test-backend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying to production..."
      # Aqui você adiciona steps de deploy
```

---

## 📊 Monitoramento

### Logs em Produção

**Railway:**
- Dashboard → Logs (mostra logs em tempo real)

**Vercel:**
- Dashboard → Deployments → Logs

**Backend:**
```bash
# Ver logs localmente
docker logs seu-container

# Ou via SSH
ssh seu-servidor
tail -f /var/log/seu-app.log
```

### Alertas

Configure alertas para:
- ✅ Deploy falhou
- ✅ Erro 5xx
- ✅ CPU > 80%
- ✅ Banco de dados cheio

---

## 🔐 Certificados SSL

**Railway e Vercel:**
- SSL/TLS automático ✅

**Seu servidor:**
```bash
# Usar Let's Encrypt (gratuito)
sudo apt install certbot
sudo certbot certonly --standalone -d seu-dominio.com
```

---

## 📱 Domínio Personalizado

### Vercel
1. Compre domínio (Namecheap, GoDaddy, etc)
2. Vá em **Settings → Domains**
3. Adicione seu domínio
4. Configure DNS conforme instruções

### Railway
1. Vá em **Settings → Custom Domains**
2. Adicione seu domínio
3. Configure DNS (CNAME)

---

## 🆘 Troubleshooting de Deploy

### Erro: "Build failed"
```
# Verifique:
- Node version (18+)
- npm/bun dependencies
- variáveis de ambiente
- TypeScript errors
```

### Erro: "Connection refused"
```
# Verifique:
- Backend está rodando
- URL do backend está correta
- CORS está configurado
- Firewall permite conexão
```

### Erro: "Database connection error"
```
# Verifique:
- DATABASE_URL está correto
- Banco de dados está online
- IP está liberado (se necessário)
- Credenciais corretas
```

---

## ✅ Checklist Final

Antes de fazer deploy:

- [ ] Testes locais funcionam
- [ ] Variáveis de ambiente configuradas
- [ ] CORS atualizado
- [ ] Banco de dados preparado
- [ ] Certificados SSL configurados
- [ ] Domínio apontando para servidor
- [ ] Backup automático configurado
- [ ] Monitoramento ativado
- [ ] Logs configurados
- [ ] Time informado sobre deploy

---

## 📈 Arquitetura Recomendada

```
┌─────────────────────────────────────────────┐
│          Usuário                            │
└──────────────────────┬──────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
   ┌────▼────────────┐      ┌────────▼─────────┐
   │  Frontend        │      │  Backend         │
   │  Vercel          │      │  Railway         │
   │  https://...     │      │  https://...     │
   └────────┬─────────┘      └────────┬─────────┘
            │                         │
            │  Autenticação          │
            └────────────┬───────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
   ┌────▼─────────────┐        ┌────────▼──────┐
   │  Supabase Auth   │        │  PostgreSQL   │
   │  JWT Token       │        │  Railway      │
   └──────────────────┘        └───────────────┘
```

---

## 🎉 Você está pronto para produção!

**Próximos passos:**
1. Configure seu domínio
2. Ative SSL/TLS
3. Configure monitoramento
4. Setup de backup
5. Treine o time

---

**Boa sorte com seu deploy! 🚀**
