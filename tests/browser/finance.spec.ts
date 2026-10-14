import { test, expect } from '@playwright/test'

// Browser contract tests use a fake HTTP backend. Actual SQL durability/RLS is tested separately.
test('forms retain errors and reload saved entries/expenses; failed delete retains row', async ({ page, context }) => {
  const user = { id: '11111111-1111-4111-8111-111111111111', email: 'test@example.invalid', aud: 'authenticated' }
  const session = { access_token: 'test-only', refresh_token: 'test-only', expires_at: Math.floor(Date.now() / 1000) + 3600, user }
  await context.addCookies([{ name: 'sb-127-auth-token', value: encodeURIComponent(JSON.stringify(session)), domain: '127.0.0.1', path: '/' }])
  const records: Record<string, Record<string, unknown>[]> = { income_entries: [], expenses: [] }
  let failInsert = true; let failDelete = true
  await page.route('**/api/access/status', route => route.fulfill({ json: { active: true } }))
  await page.route('http://127.0.0.1:54321/**', async route => {
    const req = route.request(); const path = new URL(req.url()).pathname
    const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' }
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 200, headers })
    if (path.endsWith('/user')) return route.fulfill({ json: user, headers })
    const table = path.split('/').pop()!
    if (table === 'users') return route.fulfill({ json: { ...user, onboarding_completed: true }, headers })
    if (!records[table]) return route.fulfill({ json: req.headers().accept?.includes('object') ? null : [], headers })
    if (req.method() === 'POST') {
      if (failInsert) { failInsert = false; return route.fulfill({ status: 503, json: { message: 'Database unavailable' }, headers }) }
      const raw = req.postDataJSON(); const item = { ...(Array.isArray(raw) ? raw[0] : raw), id: crypto.randomUUID(), created_at: new Date().toISOString() }
      records[table].push(item); return route.fulfill({ json: item, headers })
    }
    if (req.method() === 'PATCH') {
      Object.assign(records[table][0], req.postDataJSON()); return route.fulfill({ json: records[table][0], headers })
    }
    if (req.method() === 'DELETE') {
      if (failDelete) { failDelete = false; return route.fulfill({ status: 503, json: { message: 'Delete failed' }, headers }) }
      const item = records[table].pop(); return route.fulfill({ json: item, headers })
    }
    return route.fulfill({ json: records[table], headers })
  })
  await page.goto('/dashboard/entradas')
  await page.getByRole('button', { name: /Nova entrada/ }).click()
  await page.locator('form input').nth(0).fill('Entrada PR2')
  await page.locator('form input[type=number]').fill('123.45')
  await page.getByRole('button', { name: 'Salvar entrada' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Não foi possível' })).toContainText('Não foi possível salvar')
  await expect(page.locator('form input').nth(0)).toHaveValue('Entrada PR2')
  await page.getByRole('button', { name: 'Salvar entrada' }).click()
  await expect(page.getByText('Entrada PR2', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText('Entrada PR2', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Marcar recebido' }).click()
  await expect(page.getByText('✓ Recebido')).toBeVisible()
  await page.reload(); await expect(page.getByText('✓ Recebido')).toBeVisible()

  await page.goto('/dashboard/gastos')
  await page.getByRole('button', { name: '+ Novo Gasto' }).click()
  await page.getByPlaceholder('Ex.: Conta de energia').fill('Gasto PR2')
  await page.getByPlaceholder('0,00').fill('45.67')
  failInsert = true
  await page.getByRole('button', { name: 'Adicionar Gasto', exact: true }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Não foi possível' })).toContainText('Não foi possível salvar')
  await expect(page.getByPlaceholder('Ex.: Conta de energia')).toHaveValue('Gasto PR2')
  await page.getByRole('button', { name: 'Adicionar Gasto', exact: true }).click()
  await expect(page.getByText('Gasto PR2', { exact: true })).toBeVisible()
  await page.reload(); await expect(page.getByText('Gasto PR2', { exact: true })).toBeVisible()
  page.on('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Deletar' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Não foi possível' })).toContainText('Não foi possível remover')
  await expect(page.getByText('Gasto PR2', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Deletar' }).click()
  await expect(page.getByText('Gasto PR2', { exact: true })).toHaveCount(0)
})
