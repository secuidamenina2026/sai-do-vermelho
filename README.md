# SAI DO VERMELHO

Aplicação SaaS de finanças pessoais com consultoria IA powered by Claude.

## Stack Tech

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Payments:** Stripe
- **AI:** Anthropic Claude API
- **Hosting:** Vercel

## Começar

### 1. Instalação

\`\`\`bash
npm install
\`\`\`

### 2. Variáveis de Ambiente

Crie `.env.local`:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=seu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica
SUPABASE_SERVICE_KEY=sua_chave_service
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
\`\`\`

### 3. Banco de Dados

No Supabase SQL Editor, copie e execute o conteúdo de `database.sql`.

### 4. Desenvolvimento

\`\`\`bash
npm run dev
\`\`\`

Abra http://localhost:3000

## Deployment

Deploy para Vercel:

\`\`\`bash
git push
\`\`\`

Depois no painel Vercel:
1. Importe o repositório
2. Adicione as variáveis de ambiente
3. Deploy automático

## Features

✅ Autenticação com Supabase
✅ Método orçamentário 50-30-20
✅ Rastreio de gastos
✅ Gestor de dívidas
✅ Metas financeiras
✅ Consultoria IA com Claude
✅ Pagamentos com Stripe
✅ Painel responsivo

## Licença

Proprietary - SAI DO VERMELHO 2024
