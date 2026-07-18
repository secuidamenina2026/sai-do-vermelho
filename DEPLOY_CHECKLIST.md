# 🚀 DEPLOYMENT CHECKLIST - SAI DO VERMELHO

**Status:** ✅ CÓDIGO PRONTO PARA DEPLOY
**Git:** ✅ Primeiro commit feito (ID: 9cc3ff7)
**Branch:** master

---

## 📋 TODO LIST (Na Ordem)

### ✅ FEITO (Claude):
- [x] Código completo escrito (986 linhas)
- [x] npm install (406 packages)
- [x] Dev server testado (funcionando)
- [x] Git init + primeiro commit
- [x] Todos arquivos no git

### ⏳ VOCÊ FARÁ (Edu - 20 min):

#### 1. GitHub Setup (5 min)
- [ ] Criar repositório "sai-do-vermelho" em github.com/new
- [ ] Gerar Personal Access Token em Settings → Developer settings → Tokens
  - [ ] Marca: `repo`, `write:packages`, `delete:packages`
  - [ ] Copia o token e guarda em lugar seguro

#### 2. Git Push (2 min)
```bash
cd /tmp/sai-do-vermelho
git remote add origin https://github.com/SEU_USUARIO/sai-do-vermelho.git
git branch -M main
git push -u origin main
# (vai pedir token - cola o Personal Access Token)
```

#### 3. Vercel Setup (5 min)
- [ ] Ir em vercel.com
- [ ] Clica "Sign Up" → escolhe "GitHub"
- [ ] Autoriza GitHub
- [ ] Clica "New Project"
- [ ] Seleciona "sai-do-vermelho"
- [ ] Clica "Import"

#### 4. Environment Variables no Vercel (5 min)
- [ ] Settings → Environment Variables
- [ ] Adiciona 6 variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...
ANTHROPIC_API_KEY=sk-ant-v0-...
NEXT_PUBLIC_APP_URL=https://sai-do-vermelho.vercel.app
```

- [ ] Clica "Deployments" → "Redeploy" pra aplicar variáveis

#### 5. Verificar Deploy
- [ ] Vai em vercel.com/dashboard
- [ ] Projeto "sai-do-vermelho"
- [ ] Status deve mostrar "Ready" (checkmark verde)
- [ ] Clica no link do projeto
- [ ] Landing page abre? ✅

---

## 📊 Resumo do que foi feito

| Tarefa | Status | Quem |
|--------|--------|------|
| Código | ✅ 100% pronto | Claude |
| Tests | ✅ Dev server ok | Claude |
| Git setup | ✅ Primeiro commit | Claude |
| GitHub repo | ⏳ Você | Edu |
| Git push | ⏳ Você | Edu |
| Vercel import | ⏳ Você | Edu |
| Env vars | ⏳ Você | Edu |
| Deploy live | ⏳ Depende acima | Vercel (automático) |

---

## 🔑 Próximo Passo

**Você precisa fazer:**

1. Criar repo no GitHub
2. Gerar Personal Access Token
3. Fazer `git push`
4. Conectar ao Vercel
5. Adicionar variáveis de ambiente

**Tudo em ~20 minutos!**

Depois disso, qualquer `git push` vai automaticamente fazer deploy.

---

## 🆘 Se tiver erro

Avisa o erro específico que Claude resolve na hora!

---

**Você consegue fazer esses 5 passos agora?** ✅
