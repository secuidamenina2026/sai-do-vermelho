export type Campaign = {
  id: string; title: string; body: string; href: string; kind: 'tip' | 'offer'
  status: 'draft' | 'scheduled' | 'sent' | 'canceled'; scheduled_at: string | null
  created_at: string; delivered_count: number
}
export type Notice = { id: string; title: string; body: string; href: string; kind: 'tip' | 'offer'; created_at: string; read_at: string | null }
export type Preferences = { tips_enabled: boolean; offers_enabled: boolean }
export const defaultPreferences: Preferences = { tips_enabled: false, offers_enabled: false }
export function safeTipPath(value: unknown): value is string {
  return typeof value === 'string' && /^\/dashboard(?:\/[a-z0-9-]+)*$/.test(value)
}
export function validateCampaign(value: Record<string, unknown>, now = Date.now()) {
  const title = typeof value.title === 'string' ? value.title.trim() : ''
  const body = typeof value.body === 'string' ? value.body.trim() : ''
  if (!title || title.length > 120 || !body || body.length > 2000) throw new Error('Informe título (até 120 caracteres) e texto (até 2.000).')
  if (!safeTipPath(value.href)) throw new Error('Escolha um destino dentro do painel.')
  if (value.kind !== 'tip' && value.kind !== 'offer') throw new Error('Tipo inválido.')
  if (value.status !== 'draft' && value.status !== 'scheduled') throw new Error('Situação inválida.')
  const date = typeof value.scheduled_at === 'string' ? Date.parse(value.scheduled_at) : NaN
  if (value.status === 'scheduled' && (!Number.isFinite(date) || date <= now)) throw new Error('Escolha uma data e hora futuras.')
  return { title, body, href: value.href, kind: value.kind, status: value.status, scheduled_at: value.status === 'scheduled' ? new Date(date).toISOString() : null }
}
