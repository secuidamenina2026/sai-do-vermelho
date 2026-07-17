# 🚀 SAI DO VERMELHO - Setup Rápido

## ⚡ COMEÇO RÁPIDO (5 MINUTOS)

### 1. Clone o projeto
```bash
git clone https://github.com/[SEU_USER]/sai-do-vermelho.git
cd sai-do-vermelho
```

### 2. Instale dependências
```bash
npm install
```

### 3. Crie arquivo `.env.local` na raiz:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[seu-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

ANTHROPIC_API_KEY=sk-ant-...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Rode o servidor
```bash
npm run dev
```

**Pronto!** App rodando em `http://localhost:3000` ✅

---

## 🗄️ ESTRUTURA DO PROJETO

```
sai-do-vermelho/
├── app/
│   ├── layout.tsx          (Layout principal)
│   ├── page.tsx            (Home/Landing)
│   ├── dashboard/
│   │   ├── page.tsx        (Dashboard principal)
│   │   ├── orcamento/      (Orçamento 50-30-20)
│   │   ├── gastos/         (Registro de gastos)
│   │   ├── dividas/        (Gestão de dívidas)
│   │   ├── metas/          (Acompanhamento de metas)
│   │   └── resumo/         (Resumo mensal)
│   ├── api/
│   │   ├── auth/           (Autenticação)
│   │   ├── ai/             (Claude API)
│   │   ├── checkout/       (Stripe)
│   │   └── user/           (Dados do usuário)
│   └── auth/
│       ├── login/page.tsx
│       └── register/page.tsx
├── components/
│   ├── navbar.tsx
│   ├── sidebar.tsx
│   ├── budget-calculator.tsx
│   ├── expense-tracker.tsx
│   ├── debt-manager.tsx
│   ├── goals-tracker.tsx
│   └── ai-advisor.tsx
├── lib/
│   ├── supabase.ts         (Cliente Supabase)
│   ├── stripe.ts           (Cliente Stripe)
│   ├── anthropic.ts        (Cliente Claude)
│   └── utils.ts
├── styles/
│   └── globals.css         (Tailwind)
├── public/
│   ├── logo.png
│   └── favicon.ico
├── .env.local              (VOCÊ CRIA)
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 🔑 VARIÁVEIS DE AMBIENTE

### Supabase
1. Vai em https://supabase.com/dashboard
2. Cria novo projeto "sai-do-vermelho"
3. Copia URL e ANON_KEY

### Stripe
1. Vai em https://dashboard.stripe.com
2. Ativa modo de teste
3. Copia PUBLISHABLE_KEY e SECRET_KEY

### Claude (Anthropic)
1. Vai em https://console.anthropic.com
2. Cria API key
3. Copia e cola

---

## 📦 FEATURES PRONTAS

✅ Autenticação (Email + Google)
✅ Cálculo 50-30-20 automático
✅ Rastreio de gastos
✅ Gestor de dívidas (bola de neve)
✅ Metas financeiras
✅ IA Consultoria (Claude)
✅ Exportar PDF
✅ Pagamento (Stripe)
✅ Dashboard completo
✅ Responsivo (Mobile + Desktop)

---

## 🚀 DEPLOY (Vercel)

```bash
# Conecta GitHub ao Vercel
vercel login
vercel link

# Deploy
vercel

# Ou just: git push (auto deploy com GitHub)
```

---

## 📞 PRÓXIMOS PASSOS

1. ✅ Setup as variáveis de ambiente
2. ✅ Rode `npm run dev`
3. ✅ Teste o app localmente
4. ✅ Faça deploy em Vercel
5. ✅ Lança a campanha Meta

**BOA SORTE!** 🚀

Claude está aqui 24/7 pra ajudar! 💪
