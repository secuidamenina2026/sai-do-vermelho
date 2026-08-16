'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Profile = { full_name?: string | null; financial_goal?: string | null }
type Budget = { monthly_income: number; essentials_budget: number; desires_budget: number; savings_budget: number }
type Expense = { id: string; category: string; description?: string | null; notes?: string | null; actual_amount: number }
type Debt = { id: string; creditor: string; total_amount: number; original_amount?: number | null; monthly_payment?: number | null; is_paid: boolean }
type Goal = { id: string; goal_name: string; target_amount: number; saved_amount: number }

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function DashboardSkeleton() {
  return <div className="space-y-6 animate-pulse"><div className="h-20 rounded-3xl bg-slate-200"/><div className="h-72 rounded-3xl bg-slate-200"/><div className="grid gap-4 md:grid-cols-4">{[1,2,3,4].map(item => <div key={item} className="h-28 rounded-2xl bg-slate-200" />)}</div></div>
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile>({})
  const [budget, setBudget] = useState<Budget | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const month = `${new Date().toISOString().slice(0, 7)}-01`
        const [profileResult, budgetResult, expensesResult, debtsResult, goalsResult] = await Promise.all([
          supabase.from('users').select('full_name, financial_goal').eq('id', user.id).maybeSingle(),
          supabase.from('monthly_budgets').select('monthly_income, essentials_budget, desires_budget, savings_budget').eq('user_id', user.id).eq('month', month).maybeSingle(),
          supabase.from('expenses').select('id, category, description, notes, actual_amount').eq('user_id', user.id).gte('month', month).order('created_at', { ascending: false }).limit(6),
          supabase.from('debts').select('id, creditor, total_amount, original_amount, monthly_payment, is_paid').eq('user_id', user.id).eq('is_paid', false),
          supabase.from('goals').select('id, goal_name, target_amount, saved_amount').eq('user_id', user.id).eq('is_completed', false).order('priority').limit(1),
        ])
        setProfile(profileResult.data || { full_name: user.user_metadata?.full_name })
        setBudget(budgetResult.data)
        setExpenses(expensesResult.data || [])
        setDebts(debtsResult.data || [])
        setGoals(goalsResult.data || [])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const metrics = useMemo(() => {
    const income = Number(budget?.monthly_income || 0)
    const spent = expenses.reduce((sum, item) => sum + Number(item.actual_amount || 0), 0)
    const debtTotal = debts.reduce((sum, item) => sum + Number(item.total_amount || 0), 0)
    const originalDebt = debts.reduce((sum, item) => sum + Number(item.original_amount || item.total_amount || 0), 0)
    const monthlyPayment = debts.reduce((sum, item) => sum + Number(item.monthly_payment || 0), 0)
    const debtPaid = Math.max(0, originalDebt - debtTotal)
    const debtProgress = originalDebt > 0 ? Math.min(100, Math.round((debtPaid / originalDebt) * 100)) : 100
    const available = income - spent
    let score = 35
    if (income > 0) score += 20
    if (spent <= income && income > 0) score += 15
    if (budget && Number(budget.savings_budget) > 0) score += 10
    if (debtTotal === 0) score += 20
    else if (income > 0 && monthlyPayment / income <= .3) score += 10
    score = Math.min(100, score)
    return { income, spent, debtTotal, originalDebt, monthlyPayment, debtPaid, debtProgress, available, score }
  }, [budget, debts, expenses])

  if (loading) return <DashboardSkeleton />

  const firstName = profile.full_name?.trim().split(' ')[0] || 'você'
  const mission = !budget?.monthly_income
    ? { title: 'Informe sua renda mensal', copy: 'Esse é o primeiro passo para o sistema calcular sua rota.', href: '/dashboard/orcamento', cta: 'Informar renda' }
    : debts.length > 0
      ? { title: 'Defina sua ordem de quitação', copy: 'Compare as estratégias e escolha a primeira dívida que vai sair da sua vida.', href: '/dashboard/plano', cta: 'Ver meu plano' }
      : expenses.length === 0
        ? { title: 'Registre seu primeiro gasto', copy: 'Leva menos de um minuto e deixa seu painel mais inteligente.', href: '/dashboard/gastos', cta: 'Registrar gasto' }
        : { title: 'Revise seu diagnóstico mensal', copy: 'Transforme seus números em uma decisão clara para os próximos sete dias.', href: '/dashboard/resumo', cta: 'Ver diagnóstico' }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-black uppercase tracking-[.18em] text-emerald-600">Sua central financeira</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Olá, {firstName}. Vamos avançar?</h1><p className="mt-2 text-slate-500">Uma decisão possível por vez.</p></div>
        <Link href="/dashboard/gastos" className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800">+ Registrar gasto</Link>
      </header>

      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl md:p-9">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-300">Seu plano de virada</span><span className="text-sm text-slate-400">Saúde financeira: {metrics.score}/100</span></div>
            <h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight md:text-4xl">{metrics.debtTotal > 0 ? 'Sua liberdade já tem uma rota.' : 'Agora é hora de construir proteção.'}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">{metrics.debtTotal > 0 ? `Você tem ${money.format(metrics.debtTotal)} em dívidas ativas. Organize a ordem, simule pagamentos extras e acompanhe cada vitória.` : 'Sem dívidas ativas, sua prioridade passa a ser formar uma reserva que proteja suas próximas decisões.'}</p>
            <div className="mt-7 h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${metrics.debtProgress}%` }} /></div>
            <div className="mt-2 flex justify-between text-xs text-slate-400"><span>{metrics.debtTotal > 0 ? `${metrics.debtProgress}% das dívidas eliminadas` : 'Etapa de construção'}</span><span>Liberdade financeira</span></div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[.06] p-5 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[.16em] text-emerald-300">Missão desta semana</p><h3 className="mt-3 text-xl font-black">{mission.title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{mission.copy}</p><Link href={mission.href} className="mt-5 inline-flex items-center gap-2 font-black text-emerald-300 hover:text-emerald-200">{mission.cta} →</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Renda do mês', money.format(metrics.income), 'Tudo que entrou'],
          ['Gastos registrados', money.format(metrics.spent), metrics.income > 0 ? `${Math.round(metrics.spent / metrics.income * 100)}% da renda` : 'Comece a registrar'],
          ['Disponível agora', money.format(metrics.available), metrics.available >= 0 ? 'Dentro do limite' : 'Atenção ao orçamento'],
          ['Dívidas ativas', money.format(metrics.debtTotal), `${debts.length} compromisso${debts.length === 1 ? '' : 's'}`],
        ].map(([label, value, note], index) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className={`mb-5 h-1.5 w-10 rounded-full ${index === 2 && metrics.available < 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} /><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-400">{note}</p></article>)}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Método adaptativo</p><h2 className="mt-2 text-xl font-black">Destino da sua renda</h2></div><Link href="/dashboard/orcamento" className="text-sm font-bold text-emerald-700 hover:underline">Ajustar</Link></div>
          <div className="mt-7 space-y-6">
            {[
              ['Essenciais', Number(budget?.essentials_budget || 0), 'bg-emerald-500'],
              ['Qualidade de vida', Number(budget?.desires_budget || 0), 'bg-sky-500'],
              [metrics.debtTotal > 0 ? 'Quitação e futuro' : 'Reserva e futuro', Number(budget?.savings_budget || 0), 'bg-violet-500'],
            ].map(([label, value, color]) => {
              const percentage = metrics.income > 0 ? Math.round(Number(value) / metrics.income * 100) : 0
              return <div key={String(label)}><div className="mb-2 flex items-center justify-between text-sm"><span className="font-bold text-slate-700">{label}</span><span className="text-slate-500">{money.format(Number(value))} · {percentage}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, percentage)}%` }} /></div></div>
            })}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Este mês</p><h2 className="mt-2 text-xl font-black">Últimos movimentos</h2></div><Link href="/dashboard/gastos" className="text-sm font-bold text-emerald-700 hover:underline">Ver todos</Link></div>
          <div className="mt-5 divide-y divide-slate-100">
            {expenses.length === 0 ? <div className="rounded-2xl bg-slate-50 px-5 py-10 text-center"><p className="font-bold text-slate-700">Seu histórico começa aqui</p><p className="mt-1 text-sm text-slate-500">Registre um gasto para enxergar seus padrões.</p></div> : expenses.map(expense => <div key={expense.id} className="flex items-center justify-between gap-4 py-3.5"><div className="min-w-0"><p className="truncate font-bold capitalize text-slate-800">{expense.description || expense.category}</p><p className="truncate text-xs capitalize text-slate-400">{expense.category}{expense.notes ? ` · ${expense.notes}` : ''}</p></div><p className="shrink-0 font-black text-slate-900">{money.format(Number(expense.actual_amount))}</p></div>)}
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/plano" className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"><span className="text-xs font-black uppercase tracking-wider text-emerald-600">Sua rota</span><h3 className="mt-7 text-xl font-black">Plano de quitação</h3><p className="mt-2 text-sm leading-6 text-slate-500">Descubra a melhor ordem e simule quando cada dívida termina.</p><p className="mt-5 font-black text-slate-900">Abrir plano <span className="inline-block transition group-hover:translate-x-1">→</span></p></Link>
        <Link href="/dashboard/resumo" className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl"><span className="text-xs font-black uppercase tracking-wider text-violet-600">Inteligência</span><h3 className="mt-7 text-xl font-black">Diagnóstico mensal</h3><p className="mt-2 text-sm leading-6 text-slate-500">Veja sua vitória, seu alerta e a decisão mais importante da semana.</p><p className="mt-5 font-black text-slate-900">Analisar agora <span className="inline-block transition group-hover:translate-x-1">→</span></p></Link>
        <Link href="/dashboard/reserva" className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl"><span className="text-xs font-black uppercase tracking-wider text-sky-600">Proteção</span><h3 className="mt-7 text-xl font-black">Primeira reserva</h3><p className="mt-2 text-sm leading-6 text-slate-500">Calcule sua proteção de três e seis meses com base na vida real.</p><p className="mt-5 font-black text-slate-900">Construir reserva <span className="inline-block transition group-hover:translate-x-1">→</span></p></Link>
      </section>

      {goals[0] && <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-emerald-700">Meta em destaque</p><h2 className="mt-2 text-xl font-black">{goals[0].goal_name}</h2><p className="mt-1 text-sm text-emerald-900/70">{money.format(Number(goals[0].saved_amount))} de {money.format(Number(goals[0].target_amount))}</p></div><Link href="/dashboard/metas" className="font-black text-emerald-800">Continuar avançando →</Link></div></section>}
    </div>
  )
}
