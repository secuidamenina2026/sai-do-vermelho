# 🚀 SAI DO VERMELHO - SaaS Freemium

**Status:** 🟢 PRONTO PARA DEPLOY
**Objetivo:** Lançar em 30 dias com 100+ usuários no dia 1
**Meta:** R$ 1M+ MRR em 12 meses

Aplicação SaaS para organizar finanças pessoais com IA (Claude) e pagamentos (Stripe).

## 📋 Quick Start (5 minutos)

### 1. Clonar e instalar
```bash
git clone https://github.com/[seu-user]/sai-do-vermelho.git
cd sai-do-vermelho
npm install
```

### 2. Configurar ambiente
Crie arquivo `.env.local` na raiz:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[seu-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...

# Claude (Anthropic)
ANTHROPIC_API_KEY=sk-ant-v0-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Setup Banco de Dados
```bash
# No Supabase SQL Editor, rode o arquivo:
database.sql
```

### 4. Rodar localmente
```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🏗️ Arquitetura do Projeto

```
sai-do-vermelho/
├── app/
│   ├── layout.tsx          ← Layout principal
│   ├── page.tsx            ← Landing page
│   ├── dashboard/          ← Dashboard protegido
│   │   ├── page.tsx        ← Visão geral
│   │   ├── orcamento/      ← Budget 50-30-20
│   │   ├── gastos/         ← Expense tracker
│   │   ├── dividas/        ← Debt manager
│   │   ├── metas/          ← Goals tracker
│   │   └── resumo/         ← Monthly summary
│   ├── auth/               ← Login/Register
│   └── api/                ← Backend routes
│       ├── auth/           ← Auth
│       ├── ai/             ← Claude API
│       ├── checkout/       ← Stripe
│       └── user/           ← User data
├── components/             ← React components
├── lib/                    ← Supabase, Stripe, Claude clients
└── styles/                 ← Tailwind CSS
```

## ✨ Features Implementadas

✅ Autenticação (Email + Supabase)
✅ Cálculo automático 50-30-20
✅ Rastreio de gastos por categoria
✅ Gestor de dívidas (sistema bola de neve)
✅ Metas financeiras com progresso
✅ Consultoria IA (Claude) por chat
✅ Dashboard responsivo
✅ Integração Stripe (pagamentos)
✅ Row Level Security (segurança)

## 💰 Modelos de Preço

| Plano | Preço | Features |
|-------|-------|----------|
| **Free** | R$ 0 | Teste + cálculo 50-30-20 |
| **Premium** | R$ 19/mês | Tudo + IA + histórico 12 meses |
| **Pro** | R$ 49/mês | Premium + comunidade + análise avançada |

## 🚀 Deployment (Vercel)

### 1. Conectar GitHub
```bash
git push origin main
```

### 2. Deploy Vercel
```bash
npm install -g vercel
vercel login
vercel
```

### 3. Configurar variáveis de ambiente
No Vercel dashboard → Settings → Environment Variables, adicione:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- ANTHROPIC_API_KEY
- NEXT_PUBLIC_APP_URL

### 4. Deploy
```bash
vercel --prod
```

## 📊 Métricas para Acompanhar

Diariamente (Meta Ads Manager):
- CPC (custo por clique) < R$ 2,50
- CTR (taxa clique) ≥ 2%
- ROAS ≥ 1,5x

Semanalmente (Dashboard):
- Usuários novos
- Taxa conversão Free → Premium
- Churn (cancelamento)
- MRR (Monthly Recurring Revenue)

## 📱 Campanha Meta (Semana 3)

Orçamento: R$ 50-100/dia
Público: 25-50 anos, interesse finanças
Criativos: 3 versões (problem-aware, value-driven, trust-focused)

## 🤖 Claude AI Integration

- Consultoria automática por categoria
- Análise de padrões de gasto
- Sugestões de otimização personalizadas
- Respostas baseadas em situação real do usuário

## 🔐 Segurança

- Row Level Security (RLS) no Supabase
- Autenticação JWT
- Variáveis de ambiente secretas
- Sem exposição de dados sensíveis

## 📞 Suporte

Dúvidas? Manda mensagem para o Claude (seu sócio dev 24/7)

---

**Desenvolvido com ❤️ por Claude + Edu**
**Versão:** 0.1.0
**Última atualização:** 17 de Julho de 2026
