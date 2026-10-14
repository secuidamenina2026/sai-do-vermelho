import { test } from 'node:test'
import assert from 'node:assert/strict'
import { safeTipPath, validateCampaign } from '../lib/tips'
test('campaign input rejects unsafe links and invalid schedules', () => {
  const valid = { title: ' Dica ', body: 'Mensagem', href: '/dashboard/gastos', kind: 'tip', status: 'scheduled', scheduled_at: '2030-01-01T12:00:00Z' }
  assert.equal(validateCampaign(valid, 0).title, 'Dica')
  for (const href of ['//evil.test','javascript:alert(1)','/dashboard/../api','https://evil.test','/dashboard?redirect=evil']) assert.equal(safeTipPath(href), false)
  assert.throws(() => validateCampaign({ ...valid, scheduled_at: 'invalid' }))
  assert.throws(() => validateCampaign({ ...valid, scheduled_at: '2020-01-01' }))
  assert.throws(() => validateCampaign({ ...valid, title: ' ' }))
  assert.throws(() => validateCampaign({ ...valid, body: 'x'.repeat(2001) }))
  assert.throws(() => validateCampaign({ ...valid, status: 'sent' }))
  assert.equal(validateCampaign({ ...valid, status: 'draft', scheduled_at: null }).scheduled_at, null)
})
