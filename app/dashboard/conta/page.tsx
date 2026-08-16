'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const EXPORT_TABLES = ['users', 'monthly_budgets', 'income_entries', 'expenses', 'debts', 'debt_payments', 'goals', 'user_categories', 'ai_consultations'] as const

export default function MinhaConta() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)
      setEmail(user.email || '')
      const { data } = await supabase.from('users').select('full_name').eq('id', user.id).single()
      setName(data?.full_name || '')
      setLoading(false)
    }
    loadProfile()
  }, [])

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('users').update({ full_name: name.trim() }).eq('id', user.id)
    setMessage(error ? 'Não foi possível salvar. Tente novamente.' : 'Nome atualizado com sucesso.')
  }

  const exportData = async () => {
    setMessage('Preparando sua cópia...')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const entries = await Promise.all(EXPORT_TABLES.map(async (table) => {
      const key = table === 'users' ? 'id' : 'user_id'
      const { data, error } = await supabase.from(table).select('*').eq(key, user.id)
      return [table, error ? [] : data] as const
    }))
    const payload = {
      exported_at: new Date().toISOString(),
      account_email: user.email,
      data: Object.fromEntries(entries),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `sai-do-vermelho-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setMessage('Cópia baixada com sucesso.')
  }

  if (loading) return <p>Carregando sua conta...</p>

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-xl shadow-slate-950/15"><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">Seu espaço seguro</p><h1 className="mt-2 text-3xl font-black">Minha conta</h1><p className="mt-2 text-slate-300">Cuide dos seus dados e da segurança do acesso.</p></div>
      {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900" role="status">{message}</div>}
      <form onSubmit={saveProfile} className="card space-y-4">
        <h2 className="text-xl font-bold">Dados pessoais</h2>
        <div><label htmlFor="account-name" className="label">Nome</label><input id="account-name" className="input" value={name} onChange={(event) => setName(event.target.value)} required /></div>
        <div><label htmlFor="account-email" className="label">E-mail</label><input id="account-email" className="input bg-gray-50" value={email} disabled /></div>
        <button className="btn btn-primary">Salvar alterações</button>
      </form>
      <section className="card space-y-3">
        <h2 className="text-xl font-bold">Seus dados</h2>
        <p className="text-gray-600">Baixe uma cópia em JSON de tudo o que você registrou no Sai do Vermelho.</p>
        <button type="button" onClick={exportData} className="btn btn-secondary">Baixar meus dados</button>
      </section>
      <section className="card space-y-3">
        <h2 className="text-xl font-bold">Privacidade e suporte</h2>
        <p className="text-gray-600">Para solicitar a exclusão da conta e dos registros, fale com o atendimento oficial. Confirmaremos sua identidade antes de apagar qualquer informação.</p>
        <Link href="/privacidade" className="font-semibold text-emerald-700 hover:underline">Ler a Política de Privacidade</Link>
      </section>
    </div>
  )
}
