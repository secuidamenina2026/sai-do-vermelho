'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/financial'

type Event = { id:string; date:string; title:string; amount:number; kind:'income'|'expense'|'debt'; status:string; href:string }

export default function FinancialCalendar() {
  const [events,setEvents] = useState<Event[]>([])
  const [loading,setLoading] = useState(true)
  const [month,setMonth] = useState(new Date().toISOString().slice(0,7))

  useEffect(() => { (async () => {
    const { data:{user} } = await supabase.auth.getUser(); if (!user) return
    const start=`${month}-01`; const end=new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).toISOString().slice(0,10)
    const [{data:expenses},{data:income},{data:debts}] = await Promise.all([
      supabase.from('expenses').select('id,description,notes,actual_amount,due_date,status').eq('user_id',user.id).gte('due_date',start).lte('due_date',end).neq('status','canceled'),
      supabase.from('income_entries').select('id,description,amount,expected_date,status').eq('user_id',user.id).gte('expected_date',start).lte('expected_date',end).neq('status','canceled'),
      supabase.from('debts').select('id,creditor,monthly_payment,due_day,is_paid').eq('user_id',user.id).eq('is_paid',false),
    ])
    const debtEvents=(debts||[]).filter((item:any)=>item.due_day).map((item:any)=>({id:`debt-${item.id}`,date:`${month}-${String(Math.min(item.due_day,28)).padStart(2,'0')}`,title:`Parcela · ${item.creditor}`,amount:Number(item.monthly_payment)||0,kind:'debt' as const,status:'planned',href:'/dashboard/dividas'}))
    setEvents([
      ...(expenses||[]).map((item:any)=>({id:item.id,date:item.due_date,title:item.description||item.notes||'Gasto',amount:Number(item.actual_amount)||0,kind:'expense' as const,status:item.status,href:'/dashboard/gastos'})),
      ...(income||[]).map((item:any)=>({id:item.id,date:item.expected_date,title:item.description,amount:Number(item.amount)||0,kind:'income' as const,status:item.status,href:'/dashboard/entradas'})),
      ...debtEvents,
    ].sort((a,b)=>a.date.localeCompare(b.date))); setLoading(false)
  })() },[month])

  const today=new Date().toISOString().slice(0,10)
  const groups=useMemo(()=>events.reduce<Record<string,Event[]>>((all,event)=>{(all[event.date] ||= []).push(event);return all},{}),[events])
  const overdue=events.filter(event=>event.date<today && !['paid','received'].includes(event.status))
  const expectedIn=events.filter(event=>event.kind==='income').reduce((s,e)=>s+e.amount,0)
  const expectedOut=events.filter(event=>event.kind!=='income').reduce((s,e)=>s+e.amount,0)

  return <div className="space-y-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-wide text-blue-700">Agenda financeira</p><h1 className="mt-1 text-3xl font-bold">Seu dinheiro antes que ele vença</h1><p className="mt-2 text-gray-600">Entradas, contas e parcelas reunidas em uma única linha do tempo.</p></div><input type="month" className="input max-w-xs" value={month} onChange={e=>{setLoading(true);setMonth(e.target.value)}} /></div>
    <div className="grid gap-4 md:grid-cols-3"><div className="card"><p className="text-sm text-gray-500">Entradas do mês</p><p className="text-2xl font-bold text-emerald-700">{formatCurrency(expectedIn)}</p></div><div className="card"><p className="text-sm text-gray-500">Compromissos do mês</p><p className="text-2xl font-bold text-red-700">{formatCurrency(expectedOut)}</p></div><div className={`card ${overdue.length?'border border-red-200 bg-red-50':''}`}><p className="text-sm text-gray-500">Atrasados</p><p className="text-2xl font-bold text-red-700">{overdue.length}</p></div></div>
    {loading?<div className="card">Montando seu calendário…</div>:events.length===0?<div className="card py-12 text-center"><p className="text-4xl">🗓️</p><h2 className="mt-3 text-xl font-bold">Mês livre por enquanto</h2><p className="mt-2 text-gray-500">Registre entradas ou gastos previstos para enxergar sua agenda.</p></div>:<div className="card"><div className="space-y-6">{Object.entries(groups).map(([date,items])=><section key={date} className="grid gap-3 border-b pb-5 last:border-0 md:grid-cols-[130px_1fr]"><div><p className="font-bold capitalize">{new Date(date+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'short'})}</p><p className="text-2xl font-bold">{new Date(date+'T12:00:00').getDate()}</p></div><div className="space-y-2">{items.map(event=><Link href={event.href} key={event.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-3 hover:bg-blue-50"><div><p className="font-bold">{event.kind==='income'?'💵':event.kind==='debt'?'📉':'💳'} {event.title}</p><p className={`text-xs font-bold ${event.date<today&&!['paid','received'].includes(event.status)?'text-red-700':'text-gray-500'}`}>{event.date<today&&!['paid','received'].includes(event.status)?'ATRASADO':event.status==='paid'||event.status==='received'?'CONCLUÍDO':'PREVISTO'}</p></div><b className={event.kind==='income'?'text-emerald-700':'text-red-700'}>{event.kind==='income'?'+ ':'- '}{formatCurrency(event.amount)}</b></Link>)}</div></section>)}</div></div>}
  </div>
}
