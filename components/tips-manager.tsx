'use client'

import { useCallback, useEffect, useState } from 'react'
import { Campaign, validateCampaign } from '@/lib/tips'

const previewKey = 'sdv-pr2-campaigns-v1'
const statusLabels = { draft: 'Rascunho', scheduled: 'Agendado', sent: 'Enviado', canceled: 'Cancelado' }
export function TipsManager({ preview = false }: { preview?: boolean }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ title: '', body: '', href: '/dashboard/entradas', kind: 'tip', date: '' })

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      if (preview) setCampaigns(JSON.parse(localStorage.getItem(previewKey) || '[]'))
      else {
        const response = await fetch('/api/tips', { cache: 'no-store' }); const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setCampaigns(data.campaigns)
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Falha ao carregar o painel.') }
    finally { setLoading(false) }
  }, [preview])
  useEffect(() => { void load() }, [load])

  const persistPreview = (items: Campaign[]) => {
    localStorage.setItem(previewKey, JSON.stringify(items)); setCampaigns(items)
  }
  const save = async (status: 'draft' | 'scheduled') => {
    setBusy(true); setError(''); setMessage('')
    try {
      const payload = validateCampaign({ ...form, status, scheduled_at: form.date ? new Date(form.date).toISOString() : null })
      if (preview) persistPreview([{ ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString(), delivered_count: 0 } as Campaign, ...campaigns])
      else {
        const response = await fetch('/api/tips', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        const data = await response.json(); if (!response.ok) throw new Error(data.error)
        setCampaigns(items => [data.campaign, ...items])
      }
      setForm({ title: '', body: '', href: '/dashboard/entradas', kind: 'tip', date: '' })
      setMessage(status === 'draft' ? 'Rascunho salvo.' : 'Agendamento salvo. O envio ocorrerá na primeira rodada diária após a data escolhida.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível salvar.') }
    finally { setBusy(false) }
  }
  const cancel = async (id: string) => {
    setBusy(true); setError(''); setMessage('')
    try {
      if (preview) persistPreview(campaigns.map(item => item.id === id ? { ...item, status: 'canceled' } : item))
      else {
        const response = await fetch('/api/tips', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
        const data = await response.json(); if (!response.ok) throw new Error(data.error)
        setCampaigns(items => items.map(item => item.id === id ? data.campaign : item))
      }
      setMessage('Envio cancelado.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Falha ao cancelar.') }
    finally { setBusy(false) }
  }
  const simulate = () => {
    try {
      const scheduled = campaigns.filter(item => item.status === 'scheduled')
      const existing = JSON.parse(localStorage.getItem('sdv-pr2-notices-v1') || '[]')
      const preferences = JSON.parse(localStorage.getItem('sdv-pr2-preferences-v1') || '{"tips_enabled":true,"offers_enabled":false}')
      const eligible = scheduled.filter(item => item.kind === 'offer' ? preferences.offers_enabled : preferences.tips_enabled)
      localStorage.setItem('sdv-pr2-notices-v1', JSON.stringify([...eligible.map(item => ({ ...item, read_at: null })), ...existing]))
      persistPreview(campaigns.map(item => item.status === 'scheduled' ? { ...item, status: 'sent', delivered_count: eligible.some(tip => tip.id === item.id) ? 1 : 0 } : item))
      setMessage(`Simulação: ${eligible.length} notificação(ões). O relógio foi avançado até os agendamentos; confira a caixa de teste abaixo.`)
      window.dispatchEvent(new Event('sdv-preview-update'))
    } catch { setError('Não foi possível salvar a simulação neste navegador.') }
  }
  return <section className="space-y-6">
    <header><p className="text-sm font-bold uppercase text-emerald-700">Administração</p><h1 className="mt-2 text-3xl font-bold">Painel de dicas e envios</h1><p className="mt-3 text-slate-600">Prepare conteúdos e acompanhe a entrega dentro do app. Rodada diária às 9h, horário de Brasília, após ativação.</p></header>
    {error && <div role="alert" className="card text-red-700">{error}<button className="ml-3 underline" onClick={load}>Tentar novamente</button></div>}
    {message && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-900">{message}</p>}
    <div className="grid gap-6 lg:grid-cols-2">
      <form className="card space-y-4" onSubmit={event => { event.preventDefault(); void save('scheduled') }}>
        <h2 className="text-xl font-bold">Novo conteúdo</h2>
        <label className="label">Título<input className="input mt-2" required maxLength={120} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
        <label className="label">Mensagem<textarea className="input mt-2" rows={5} required maxLength={2000} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} /></label>
        <label className="label">Tipo<select className="input mt-2" value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })}><option value="tip">Dica educativa</option><option value="offer">Oferta (somente quem autorizar)</option></select></label>
        <label className="label">Destino<select className="input mt-2" value={form.href} onChange={e => setForm({ ...form, href: e.target.value })}><option value="/dashboard/entradas">Entradas</option><option value="/dashboard/gastos">Gastos</option><option value="/dashboard/renda-extra">Renda extra</option><option value="/dashboard/dividas">Dívidas</option><option value="/dashboard/metas">Metas</option></select></label>
        <label className="label">Disponível para envio a partir de<input className="input mt-2" type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label>
        <p className="text-sm text-slate-500">Horário do seu dispositivo. A fila é processada diariamente às 9h de Brasília, sem garantia de envio no minuto escolhido.</p>
        <div className="flex flex-wrap gap-3"><button disabled={busy || loading} className="btn btn-primary">Agendar envio</button><button type="button" disabled={busy || loading} className="btn btn-secondary" onClick={() => save('draft')}>Salvar rascunho</button></div>
      </form>
      <aside className="card self-start"><p className="text-sm font-bold text-slate-500">Prévia da notificação</p><h2 className="mt-4 text-xl font-bold">{form.title || 'O título aparece aqui'}</h2><p className="mt-3 whitespace-pre-wrap text-slate-600">{form.body || 'Sua mensagem será exibida na central de dicas de quem autorizou o recebimento.'}</p><p className="mt-5 font-bold text-emerald-700">Abrir no app →</p></aside>
    </div>
    <section className="card"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">Histórico de envios</h2>{preview && <button disabled={busy || !campaigns.some(item => item.status === 'scheduled')} onClick={simulate} className="btn btn-secondary">Simular rodada de envio</button>}</div>
      {loading ? <p className="mt-4">Carregando…</p> : campaigns.length === 0 ? <p className="mt-4 text-slate-500">Nenhum conteúdo criado.</p> : <ul className="mt-4 divide-y">{campaigns.map(item => <li key={item.id} className="flex flex-wrap justify-between gap-4 py-4"><div><h3 className="font-bold">{item.title}</h3><p className="text-sm text-slate-500">{statusLabels[item.status]} · {item.kind === 'offer' ? 'Oferta' : 'Dica'}{item.scheduled_at && ` · ${new Date(item.scheduled_at).toLocaleString('pt-BR')}`}</p>{item.status === 'sent' && <p className="text-sm">{item.delivered_count} entrega(s)</p>}</div>{['draft', 'scheduled'].includes(item.status) && <button disabled={busy} className="text-sm font-bold text-red-700" onClick={() => cancel(item.id)}>Cancelar</button>}</li>)}</ul>}
    </section>
  </section>
}
