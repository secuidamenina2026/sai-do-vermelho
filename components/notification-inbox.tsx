'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { defaultPreferences, Notice, Preferences, safeTipPath } from '@/lib/tips'

export function NotificationInbox({ preview = false }: { preview?: boolean }) {
  const [notices, setNotices] = useState<Notice[]>([])
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences)
  const [admin, setAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    try {
      if (preview) {
        setNotices(JSON.parse(localStorage.getItem('sdv-pr2-notices-v1') || '[]'))
        setPreferences(JSON.parse(localStorage.getItem('sdv-pr2-preferences-v1') || '{"tips_enabled":true,"offers_enabled":false}'))
      } else {
        const response = await fetch('/api/notifications', { cache: 'no-store' }); const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setNotices(data.notices); setPreferences(data.preferences); setAdmin(data.admin)
      }
      setError('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível carregar as notificações.') }
    finally { setLoading(false) }
  }, [preview])
  useEffect(() => {
    void load(); window.addEventListener('focus', load); window.addEventListener('sdv-preview-update', load)
    const timer = setInterval(() => { if (!document.hidden) void load() }, 60000)
    return () => { clearInterval(timer); window.removeEventListener('focus', load); window.removeEventListener('sdv-preview-update', load) }
  }, [load])
  const change = async (body: Record<string, unknown>) => {
    setBusy(true); setError('')
    try {
      if (preview) {
        if (body.action === 'preferences') localStorage.setItem('sdv-pr2-preferences-v1', JSON.stringify(body))
        else localStorage.setItem('sdv-pr2-notices-v1', JSON.stringify(notices.map(item => item.id === body.id ? { ...item, read_at: new Date().toISOString() } : item)))
      } else {
        const response = await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Não foi possível salvar.')
      }
      await load()
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível salvar.') }
    finally { setBusy(false) }
  }
  return <section className="card space-y-5" aria-label="Notificações">
    <div className="flex flex-wrap justify-between gap-3"><h2 className="text-xl font-bold">{preview ? 'Caixa de teste' : 'Suas notificações'} · {notices.filter(item => !item.read_at).length} não lidas</h2>{admin && <Link className="font-bold text-emerald-700 underline" href="/dashboard/dicas/gerenciar">Gerenciar dicas e envios</Link>}</div>
    {error && <p role="alert" className="text-red-700">{error} <button onClick={load} className="underline">Tentar novamente</button></p>}
    <fieldset disabled={busy || loading} className="space-y-3"><legend className="mb-2 font-bold">O que você quer receber?</legend><label className="flex items-center gap-2"><input type="checkbox" checked={preferences.tips_enabled} onChange={e => change({ action: 'preferences', ...preferences, tips_enabled: e.target.checked })} />Dicas educativas dentro do app</label><label className="flex items-center gap-2"><input type="checkbox" checked={preferences.offers_enabled} onChange={e => change({ action: 'preferences', ...preferences, offers_enabled: e.target.checked })} />Ofertas e novidades comerciais</label></fieldset>
    {loading ? <p>Carregando notificações…</p> : !error && notices.length === 0 ? <p className="text-slate-500">Nenhuma notificação por enquanto.</p> : <ul className="divide-y">{notices.map(item => <li key={item.id} className="space-y-2 py-4"><h3 className="font-bold">{!item.read_at && <span className="mr-2 text-emerald-600">●</span>}{item.title}</h3><p className="whitespace-pre-wrap text-slate-600">{item.body}</p><div className="flex gap-5 text-sm font-bold">{!preview && safeTipPath(item.href) && <Link className="text-emerald-700 underline" href={item.href}>Abrir no app</Link>}{!item.read_at && <button disabled={busy} onClick={() => change({ action: 'read', id: item.id })} className="underline">Marcar como lida</button>}</div></li>)}</ul>}
  </section>
}
