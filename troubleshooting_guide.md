# 🔧 Guia de Troubleshooting - Marcenaria MDF

Respostas rápidas para os problemas mais comuns.

---

## ❌ Erro: "HTTP 401: Unauthorized" ao fazer login

### Causa
A chave do Supabase está incorreta ou é a Service Role Secret em vez de anon public.

### Solução
1. Abra https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Settings → API**
4. Copie a chave **anon public** (não a Service Role Secret!)
5. Cole em `.env.local`:
   ```
   VITE_SUPABASE_KEY=COLE-A-CHAVE-ANON-AQUI
   ```
6. Salve e reinicie o servidor (`Ctrl+C` e `bun run dev`)
7. Recarregue a página (F5)

---

## ❌ Erro: "EmailJS não está configurado"

### Causa
As variáveis de ambiente do EmailJS não estão definidas ou estão incorretas.

### Solução
1. Acesse https://dashboard.emailjs.com
2. Copie:
   - **Service ID**
   - **Template ID**
   - **Public Key**
3. Cole em `.env.local`:
   ```
   VITE_EMAILJS_SERVICE_ID=service_xxxxx
   VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
   VITE_EMAILJS_PUBLIC_KEY=xxxxx
   ```
4. Reinicie o servidor frontend
5. Recarregue a página (F5)

**Nota:** Se não tiver conta EmailJS:
1. Acesse https://dashboard.emailjs.com
2. Crie uma conta gratuita
3. Adicione um provedor de email (Gmail, Outlook, etc)
4. Crie um template com as variáveis necessárias

---

## ❌ Erro: "Network Error" ao criar cliente/orçamento

### Causa
Backend não está rodando ou URL está incorreta.

### Solução
1. Verifique se backend está rodando:
   ```bash
   # Terminal do backend deve estar rodando:
   uvicorn main:app --reload
   # Deve aparecer: "Uvicorn running on http://127.0.0.1:8000"
   ```

2. Verifique CORS no backend (`main.py`):
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],  # Verifique esta linha
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. Verifique `.env.local`:
   ```
   VITE_API_URL=http://localhost:8000/api
   ```

4. Se ainda não funcionar, abra **DevTools (F12) → Console** e veja a mensagem de erro específica

---

## ❌ Erro: "PDF não está sendo baixado"

### Causa
Backend não conseguiu gerar PDF ou cliente não está associado.

### Solução
1. Certifique-se de que:
   - ✅ Backend está rodando (`http://localhost:8000`)
   - ✅ Cliente está associado ao orçamento
   - ✅ Orçamento foi criado com sucesso

2. Abra **DevTools (F12) → Console** e procure por:
   ```
   📡 Fazendo requisição para: http://localhost:8000/api/budgets/ID/pdf
   ```

3. Se houver erro, verifique:
   - Se o orçamento tem ID válido
   - Se o cliente existe no banco de dados
   - Logs do backend para detalhes

---

## ❌ Erro: "Toast não aparece"

### Causa
ToastContainer não está no App.tsx ou há erro no componente.

### Solução
1. Abra `App.tsx`
2. Verifique se `ToastContainer` está importado:
   ```typescript
   import { ToastContainer } from './components/Toast';
   ```

3. Verifique se está renderizado:
   ```typescript
   <ErrorBoundary>
     <ToastContainer />
     {/* resto do conteúdo */}
   </ErrorBoundary>
   ```

4. Se ainda não aparecer, abra **DevTools (F12) → Console** e procure por erros

---

## ❌ Erro: "Rotas protegidas não funcionam" (consigo acessar sem login)

### Causa
`ProtectedRoute` não está configurado corretamente.

### Solução
1. Abra `App.tsx`
2. Verifique se `ProtectedRoute` está sendo usado:
   ```typescript
   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
   ```

3. Verifique se o hook `useAuth` está funcionando:
   ```typescript
   const { user, loading } = useAuth();
   if (!user) {
     return <Navigate to="/login" replace />;
   }
   ```

4. Teste fazendo logout e tentando acessar diretamente:
   - Deve redirecionar para `/login`

---

## ❌ Erro: "Dashboard vazio (sem gráficos)"

### Causa
Faltam dados (clientes/orçamentos) ou há erro nas requisições.

### Solução
1. Crie alguns dados:
   - ✅ Crie pelo menos 2 clientes
   - ✅ Crie pelo menos 1 orçamento

2. Recarregue a página (F5)

3. Abra **DevTools (F12) → Console** e procure por:
   ```
   ✅ Resposta recebida: [...]
   ```

4. Se ver erros vermelhos, anote e consulte a seção apropriada

---

## ❌ Erro: "Aplicação congelada/lenta"

### Causa
Muitas requisições simultâneas ou componente renderizando infinitamente.

### Solução
1. Abra **DevTools (F12) → Performance**
2. Faça uma ação simples (criar cliente)
3. Veja qual componente está consumindo CPU
4. Procure por `useEffect` sem dependências:
   ```typescript
   // ❌ ERRADO - renderiza infinitamente
   useEffect(() => {
     fetchCustomers();
   });

   // ✅ CORRETO - executa apenas uma vez
   useEffect(() => {
     fetchCustomers();
   }, []);
   ```

---

## ❌ Erro: "Variáveis de ambiente não estão carregando"

### Causa
Variáveis estão em `.env` em vez de `.env.local`, ou arquivo tem problemas de sintaxe.

### Solução
1. Verifique se arquivo é `.env.local` (não `.env` ou `.env.example`)
2. Verifique sintaxe (sem espaços extras):
   ```plaintext
   VITE_SUPABASE_URL=https://...  ✅ Correto
   VITE_SUPABASE_URL = https://...  ❌ Errado (espaços)
   ```

3. Reinicie o servidor:
   ```bash
   Ctrl+C  # Para o servidor
   bun run dev  # Reinicia
   ```

4. Verifique se `.env.local` está listado em `.gitignore` (segurança)

---

## ❌ Erro: "Cannot find module '/src/components/Toast'"

### Causa
Arquivo `Toast.tsx` não existe ou pasta `components` não foi criada.

### Solução
1. Verifique se a pasta existe:
   ```
   src/components/
   ├── ErrorBoundary.tsx
   └── Toast.tsx
   ```

2. Se não existir, crie:
   - Clique direito em `src`
   - Crie pasta `components`
   - Crie arquivos `Toast.tsx` e `ErrorBoundary.tsx`

3. Copie o código dos artifacts do guia de implementação

---

## ❌ Erro: "Supabase inicializado com sucesso" mas login ainda falha

### Causa
Supabase conectou, mas autenticação falhou por outro motivo.

### Solução
1. Abra **DevTools (F12) → Console** e procure por:
   ```
   POST https://seu-projeto.supabase.co/auth/v1/token 401
   ```

2. Significa que a **senha ou email está incorreto**
3. Tente:
   - ✅ Crie uma nova conta (botão Registrar)
   - ✅ Ou use email/senha que criou antes

4. Se nenhum funcionar:
   - Acesse Supabase Auth
   - Verifique se tem usuários cadastrados
   - Crie um usuário manualmente no Supabase

---

## ⚠️ Aviso: "Token expirado"

### Causa
Token JWT expirou após longo período sem atividade.

### Solução
1. Faça logout (clique em **Sair**)
2. Faça login novamente
3. Token será renovado automaticamente
4. Continue usando a aplicação

---

## 💡 Debug Tips

### Para Debug de Requisições HTTP
1. Abra **DevTools (F12) → Network**
2. Faça uma ação (criar cliente, etc)
3. Veja a requisição na aba Network
4. Clique na requisição e verifique:
   - **Headers** - Authorization Bearer token
   - **Response** - Resposta do servidor
   - **Status** - HTTP 200, 400, 401, 500, etc

### Para Debug de Console
1. Abra **DevTools (F12) → Console**
2. Procure por:
   - ✅ Mensagens verdes (sucesso)
   - ❌ Mensagens vermelhas (erro)
   - 📡 Mensagens de requisição
   - 🔐 Mensagens de autenticação

### Para Debug de LocalStorage
1. Abra **DevTools (F12) → Application**
2. Clique em **Local Storage**
3. Verifique se `access_token` está lá após login

### Para Debug de Componentes React
1. Instale **React Developer Tools** no Chrome
2. Abra **DevTools (F12) → Components**
3. Procure pelos componentes
4. Veja props e estado em tempo real

---

## 📞 Ainda não resolveu?

Se nenhuma solução acima funcionou:

1. **Verifique o Console completo** (F12) - copie TODOS os erros
2. **Verifique o Backend** - veja logs do FastAPI
3. **Reinicie tudo**:
   ```bash
   # Terminal Backend (Ctrl+C)
   # Terminal Frontend (Ctrl+C)
   # Recarregue arquivo .env
   # Reinicie ambos servidores
   ```

4. **Verifique conectividade**:
   ```bash
   # Backend rodando?
   curl http://localhost:8000/api/customers
   
   # Frontend rodando?
   curl http://localhost:5173
   ```

5. **Abra uma issue** no repositório com:
   - Erro completo do console
   - Passos para reproduzir
   - Ambiente (Windows/Mac/Linux)

---

**boa sorte! 🍀**
