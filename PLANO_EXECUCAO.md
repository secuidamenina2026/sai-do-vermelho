# 📋 PLANO DE EXECUÇÃO - Sai do Vermelho

**Data:** 18 de Julho de 2026  
**Status Build:** ✅ PASSOU (npm run build funciona perfeitamente)  
**Tempo Estimado Total:** 8-12 horas  

---

## 🎯 5 Blockers Críticos para Vender

### 1. ✅ Database Missing
**Status:** RESOLVIDO  
**O que foi feito:**
- Criei arquivo `database.sql` com todas as 7 tabelas
- Includes: users, monthly_budgets, expenses, debts, goals, ai_consultations, subscriptions
- RLS (Row Level Security) configurado
- Triggers para updated_at automático

**Próximo passo:** Rodar SQL no Supabase (5 minutos)

---

### 2. ❌ Autenticação: Cookie vs localStorage (BLOCKER #2)
**Problema:** 
- Backend espera cookies (`createRouteHandlerClient({ cookies })`)
- Frontend provavelmente usa localStorage
- Resultado: Todo endpoint autenticado retorna 401 Unauthorized

**Arquivos afetados:**
- `/app/api/user/route.ts` - GET/PUT falham (returns 401)
- `/app/api/ai/route.ts` - POST falha (returns 401)
- `/app/api/checkout/route.ts` - POST falha (returns 401)

**Solução:**
1. Verificar como frontend está fazendo login (app/auth/login/*.tsx)
2. Garantir que Supabase está configurado para usar cookies (já está no backend)
3. Frontend precisa garantir que session está sendo salva em cookies (Supabase já faz isso se configurado)
4. Remover qualquer lógica de localStorage que conflita

**Tempo:** 1-2 horas (envolve testar + ajustar frontend e backend)

---

### 3. ❌ Stripe: Hardcoded Price IDs (BLOCKER #3)
**Problema:**
- `/app/api/checkout/route.ts` tem `'price_premium'` e `'price_pro'` como strings literais
- Stripe rejeita porque esses IDs não existem/não são válidos

**Solução:**
1. Criar 2 produtos no Stripe Dashboard (ou já existem):
   - Produto "Basic" → Plan: basic → Price: R$29/mês
   - Produto "Pro" → Plan: pro → Price: R$69/mês
2. Copiar os Price IDs do Stripe (format: `price_1ABC...`)
3. Adicionar a `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_1ABC...
   NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1XYZ...
   ```
4. Atualizar `/app/api/checkout/route.ts` para usar env vars

**Tempo:** 30 minutos

---

### 4. ❌ Missing Stripe Webhook (BLOCKER #4)
**Problema:**
- Payment completa no Stripe mas app nunca atualiza plano do user
- `subscriptions` table fica vazia
- User não recebe acesso aos planos pagos

**Solução:**
1. Criar endpoint `/api/webhooks/stripe` (provavelmente já existe mas sem lógica)
2. Implementar handlers para:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `charge.failed` (para erros)
3. Atualizar `subscriptions` table com dados do Stripe
4. Adicionar webhook URL no Stripe Dashboard

**Tempo:** 2-3 horas

---

### 5. ❌ No Plan Enforcement (BLOCKER #5)
**Problema:**
- Usuário no plano "free" consegue usar endpoints que deveriam ser "pro"
- Sem validação de plano nas APIs

**Solução:**
1. Implementar middleware em:
   - `/api/ai` → Só Basic+ pode usar
   - `/api/checkout` → Free pode ir, mas ao pagar atualiza plano
2. Verificar `subscriptions.plan` antes de processar

**Tempo:** 1-2 horas (depois que webhook funcionar)

---

## 📅 Timeline Prática

### Fase 1: Database (5 minutos)
```bash
# 1. Abrir Supabase → SQL Editor
# 2. Copiar todo o conteúdo de database.sql
# 3. Colar e rodar
# 4. Verifica: SELECT * FROM users; (deve dar 0 linhas, schema OK)
```

### Fase 2: Build & Deploy (10 minutos)
```bash
cd /tmp/sai-do-vermelho
npm run build  # ✅ Já passa
git add database.sql
git commit -m "Add database schema"
git push origin main
# Vercel automaticamente faz deploy (2-3 min)
```

### Fase 3: Stripe Setup (30 minutos)
1. Ir ao Stripe Dashboard
2. Criar/confirmar 2 produtos (Basic R$29, Pro R$69)
3. Copiar Price IDs
4. Adicionar a `.env.local`
5. Atualizar `/app/api/checkout/route.ts`
6. Redeploy

### Fase 4: Auth Fix (1-2 horas)
1. Inspecionar fluxo de login
2. Testar POST /api/auth
3. Verificar cookies estão sendo salvos
4. Testar GET /api/user → deve retornar dados (não 401)

### Fase 5: Webhook Stripe (2-3 horas)
1. Implementar `/api/webhooks/stripe`
2. Handlers para subscription events
3. Update `subscriptions` table
4. Registrar webhook no Stripe Dashboard
5. Testar com payment fake no Stripe

### Fase 6: Plan Enforcement (1-2 horas)
1. Adicionar validação em `/api/ai`
2. Testar com diferentes plans (free, basic, pro)
3. Verificar acesso correto

### Fase 7: End-to-end Testing (2-3 horas)
1. Nova conta → Free user
2. Upgrade para Basic → Testa acesso
3. Alguns gastos, orçamento
4. IA consultoria (se free tem limite)
5. Downgrade/Cancel subscription

---

## 🚀 Quick Start (Hoje)

### Pré-requisitos:
- [ ] Supabase project criado (ou usar existente)
- [ ] Stripe account criado (já tem)
- [ ] Anthropic API key (já tem)
- [ ] GitHub push access (já tem)
- [ ] Vercel linked (já tem)

### Execução Fase 1 (5 min):
```bash
# 1. Abrir supabase.com/dashboard
# 2. SQL Editor
# 3. Copy-cola /tmp/sai-do-vermelho/database.sql
# 4. Run
# 5. Pronto!
```

---

## ✅ Checklist Antes de Vender

- [ ] Database tables criadas + RLS ativo
- [ ] npm run build passa ✅
- [ ] POST /api/auth funciona (signup/login)
- [ ] GET /api/user retorna dados (não 401)
- [ ] POST /api/checkout inicia Stripe session
- [ ] Stripe webhook atualiza subscription
- [ ] Usuário upgrade de free → basic, dados salvos
- [ ] AI endpoint retorna resposta (se plano permite)
- [ ] Deploy em Vercel está live
- [ ] Testado: registro → login → upgrade → consultoria

---

## 📊 Realismo

**Tempo real para produção:**
- Otimista: 8 horas (sem bugs/interruptions)
- Realista: 10-12 horas (sempre há surpresas)
- Pessimista: 15+ horas (se problemas com auth ou stripe)

**Por que?** Cada blocker tem sub-problemas:
- Auth: precisa testar frontend + backend + cookies
- Stripe: documentação confusa, eventos pode falhar silenciosamente
- Webhook: recebimento vs processamento pode ter delays
- Plan enforcement: edge cases (downgrade, cancel, etc)

---

## 💡 Decisão: Quando Vender?

**Opção A (Hoje):** Lançar com MVP (free + basic, sem pro)
- Menos features = menos bugs
- Webhook pode ser simples
- Tempo: 6-8 horas

**Opção B (Amanhã):** Lançar com tudo (free, basic, pro)
- Mais completo = mais vendas
- Webhook complexo (3 tiers)
- Tempo: 12-16 horas

**Recomendação:** Opção A - MVP com Basic é suficiente para validar produto
- Depois escala para Pro

---

**Próximo passo: Rodar SQL no Supabase agora? (5 minutos)**

Avisaí quando tiver feito isso que eu começo a Phase 2.
