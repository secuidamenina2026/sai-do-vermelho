'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getExpenseCategory } from '@/lib/expense-categories'
import { formatCurrency, formatPayoffDate, simulatePayoffPlan, type DebtInput } from '@/lib/financial'

type Budget = { monthly_income: number; essentials_budget: number | null; desires_budget: number | null; savings_budget: number | null }
type Expense = { category: string; actual_amount: number }
type Debt = { id: string; creditor: string; total_amount: number; monthly_interest_rate: number | null; monthly_payment: number | null }
type Payment = { debt_id: string; amount: number; paid_at: string }

const percent = (value: number, total: number) => total > 0 ? (value / total) * 100 : 0

export default function MonthlyDiagnosis() {
  const [budget, setBudget] = useState<Budget | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const monthStart = `${new Date().toISOString().slice(0, 7)}-01`
        const nextMonth = new Date(`${monthStart}T00:00:00`)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        const [budgetResult, expensesResult, debtsResult, paymentsResult] = await Promise.all([
          supabase.from('monthly_budgets').select('*').eq('user_id', user.id).eq('month', monthStart).single(),
          supabase.from('expenses').select('category,actual_amount').eq('user_id', user.id).gte('month', monthStart),
          supabase.from('debts').select('*').eq('user_id', user.id).eq('is_paid', false),
          supabase.from('debt_payments').select('debt_id,amount,paid_at').eq('user_id', user.id).gte('paid_at', `${monthStart}T00:00:00`).lt('paid_at', nextMonth.toISOString()),
        ])
        setBudget(budgetResult.data)
        setExpenses(expensesResult.data || [])
        setDebts(debtsResult.data || [])
        setPayments(paymentsResult.data || [])
      } catch (error) {
        console.error('Error loading monthly diagnosis:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const metrics = useMemo(() => {
    const income = budget?.monthly_income || 0
    let essentials = 0
    let desires = 0
    let financial = 0
    for (const expense of expenses) {
      const value = expense.actual_amount || 0
      const bucket = getExpenseCategory(expense.category)?.bucket || 'essential'
      if (bucket === 'desire') desires += value
      else if (bucket === 'financial') financial += value
      else essentials += value
    }
    const totalExpenses = essentials + desires + financial
    const debtPaid = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const debtInputs: DebtInput[] = debts.map((debt) => ({
      id: debt.id, name: debt.creditor, balance: debt.total_amount || 0,
      monthlyInterestRate: debt.monthly_interest_rate || 0, minimumPayment: debt.monthly_payment || 0,
    }))
    const monthlyPayment = debtInputs.reduce((sum, debt) => sum + debt.minimumPayment, 0)
    const currentPlan = simulatePayoffPlan(debtInputs, monthlyPayment, 'avalanche')
    const paidByDebt = new Map<string, number>()
    for (const payment of payments) paidByDebt.set(payment.debt_id, (paidByDebt.get(payment.debt_id) || 0) + payment.amount)
    const priorPlan = simulatePayoffPlan(debtInputs.map((debt) => ({
      ...debt, balance: debt.balance + (paidByDebt.get(debt.id || '') || 0),
    })), monthlyPayment, 'avalanche')
    const monthsAdvanced = currentPlan.months !== null && priorPlan.months !== null
      ? Math.max(0, priorPlan.months - currentPlan.months) : 0
    return { income, essentials, desires, financial, totalExpenses, debtPaid, available: income - totalExpenses, currentPlan, monthsAdvanced }
  }, [budget, debts, expenses, payments])

  if (loading) return <div className="py-20 text-center">Analisando seu mês…</div>

  const recovery = debts.length > 0
  const essentialsLimit = budget?.essentials_budget || metrics.income * (recovery ? 0.6 : 0.5)
  const desiresLimit = budget?.desires_budget || metrics.income * (recovery ? 0.1 : 0.3)
  const futureLimit = budget?.savings_budget || metrics.income * (recovery ? 0.3 : 0.2)
  const essentialsOk = metrics.essentials <= essentialsLimit
  const desiresOk = metrics.desires <= desiresLimit
  const score = Math.max(0, Math.min(100, Math.round(
    (metrics.income > 0 ? 25 : 0) + (expenses.length > 0 ? 15 : 0) +
    (essentialsOk ? 20 : 5) + (desiresOk ? 20 : 5) +
    (!recovery || metrics.debtPaid > 0 ? 20 : 5),
  )))
  const scoreLabel = score >= 80 ? 'No caminho certo' : score >= 55 ? 'Em recuperação' : 'Precisa de atenção'
  const victory = metrics.debtPaid > 0
    ? `Você reduziu suas dívidas em ${formatCurrency(metrics.debtPaid)} neste mês.`
    : metrics.available > 0 && expenses.length > 0
      ? `Você manteve ${formatCurrency(metrics.available)} disponível neste mês.`
      : expenses.length > 0 ? 'Você registrou seus gastos e agora consegue enxergar onde agir.' : 'Você deu o primeiro passo ao abrir seu diagnóstico.'
  const attention = !budget ? 'Cadastre sua renda para medir seu orçamento com precisão.'
    : expenses.length === 0 ? 'Registre seus gastos do mês para liberar uma análise confiável.'
      : metrics.available < 0 ? `Seus gastos passaram da renda em ${formatCurrency(Math.abs(metrics.available))}.`
        : !essentialsOk ? `Os essenciais ultrapassaram o limite em ${formatCurrency(metrics.essentials - essentialsLimit)}.`
          : !desiresOk ? `Os desejos ultrapassaram o limite em ${formatCurrency(metrics.desires - desiresLimit)}.`
            : recovery && metrics.debtPaid === 0 ? 'Ainda não há pagamento de dívida registrado neste mês.'
              : 'Nenhum alerta grave neste momento. Continue acompanhando.'
  const mission = !budget
    ? { text: 'Cadastrar sua renda mensal', href: '/dashboard/orcamento', cta: 'Cadastrar renda' }
    : expenses.length === 0
      ? { text: 'Registrar pelo menos três gastos reais', href: '/dashboard/gastos', cta: 'Registrar gastos' }
      : metrics.available < 0 || !desiresOk
        ? { text: 'Pausar um gasto de desejo pelos próximos sete dias', href: '/dashboard/gastos', cta: 'Revisar gastos' }
        : recovery && metrics.debtPaid === 0
          ? { text: 'Registrar o próximo pagamento de uma dívida', href: '/dashboard/dividas', cta: 'Registrar pagamento' }
          : { text: 'Manter os lançamentos atualizados nesta semana', href: '/dashboard/gastos', cta: 'Continuar lançando' }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-blue-700">Diagnóstico mensal inteligente</p>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">Seu mês traduzido em decisões</h1>
          <p className="mt-2 text-gray-600">Uma leitura direta do que melhorou e do que fazer agora.</p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
          <p className="text-xs uppercase tracking-wide text-slate-400">Índice do mês</p>
          <div className="flex items-baseline gap-2"><b className="text-3xl text-emerald-300">{score}</b><span>/100 · {scoreLabel}</span></div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ['Renda', metrics.income, 'text-emerald-700', '💰'],
          ['Gastos', metrics.totalExpenses, 'text-red-600', '🧾'],
          ['Dívidas reduzidas', metrics.debtPaid, 'text-blue-700', '📉'],
          ['Saldo do mês', metrics.available, metrics.available >= 0 ? 'text-purple-700' : 'text-red-700', '⚖️'],
        ].map(([label, value, color, icon]) => (
          <div key={String(label)} className="card">
            <div className="text-2xl">{icon}</div><p className="mt-2 text-sm text-gray-600">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${color}`}>{formatCurrency(Number(value))}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl bg-emerald-50 p-6 ring-1 ring-emerald-200">
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-800">🏆 Sua vitória</p>
          <p className="mt-3 text-xl font-bold text-emerald-950">{victory}</p>
          {metrics.monthsAdvanced > 0 && <p className="mt-2 text-sm text-emerald-800">Isso antecipou sua liberdade em aproximadamente {metrics.monthsAdvanced} {metrics.monthsAdvanced === 1 ? 'mês' : 'meses'}.</p>}
        </div>
        <div className="rounded-3xl bg-amber-50 p-6 ring-1 ring-amber-200">
          <p className="text-sm font-bold uppercase tracking-wide text-amber-800">🔎 Ponto de atenção</p>
          <p className="mt-3 text-xl font-bold text-amber-950">{attention}</p>
        </div>
      </section>

      <section className="card">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div><p className="text-sm font-bold text-blue-700">ORÇAMENTO REAL</p><h2 className="text-2xl font-bold">Planejado x realizado</h2></div>
          <p className="text-sm text-gray-500">{recovery ? 'Modo recuperação 60-10-30' : 'Método 50-30-20'}</p>
        </div>
        <div className="space-y-5">
          {[
            ['Essenciais', metrics.essentials, essentialsLimit, 'bg-emerald-500'],
            ['Desejos', metrics.desires, desiresLimit, 'bg-blue-500'],
            ['Quitação, reserva e investimentos', metrics.financial + metrics.debtPaid, futureLimit, 'bg-purple-500'],
          ].map(([label, actual, limit, color]) => (
            <div key={String(label)}>
              <div className="mb-2 flex flex-col gap-1 text-sm sm:flex-row sm:justify-between"><b>{label}</b><span>{formatCurrency(Number(actual))} de {formatCurrency(Number(limit))}</span></div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-200"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, percent(Number(actual), Number(limit)))}%` }} /></div>
            </div>
          ))}
        </div>
      </section>

      {recovery && (
        <section className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white md:p-8">
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-300">Sua liberdade financeira</p>
          {metrics.currentPlan.months !== null ? (
            <><h2 className="mt-2 text-2xl font-bold md:text-3xl">Previsão atual: {formatPayoffDate(metrics.currentPlan.months)}</h2><p className="mt-2 text-slate-300">Cada pagamento registrado recalcula essa data automaticamente.</p></>
          ) : (
            <><h2 className="mt-2 text-2xl font-bold">Seu pagamento atual ainda não vence os juros</h2><p className="mt-2 text-slate-300">Revise as taxas e busque renegociação antes de assumir uma previsão.</p></>
          )}
          <Link href="/dashboard/plano" className="mt-5 inline-flex rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950">Ver meu plano completo →</Link>
        </section>
      )}

      <section className="rounded-3xl bg-blue-600 p-6 text-white shadow-lg md:p-8">
        <p className="text-sm font-bold uppercase tracking-wide text-blue-100">Missão dos próximos 7 dias</p>
        <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold">{mission.text}</h2>
          <Link href={mission.href} className="whitespace-nowrap rounded-xl bg-white px-5 py-3 text-center font-bold text-blue-700">{mission.cta} →</Link>
        </div>
      </section>
      <p className="text-center text-xs text-gray-500">Análise educativa baseada exclusivamente nos dados registrados no aplicativo.</p>
    </div>
  )
}
