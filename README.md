# MicroSaaS Plan — Orçamento e Comunicação

Este repositório contém um projeto full-stack pronto para evoluir como um microSaaS focado em: gestão de clientes, criação/gestão de orçamentos (propostas), e comunicação transacional (e-mail e WhatsApp), com exportação em PDF/planilha. A stack é moderna, com frontend React + Vite + Tailwind e backend em Python, além de integrações com serviços externos (e.g., EmailJS, WhatsApp API/Deep Links) e Supabase para autenticação.


## Objetivo do produto (visão MicroSaaS)

- Resolver um problema específico: centralizar captação de clientes, geração de orçamentos e envio/seguimento via e-mail/WhatsApp.
- Operar com baixo custo e alta automação: autenticação gerenciada (Supabase), envio de comunicação por serviços de terceiros e geração automática de documentos.
- Monetização simples: planos por número de clientes, orçamentos/mês, e recursos premium (branding, templates customizados, exportações avançadas).
- Pronto para escalar: frontend desacoplado, backend stateless, serviços integrados e pipelines de deploy documentados.


## Visão geral da arquitetura

- frontend/ (React + Vite + TypeScript + TailwindCSS)
  - UI, rotas e lógica de experiência do usuário.
  - Integração com Supabase para autenticação e com o backend via REST.
  - Hooks para encapsular chamadas a APIs e serviços externos.
- backend/ (Python)
  - Endpoints da API, regras de negócio, geração de PDFs/exports.
  - Serviços externos: e-mail e WhatsApp.
  - Camada de acesso/armazenamento (database.py) — adaptável a Postgres/Supabase.
- Deploy e operação
  - Deploys independentes (frontend estático, backend em container ou PaaS).
  - Logs centralizados, métricas simples e guia de troubleshooting.


## Estrutura do repositório

- backend/
  - main.py — Ponto de entrada do servidor/backend (endpoints REST e orquestração de serviços).
  - database.py — Abstração de persistência para clientes, orçamentos e configurações.
  - email_service.py — Camada de integração para envio de e-mails (ex.: EmailJS/SMTP/API).
  - whatsapp_service.py — Envio/links de WhatsApp (deep links ou API oficial/terceiros).
  - pdf_generator.py — Geração de PDFs de orçamentos/propostas.
  - export_generator.py — Geração de exports (CSV/XLSX) para relatórios.
  - requirements.txt — Dependências Python do backend.
  - package.json, bun.lock — Utilidades de automação (scripts) quando executado com Bun/Node (opcional).
- frontend/
  - src/
    - App.tsx, main.tsx — Bootstrapping da aplicação React.
    - pages/
      - Dashboard.tsx — Visão geral (KPIs, últimos orçamentos/clientes).
      - Customers.tsx — CRUD de clientes.
      - Budgets.tsx — CRUD e visualização de orçamentos.
      - Settings.tsx — Configurações (integrações, branding, templates).
      - Login.tsx — Fluxo de autenticação.
    - components/
      - Toast.tsx — Notificações de feedback.
      - ErrorBoundary.tsx — Tratamento global de erros na UI.
    - hooks/
      - useAuth.ts — Login/logout/estado do usuário (Supabase).
      - useCustomers.ts — Acesso aos endpoints de clientes.
      - useBudgets.ts — Acesso aos endpoints de orçamentos.
      - useEmailJS.ts — Envio de e-mails via EmailJS.
      - useWhatsApp.ts — Envio/links de WhatsApp.
    - lib/
      - api.ts — Cliente HTTP para o backend (baseURL, interceptors, etc.).
      - supabaseClient.ts — Instância e utilitários do Supabase.
  - index.html, estilos (Tailwind), configurações TS/ESLint/Vite.
- deploy_guide.md — Passo a passo para publicar o frontend e o backend.
- troubleshooting_guide.md — Erros comuns e como resolver.
- project_readme.md — Anotações adicionais do projeto.


## Fluxos principais

1) Autenticação
- O frontend usa Supabase (lib/supabaseClient.ts e hooks/useAuth.ts) para login e estado do usuário.
- Tokens podem ser enviados ao backend em cabeçalhos para autorização.

2) Gestão de Clientes
- pages/Customers.tsx e hooks/useCustomers.ts consomem endpoints do backend.
- database.py mantém o modelo e persistência (ajuste para seu banco de dados).

3) Orçamentos/Propostas
- pages/Budgets.tsx e hooks/useBudgets.ts para listar/criar/editar orçamentos.
- pdf_generator.py gera documentos imprimíveis.
- export_generator.py provê CSV/XLSX para relatórios e análise.

4) Comunicação
- email_service.py e hooks/useEmailJS.ts para envio de e-mails transacionais.
- whatsapp_service.py e hooks/useWhatsApp.ts para disparos/links de WhatsApp (ex.: envio do orçamento para o cliente).


## Como executar localmente

Pré-requisitos
- Node 18+ e pnpm/npm/yarn ou Bun (para o frontend).
- Python 3.10+ e virtualenv/venv (para o backend).
- Conta e projeto no Supabase (para autenticação) e chaves/configs de e-mail/WhatsApp.

Backend
1. cd backend
2. python -m venv .venv && source .venv/bin/activate
3. pip install -r requirements.txt
4. Configure variáveis de ambiente (exemplos):
   - DATABASE_URL=... (Postgres/Supabase)
   - SUPABASE_JWT_SECRET=...
   - EMAILJS_SERVICE_ID=..., EMAILJS_TEMPLATE_ID=..., EMAILJS_PUBLIC_KEY=...
   - WHATSAPP_API_TOKEN=... (se usar API) ou apenas deep links
5. python main.py (ou uvicorn/fastapi se aplicável, conforme a implementação do main.py)

Frontend
1. cd frontend
2. pnpm install (ou npm install / yarn) — alternativamente bun install
3. Defina variáveis em .env.local, por exemplo:
   - VITE_API_BASE_URL=http://localhost:8000
   - VITE_SUPABASE_URL=...
   - VITE_SUPABASE_ANON_KEY=...
4. pnpm dev (ou npm run dev / bun dev)


## Configuração e ambientes

- .env/.env.local não estão versionados; use variáveis por ambiente (dev, staging, prod).
- Ajuste CORS no backend para o domínio do frontend.
- Defina regras RLS (Row Level Security) no Supabase quando necessário.


## Boas práticas e padrões adotados

- Separação de responsabilidades: páginas, componentes, hooks e lib no frontend; serviços e camadas no backend.
- Tratamento de erros com ErrorBoundary e Toasts.
- Hooks para encapsular integrações e reduzir repetição de código.
- Geração de artefatos (PDF/CSV) isolada em módulos específicos.
- Scripts de deploy e documentação para reduzir tempo de setup.


## Roadmap sugerido para virar MicroSaaS

MVP
- Autenticação, CRUD de clientes e orçamentos, exportação e envio por e-mail/WhatsApp.
- Template PDF simples com branding básico.

V1
- Planos de assinatura (tiers) e limites por plano.
- Webhooks de eventos (orçamento visualizado, assinado, expirado).
- Dashboard com métricas de conversão.

V2
- Templates de orçamento customizáveis por usuário.
- Assinatura eletrônica (link de aceite) e trilha de auditoria.
- Integração com gateways de pagamento (checkout) para receber sinal/entrada.


## Testes e qualidade

- Frontend: testes unitários de hooks e componentes críticos; linters (ESLint) e TypeScript estrito.
- Backend: testes unitários/integração para serviços (PDF, e-mail, WhatsApp) e endpoints.
- CI: pipeline com lint + testes + build.


## Deploy e operação

- Frontend: hospedagem estática (Vercel/Netlify/Cloudflare Pages). Variáveis VITE_* configuradas no provedor.
- Backend: PaaS/container (Railway/Fly.io/Render/AWS). Configure variáveis de ambiente e persistência.
- Observabilidade: logs estruturados e alertas básicos por falhas de envio/geração.


## Contribuição

- Crie branches por feature, commits descritivos e PRs pequenos.
- Siga os padrões de código e atualize a documentação ao alterar fluxos.


## Licença

Defina uma licença antes da distribuição pública (MIT, Apache 2.0, etc.).
