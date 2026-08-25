'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/financial'

type Income = { id:string; description:string; amount:number; category:string; expected_date:string; received_date:string|null; status:'expected'|'received'|'canceled'; is_recurring:boolean }
const categories = [['salary','Salário'],['commission','Comissão'],['extra','Trabalho extra'],['benefit','Benefício'],['refund','Reembolso'],['sale','Venda'],['other','Outra entrada']]

export default function IncomeEntries() {
  const [entries,setEntries] = useState<Income[]>([])
  const [loading,setLoading] = useState(true)
  const [saving,setSaving] = useState(false)
  const [errorMessage,setErrorMessage] = useState('')
  const [showForm,setShowForm] = useState(false)
  const [form,setForm] = useState({description:'',amount:'',category:'salary',expected_date:new Date().toISOString().slice(0,10),is_recurring:false})

  const load = async () => {
    const { data:{user} } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('income_entries').select('*').eq('user_id',user.id).order('expected_date',{ascending:false})
    setEntries(data || []); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const add = async (event:React.FormEvent) => {
    event.preventDefault()
    setErrorMessage('')
    setSaving(true)
    const { data:{user} } = await supabase.auth.getUser()
    if (!user) { setErrorMessage('Sua sessão expirou. Entre novamente para salvar.'); setSaving(false); return }
    const { data,error } = await supabase.from('income_entries').insert({...form,user_id:user.id,amount:Number(form.amount),status:'expected',recurrence:form.is_recurring?'monthly':null}).select().single()
    if (!error && data) { setEntries(current=>[data,...current]); setShowForm(false); setForm({...form,description:'',amount:''}) }
    else setErrorMessage(error?.message || 'Não foi possível salvar a entrada. Tente novamente.')
    setSaving(false)
  }
  const receive = async (entry:Income) => {
    const { data,error } = await supabase.from('income_entries').update({status:'received',received_date:new Date().toISOString().slice(0,10)}).eq('id',entry.id).select().single()
    if (!error && data) setEntries(current=>current.map(item=>item.id===entry.id?data:item))
  }
  const metrics = useMemo(() => {
    const month=new Date().toISOString().slice(0,7)
    const current=entries.filter(item=>item.expected_date.startsWith(month))
    return {expected:current.filter(item=>item.status==='expected').reduce((s,i)=>s+i.amount,0),received:current.filter(item=>item.status==='received').reduce((s,i)=>s+i.amount,0)}
  },[entries])
  if (loading) return <div>Carregando entradas…</div>
  return <div className="space-y-8">
    <div><p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Entradas e renda</p><h1 className="mt-1 text-3xl font-bold">Tudo que entra também precisa de destino</h1><p className="mt-2 text-gray-600">Separe o que estava previsto do que realmente foi recebido.</p></div>
    <div className="grid gap-4 md:grid-cols-3"><div className="card"><p className="text-sm text-gray-600">Recebido no mês</p><p className="text-3xl font-bold text-emerald-700">{formatCurrency(metrics.received)}</p></div><div className="card"><p className="text-sm text-gray-600">Ainda previsto</p><p className="text-3xl font-bold text-blue-700">{formatCurrency(metrics.expected)}</p></div><button onClick={()=>setShowForm(true)} className="card text-left hover:shadow-md"><p className="text-2xl">＋</p><p className="mt-2 font-bold">Nova entrada</p></button></div>
    {showForm && <form onSubmit={add} className="card grid gap-4 md:grid-cols-2"><div className="md:col-span-2 flex justify-between"><h2 className="text-xl font-bold">Registrar entrada</h2><button type="button" onClick={()=>setShowForm(false)}>✕</button></div>{errorMessage && <div role="alert" className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{errorMessage}</div>}<div><label className="label">Descrição</label><input required className="input" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div><div><label className="label">Valor</label><input required className="input" type="number" min="0.01" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} /></div><div><label className="label">Categoria</label><select className="input" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div><div><label className="label">Data prevista</label><input required className="input" type="date" value={form.expected_date} onChange={e=>setForm({...form,expected_date:e.target.value})} /></div><label className="md:col-span-2 flex gap-2"><input type="checkbox" checked={form.is_recurring} onChange={e=>setForm({...form,is_recurring:e.target.checked})} /> Repetir mensalmente</label><button disabled={saving} className="btn btn-primary md:col-span-2 disabled:cursor-not-allowed disabled:opacity-60">{saving?'Salvando…':'Salvar entrada'}</button></form>}
    <div className="card"><h2 className="text-xl font-bold">Histórico de entradas</h2><div className="mt-4 space-y-3">{entries.length===0?<p className="py-8 text-center text-gray-500">Nenhuma entrada registrada.</p>:entries.map(entry=><div key={entry.id} className="flex flex-col gap-3 border-b py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{entry.description}</p><p className="text-sm text-gray-500">{new Date(entry.expected_date+'T12:00:00').toLocaleDateString('pt-BR')} · {categories.find(item=>item[0]===entry.category)?.[1]}</p></div><div className="flex items-center gap-3"><b>{formatCurrency(entry.amount)}</b>{entry.status==='expected'?<button onClick={()=>receive(entry)} className="rounded-lg bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-800">Marcar recebido</button>:<span className="text-sm font-bold text-emerald-700">✓ Recebido</span>}</div></div>)}</div></div>
  </div>
}
