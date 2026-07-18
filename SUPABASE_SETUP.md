# 🗄️ SUPABASE SETUP - BANCO DE DADOS

**Quando fazer:** Antes de testar a app

---

## 📋 PASSO 1: Abra Supabase

1. Vai em **supabase.com/dashboard**
2. Clica no projeto "sai-do-vermelho"
3. Esquerda: clica **SQL Editor**

---

## 📝 PASSO 2: Copie e Cole Este SQL

Copie TODO o conteúdo do arquivo `database.sql` e cole no Supabase SQL Editor.

**Ou simplesmente:**

1. Abra o arquivo: `/tmp/sai-do-vermelho/database.sql`
2. Ctrl+A (seleciona tudo)
3. Ctrl+C (copia)
4. Cola no Supabase SQL Editor
5. Clica "Run"

---

## ✅ RESULTADO ESPERADO

Se funcionou, você vai ver:

```
✅ CREATE TABLE users
✅ CREATE TABLE monthly_budgets
✅ CREATE TABLE expenses
✅ CREATE TABLE debts
✅ CREATE TABLE goals
✅ CREATE TABLE ai_consultations
✅ CREATE TABLE subscriptions
✅ ALTER TABLE ... ENABLE ROW LEVEL SECURITY
✅ CREATE POLICY ...
```

---

## 🔑 PRÓXIMO: Pegar as Chaves

**Depois que tabelas forem criadas:**

1. Supabase → Settings → API
2. Copia:
   - `NEXT_PUBLIC_SUPABASE_URL` (URL do projeto)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Anon public key)
   - `SUPABASE_SERVICE_KEY` (Service role secret)

3. Cola esses valores em `.env.local`

---

## 🎯 Checklist

- [ ] Abriu Supabase SQL Editor
- [ ] Colou todo conteúdo de database.sql
- [ ] Clicou "Run"
- [ ] Viu checkmarks verdes (✅)
- [ ] Copiou as 3 chaves
- [ ] Preencheu `.env.local`

---

**Quando tudo isso estiver feito, a app vai conectar perfeitamente!** ✅
