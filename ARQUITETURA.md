# 🏗️ Arquitetura Técnica - SAI DO VERMELHO

## 📐 Stack Tecnológico

| Camada | Tecnologia | Função |
|--------|-----------|--------|
| **Frontend** | Next.js 14 + React 18 | UI/UX responsivo |
| **Styling** | Tailwind CSS | CSS utilitário |
| **Backend** | Next.js API Routes | Endpoints REST |
| **Database** | Supabase (PostgreSQL) | Dados + Auth |
| **Auth** | Supabase Auth | Login/signup |
| **Payments** | Stripe | Cobrança recorrente |
| **IA** | Claude (Anthropic) | Consultoria financeira |
| **Hosting** | Vercel | Deploy automático |

---

## 🔄 Fluxo de Dados

```
User → Frontend → API Routes → Supabase/Stripe/Claude → Frontend → User

Exemplo: Usuário cadastro
1. User preenche formulário
2. Frontend envia POST /api/auth
3. Backend cria conta no Supabase
4. Backend cria usuário na tabela users
5. Backend retorna JWT
6. Frontend salva token e redireciona
```

---

## 📊 Database Schema

```sql
users (id, email, full_name, avatar_url, plan, monthly_income, created_at, updated_at)
    ↓ foreign key
monthly_budgets (id, user_id, month, monthly_income, essentials_budget, desires_budget, savings_budget, ...)
expenses (id, user_id, category, planned_amount, actual_amount, month, notes, ...)
debts (id, user_id, creditor, total_amount, monthly_interest_rate, monthly_payment, priority_order, is_paid, ...)
goals (id, user_id, goal_name, target_amount, saved_amount, target_date, ...)
ai_consultations (id, user_id, category, question, ai_response, tokens_used, created_at)
subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, plan, status, ...)
```

Todas as tabelas têm **Row Level Security (RLS)** ativado:
- Usuários só veem seus próprios dados
- Não há acesso cruzado entre contas

---

## 🔐 Autenticação & Autorização

### Fluxo de Login

```
1. User submete email + password
2. Frontend chama POST /api/auth?action=signin
3. Supabase verifica credentials
4. Supabase retorna JWT token
5. Frontend armazena token em httpOnly cookie (Supabase faz)
6. Próximas requisições: token automaticamente enviado
7. Backend valida token antes de acessar dados
```

### RLS (Row Level Security)

Cada tabela tem policies como:
```sql
CREATE POLICY "Users can see their own data" ON users 
  FOR SELECT 
  USING (auth.uid() = id);
```

Isso significa: **Supabase bloqueia query se o usuário autenticado não é o dono**

---

## 💰 Fluxo de Pagamento (Stripe)

```
1. User clica "Upgrade para Premium"
2. Frontend chama POST /api/checkout?plan=premium
3. Backend:
   a. Verifica se user está autenticado
   b. Cria/recupera Stripe customer
   c. Cria checkout session
   d. Retorna sessionId
4. Frontend redireciona para Stripe hosted checkout
5. Stripe processa pagamento (user completa no site Stripe)
6. Stripe webhook → POST /api/webhooks/stripe
7. Backend atualiza subscriptions table
8. Frontend redireciona para dashboard
```

**Nota:** Webhook ainda precisa ser implementado (API route básica existe)

---

## 🤖 IA Consultoria (Claude)

```
1. User vai em dashboard e tem chat
2. User faz pergunta: "Como economizar em mercado?"
3. Frontend chama POST /api/ai
   {
     "category": "mercado",
     "question": "Como economizar em mercado?"
   }
4. Backend:
   a. Verifica autenticação
   b. Busca orçamento do user (monthly_budgets)
   c. Busca gastos recentes (expenses)
   d. Chama generateFinancialAdvice() com Claude
   e. Salva consulta em ai_consultations table
   f. Retorna resposta
5. Frontend exibe resposta no chat
```

Prompt do Claude é customizado com:
- Renda do user
- Gastos reais na categoria
- Contexto do orçamento 50-30-20

---

## 📝 Pages & Their Purposes

| Page | Path | Auth | O que faz |
|------|------|------|----------|
| Landing | `/` | ❌ | Mostra features e pricing |
| Register | `/auth/register` | ❌ | Cria conta nova |
| Login | `/auth/login` | ❌ | Faz login |
| Dashboard | `/dashboard` | ✅ | Visão geral + stats |
| Orçamento | `/dashboard/orcamento` | ✅ | Setup 50-30-20 |
| Gastos | `/dashboard/gastos` | ✅ | Adiciona/lista despesas |
| Dívidas | `/dashboard/dividas` | ✅ | Gerencia dívidas |
| Metas | `/dashboard/metas` | ✅ | Cria/acompanha metas |
| Resumo | `/dashboard/resumo` | ✅ | Análise completa do mês |

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth` - Signup/Login
  ```json
  { "action": "signup", "email": "...", "password": "...", "fullName": "..." }
  ```

### User Data
- `GET /api/user` - Pega perfil do usuário autenticado
- `PUT /api/user` - Atualiza perfil
  ```json
  { "full_name": "...", "avatar_url": "...", "monthly_income": 3000 }
  ```

### AI Consultoria
- `POST /api/ai` - Consulta Claude com contexto do user
  ```json
  { "category": "mercado", "question": "Como economizar?" }
  ```

### Pagamentos
- `POST /api/checkout` - Inicia checkout Stripe
  ```json
  { "plan": "premium" }
  ```

---

## 🚀 Deployment Architecture

```
GitHub (seu repo)
    ↓ (git push)
Vercel (CI/CD automático)
    ↓ 
Next.js Build
    ↓
Deploy → vercel.app (ou domínio custom)
    ↓
Conecta a: Supabase, Stripe, Anthropic
```

**Processo:**
1. Você faz `git push` para main
2. Vercel detecta e faz build automaticamente
3. Se build passar, deploy em produção
4. App fica vivo em `https://sai-do-vermelho.vercel.app`

---

## 📈 Monitoramento & Observabilidade

### Logs
- Browser console: Frontend errors
- Vercel dashboard: Server errors
- Supabase logs: Database queries

### Métricas
- Google Analytics 4: User behavior
- Stripe dashboard: Payment metrics
- Vercel analytics: Performance

### Debugging
1. Dev tools do browser (Frontend)
2. Network tab (Ver requisições API)
3. Supabase SQL editor (Ver dados diretos)
4. Vercel logs (Ver server errors)

---

## 🔄 Atualizar Código

```bash
# Fazer mudança no código
vim app/dashboard/page.tsx

# Testar localmente
npm run dev

# Fazer commit
git add .
git commit -m "Melhoria: adicionar nova feature"

# Push para GitHub
git push origin main

# Vercel automaticamente:
# 1. Detecta mudança
# 2. Faz build
# 3. Se OK, deploy em produção
# 4. App atualiza (~2 minutos)
```

---

## 🆘 Troubleshooting Comum

| Problema | Causa | Solução |
|----------|-------|--------|
| "Erro na autenticação" | .env.local faltando | Verificar NEXT_PUBLIC_SUPABASE_URL |
| "Dados não carregam" | Supabase offline | Verificar status supabase.com |
| "Stripe error" | Chaves erradas | Verificar STRIPE_SECRET_KEY no .env.local |
| "Claude error" | API key inválida | Verificar ANTHROPIC_API_KEY |
| "Deploy falha" | Dependências | Rodar `npm install` localmente |

---

## 💡 Arquitetura de Segurança

1. **Frontend** (Next.js): Nunca armazena secrets
2. **Variáveis de Ambiente**:
   - `NEXT_PUBLIC_*` = públicas (navegador)
   - `SUPABASE_SERVICE_KEY`, `STRIPE_SECRET_KEY` = servidor only
3. **Autenticação**: JWT via Supabase
4. **RLS**: PostgreSQL nível row-level
5. **HTTPS**: Obrigatório em produção
6. **CORS**: Configurado no Supabase

---

**Essa é a base sólida para escalar para R$ 1M+ MRR!** 🚀
