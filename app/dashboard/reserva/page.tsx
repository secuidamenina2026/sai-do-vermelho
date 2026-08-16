'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getExpenseCategory } from '@/lib/expense-categories'
import { formatCurrency } from '@/lib/financial'

type Goal = { id: string; goal_name: string; target_amount: number; saved_amount: number }
type Expense = { category: string; actual_amount: number }
type Debt = { monthly_payment: number | null }

const RESERVE_NAME = 'Reserva de emergência'

function monthsToReach(remaining: number, monthlyContribution: number) {
  if (remaining <= 0) return 0
  if (monthlyContribution <= 0) return null
  return Math.ceil(remaining / monthlyContribution)
}

function futureDate(months: number | null) {
  if (months === null) return 'defina um valor mensal'
  if (months === 0) return 'concluída'
  const date = new Date()
  date.setMonth(date.getMonth() + months)
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export default function EmergencyReserve() {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [income, setIncome] = useState(0)
  const [monthlyContribution, setMonthlyContribution] = useState(0)
  const [deposit, setDeposit] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const monthStart = `${new Date().toISOString().slice(0, 7)}-01`
        const [goalResult, expensesResult, budgetResult, debtsResult] = await Promise.all([
          supabase.from('goals').select('*').eq('user_id', user.id).ilike('goal_name', RESERVE_NAME).limit(1).maybeSingle(),
          supabase.from('expenses').select('category,actual_amount').eq('user_id', user.id).gte('month', monthStart),
          supabase.from('monthly_budgets').select('monthly_income').eq('user_id', user.id).eq('month', monthStart).single(),
          supabase.from('debts').select('monthly_payment').eq('user_id', user.id).eq('is_paid', false),
        ])
        setGoal(goalResult.data)
        setExpenses(expensesResult.data || [])
        setDebts(debtsResult.data || [])
        const monthlyIncome = budgetResult.data?.monthly_income || 0
        setIncome(monthlyIncome)
        setMonthlyContribution(Math.round(monthlyIncome * 0.1))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const metrics = useMemo(() => {
    const essentialSpent = expenses
      .filter((expense) => (getExpenseCategory(expense.category)?.bucket || 'essential') === 'essential')
      .reduce((sum, expense) => sum + (expense.actual_amount || 0), 0)
    const estimatedEssential = income * (debts.length ? 0.6 : 0.5)
    const monthlyEssential = essentialSpent > 0 ? essentialSpent : estimatedEssential
    const minimumReserve = monthlyEssential * 3
    const idealReserve = monthlyEssential * 6
    const saved = goal?.saved_amount || 0
    const debtPayments = debts.reduce((sum, debt) => sum + (debt.monthly_payment || 0), 0)
    const remainingMinimum = Math.max(0, minimumReserve - saved)
    const remainingIdeal = Math.max(0, idealReserve - saved)
    return {
      monthlyEssential, minimumReserve, idealReserve, saved, debtPayments,
      minimumProgress: minimumReserve > 0 ? Math.min(100, saved / minimumReserve * 100) : 0,
      idealProgress: idealReserve > 0 ? Math.min(100, saved / idealReserve * 100) : 0,
      minimumMonths: monthsToReach(remainingMinimum, monthlyContribution),
      idealMonths: monthsToReach(remainingIdeal, monthlyContribution),
      redirectedMonths: monthsToReach(remainingIdeal, monthlyContribution + debtPayments),
    }
  }, [debts, expenses, goal, income, monthlyContribution])

  const saveReserve = async (amount: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (goal) {
      const newSaved = Math.min(metrics.idealReserve, goal.saved_amount + amount)
      const { data, error } = await supabase.from('goals')
        .update({ saved_amount: newSaved, target_amount: metrics.idealReserve, is_completed: newSaved >= metrics.idealReserve })
        .eq('id', goal.id).select().single()
      if (error) throw error
      setGoal(data)
    } else {
      const initialSaved = Math.min(metrics.idealReserve, amount)
      const { data, error } = await supabase.from('goals').insert({
        user_id: user.id, goal_name: RESERVE_NAME, target_amount: metrics.idealReserve,
        saved_amount: initialSaved, is_completed: initialSaved >= metrics.idealReserve, priority: 1,
      }).select().single()
      if (error) throw error
      setGoal(data)
    }
  }

  const handleDeposit = async (event: React.FormEvent) => {
    event.preventDefault()
    const amount = Number(deposit)
    if (amount <= 0 || metrics.idealReserve <= 0) return
    setSaving(true)
    try {
      await saveReserve(amount)
      setDeposit('')
      setMessage(`${formatCurrency(amount)} adicionados à sua proteção. Continue assim!`)
    } catch (error) {
      console.error('Error saving reserve:', error)
      setMessage('Não foi possível salvar agora. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="py-20 text-center">Calculando sua proteção…</div>

  if (metrics.monthlyEssential <= 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl bg-blue-50 p-8 text-center ring-1 ring-blue-200">
        <div className="text-5xl">🛡️</div>
        <h1 className="mt-4 text-3xl font-bold">Vamos calcular sua reserva</h1>
        <p className="mt-3 text-gray-600">Cadastre sua renda ou seus gastos essenciais para o sistema descobrir quanto você precisa para ficar protegido.</p>
        <Link href="/dashboard/orcamento" className="btn btn-primary mt-6 inline-flex">Cadastrar minha renda</Link>
      </div>
    )
  }

  const stage = metrics.saved >= metrics.idealReserve ? 'Proteção completa'
    : metrics.saved >= metrics.minimumReserve ? 'Proteção básica concluída'
      : metrics.saved > 0 ? 'Construindo proteção' : 'Pronto para começar'

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 to-slate-950 p-6 text-white shadow-xl md:p-9">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-emerald-300/15 px-3 py-1 text-sm font-black uppercase tracking-wide text-emerald-300">Reserva inteligente</span>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">Sua tranquilidade também tem um plano</h1>
            <p className="mt-4 max-w-2xl text-emerald-50/80">Com base no seu custo essencial de {formatCurrency(metrics.monthlyEssential)}, calculamos duas camadas de proteção para você.</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-5">
            <p className="text-sm text-emerald-100/70">Etapa atual</p>
            <p className="mt-1 text-2xl font-bold text-emerald-300">{stage}</p>
            <p className="mt-2 text-sm text-emerald-100/70">{formatCurrency(metrics.saved)} já protegidos</p>
          </div>
        </div>
      </section>

      {message && <div className="rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800 ring-1 ring-emerald-200" role="status">🎉 {message}</div>}

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="card border-amber-200 bg-amber-50">
          <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-amber-800">PRIMEIRO ESCUDO</p><h2 className="mt-1 text-2xl font-bold">Reserva mínima</h2></div><span className="text-3xl">🛟</span></div>
          <p className="mt-3 text-3xl font-bold">{formatCurrency(metrics.minimumReserve)}</p>
          <p className="mt-1 text-sm text-gray-600">Equivale a 3 meses dos seus gastos essenciais.</p>
          <div className="mt-5 h-4 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${metrics.minimumProgress}%` }} /></div>
          <div className="mt-2 flex justify-between text-sm"><span>{metrics.minimumProgress.toFixed(0)}% concluído</span><b>{futureDate(metrics.minimumMonths)}</b></div>
        </div>
        <div className="card border-emerald-200 bg-emerald-50">
          <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-emerald-800">PROTEÇÃO IDEAL</p><h2 className="mt-1 text-2xl font-bold">Reserva completa</h2></div><span className="text-3xl">🛡️</span></div>
          <p className="mt-3 text-3xl font-bold">{formatCurrency(metrics.idealReserve)}</p>
          <p className="mt-1 text-sm text-gray-600">Equivale a 6 meses dos seus gastos essenciais.</p>
          <div className="mt-5 h-4 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${metrics.idealProgress}%` }} /></div>
          <div className="mt-2 flex justify-between text-sm"><span>{metrics.idealProgress.toFixed(0)}% concluído</span><b>{futureDate(metrics.idealMonths)}</b></div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleDeposit} className="card">
          <p className="text-sm font-black tracking-[.16em] text-emerald-700">ATUALIZAR PROGRESSO</p>
          <h2 className="mt-1 text-2xl font-bold">Quanto você guardou?</h2>
          <p className="mt-2 text-sm text-gray-600">Registre apenas o valor que realmente está separado para emergências.</p>
          <label className="label mt-5">Valor guardado agora</label>
          <input className="input text-xl font-bold" type="number" min="0.01" step="0.01" value={deposit} onChange={(event) => setDeposit(event.target.value)} placeholder="R$ 0,00" required />
          <button className="btn btn-primary mt-4 w-full" disabled={saving}>{saving ? 'Salvando…' : 'Adicionar à reserva'}</button>
        </form>

        <div className="card">
          <p className="text-sm font-black tracking-[.16em] text-violet-700">SIMULADOR</p>
          <h2 className="mt-1 text-2xl font-bold">Escolha seu ritmo mensal</h2>
          <p className="mt-2 text-sm text-gray-600">Veja quando sua proteção ideal poderá ficar pronta.</p>
          <label className="label mt-5">Valor mensal para a reserva</label>
          <input className="input text-xl font-bold" type="number" min="0" step="50" value={monthlyContribution} onChange={(event) => setMonthlyContribution(Math.max(0, Number(event.target.value) || 0))} />
          <div className="mt-4 rounded-2xl bg-purple-50 p-4">
            <p className="text-sm text-gray-600">Previsão da reserva ideal</p><p className="mt-1 text-2xl font-bold text-purple-800">{futureDate(metrics.idealMonths)}</p>
          </div>
        </div>
      </section>

      {metrics.debtPayments > 0 && (
        <section className="rounded-3xl bg-slate-950 p-6 text-white md:p-8">
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-300">A virada depois das dívidas</p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">Suas parcelas poderão construir sua segurança</h2>
          <p className="mt-3 text-slate-300">Ao quitar as dívidas, redirecionar os atuais {formatCurrency(metrics.debtPayments)}/mês para a reserva pode levá-la à proteção ideal por volta de <b className="text-white">{futureDate(metrics.redirectedMonths)}</b>.</p>
          <Link href="/dashboard/plano" className="mt-5 inline-flex rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950">Ver plano de quitação →</Link>
        </section>
      )}

      <p className="text-center text-xs text-gray-500">Estimativa educativa baseada nos gastos e valores registrados. Mantenha a reserva em local seguro, líquido e de baixo risco.</p>
    </div>
  )
}
