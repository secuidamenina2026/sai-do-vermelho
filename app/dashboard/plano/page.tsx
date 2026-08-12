'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  formatCurrency,
  formatPayoffDate,
  simulatePayoffPlan,
  type DebtInput,
  type PayoffStrategy,
} from '@/lib/financial'

type DebtRow = {
  id: string
  creditor: string
  total_amount: number
  monthly_interest_rate: number | null
  monthly_payment: number | null
}

const journey = [
  { label: 'Vermelho', icon: '🔴', text: 'Dívidas em quitação' },
  { label: 'Equilíbrio', icon: '🟡', text: 'Contas sob controle' },
  { label: 'Reserva', icon: '🟢', text: 'Proteção para imprevistos' },
  { label: 'Investidor', icon: '🚀', text: 'Dinheiro trabalhando por você' },
]

export default function FinancialFreedomPlan() {
  const [debts, setDebts] = useState<DebtRow[]>([])
  const [income, setIncome] = useState(0)
  const [strategy, setStrategy] = useState<PayoffStrategy>('avalanche')
  const [extraPayment, setExtraPayment] = useState(300)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const currentMonth = `${new Date().toISOString().slice(0, 7)}-01`
        const [debtsResult, budgetResult] = await Promise.all([
          supabase.from('debts').select('*').eq('user_id', user.id).eq('is_paid', false),
          supabase.from('monthly_budgets').select('monthly_income').eq('user_id', user.id).eq('month', currentMonth).single(),
        ])

        setDebts(debtsResult.data || [])
        setIncome(budgetResult.data?.monthly_income || 0)
      } finally {
        setLoading(false)
      }
    }

    loadPlan()
  }, [])

  const debtInputs = useMemo<DebtInput[]>(() => debts.map((debt) => ({
    id: debt.id,
    name: debt.creditor,
    balance: debt.total_amount || 0,
    monthlyInterestRate: debt.monthly_interest_rate || 0,
    minimumPayment: debt.monthly_payment || 0,
  })), [debts])

  const minimumPayment = debtInputs.reduce((sum, debt) => sum + debt.minimumPayment, 0)
  const totalDebt = debtInputs.reduce((sum, debt) => sum + debt.balance, 0)
  const basePlan = simulatePayoffPlan(debtInputs, minimumPayment, strategy)
  const acceleratedPlan = simulatePayoffPlan(debtInputs, minimumPayment + extraPayment, strategy)
  const snowball = simulatePayoffPlan(debtInputs, minimumPayment + extraPayment, 'snowball')
  const avalanche = simulatePayoffPlan(debtInputs, minimumPayment + extraPayment, 'avalanche')
  const savedMonths = basePlan.months !== null && acceleratedPlan.months !== null
    ? Math.max(0, basePlan.months - acceleratedPlan.months)
    : 0
  const savedInterest = Math.max(0, basePlan.totalInterest - acceleratedPlan.totalInterest)
  const reserveAfterOneYear = (minimumPayment + extraPayment) * 12
  const recommendedStrategy: PayoffStrategy = avalanche.months !== null && snowball.months !== null && avalanche.totalInterest <= snowball.totalInterest
    ? 'avalanche'
    : 'snowball'

  if (loading) return <div className="py-20 text-center">Montando seu plano…</div>

  if (!debts.length) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 text-center">
        <div className="rounded-3xl bg-emerald-50 p-10 ring-1 ring-emerald-200">
          <div className="text-6xl">🎉</div>
          <h1 className="mt-4 text-3xl font-bold">Você já venceu a fase vermelha!</h1>
          <p className="mt-3 text-gray-600">Agora seu próximo passo é construir uma reserva de emergência e começar a investir com segurança.</p>
          <Link href="/dashboard/metas" className="btn btn-primary mt-6 inline-flex">Criar minha reserva</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_.7fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-semibold text-emerald-300">Plano de Liberdade Financeira</span>
            <h1 className="mt-4 text-3xl font-bold md:text-5xl">
              {acceleratedPlan.months !== null
                ? <>Você pode sair do vermelho em <span className="text-emerald-300">{formatPayoffDate(acceleratedPlan.months)}</span></>
                : 'Vamos ajustar seu plano para ele funcionar'}
            </h1>
            <p className="mt-4 max-w-2xl text-slate-300">
              Com mais {formatCurrency(extraPayment)} por mês, sua dívida de {formatCurrency(totalDebt)} ganha uma rota clara de quitação.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-slate-300">Depois de quitar, mantendo o mesmo esforço</p>
            <p className="mt-1 text-3xl font-bold text-emerald-300">{formatCurrency(reserveAfterOneYear)}</p>
            <p className="mt-1 text-sm text-slate-300">poderão virar reserva em 12 meses.</p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Sua jornada</p>
            <h2 className="text-2xl font-bold">Do vermelho ao investidor</h2>
          </div>
          <p className="text-sm text-gray-500">Você está na etapa 1 de 4</p>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {journey.map((step, index) => (
            <div key={step.label} className={`rounded-2xl p-4 ring-1 ${index === 0 ? 'bg-red-50 ring-red-300' : 'bg-gray-50 ring-gray-200 opacity-70'}`}>
              <div className="text-2xl">{step.icon}</div>
              <p className="mt-2 font-bold">{step.label}</p>
              <p className="text-sm text-gray-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="text-xl font-bold">🧮 E se eu pagar um pouco mais?</h2>
          <p className="mt-1 text-sm text-gray-600">Teste sem compromisso e veja o impacto no seu futuro.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[100, 300, 500, 1000].map((value) => (
              <button key={value} onClick={() => setExtraPayment(value)} className={`rounded-xl px-4 py-2 font-semibold ${extraPayment === value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                + {formatCurrency(value)}
              </button>
            ))}
          </div>
          <label className="label mt-5">Ou escolha outro valor mensal</label>
          <input className="input" type="number" min="0" step="50" value={extraPayment} onChange={(event) => setExtraPayment(Math.max(0, Number(event.target.value) || 0))} />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-gray-600">Tempo antecipado</p>
              <p className="text-2xl font-bold text-emerald-700">{savedMonths} meses</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-gray-600">Juros evitados</p>
              <p className="text-2xl font-bold text-emerald-700">{formatCurrency(savedInterest)}</p>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold">🏆 Estratégia recomendada</h2>
          <p className="mt-1 text-sm text-gray-600">Compare motivação e economia antes de decidir.</p>
          <div className="mt-5 space-y-3">
            {([
              ['snowball', '❄️ Bola de neve', snowball, 'Vitórias mais rápidas'],
              ['avalanche', '🏔️ Avalanche', avalanche, 'Menor custo de juros'],
            ] as const).map(([key, label, plan, description]) => (
              <button key={key} onClick={() => setStrategy(key)} className={`w-full rounded-2xl p-4 text-left ring-2 transition ${strategy === key ? 'bg-blue-50 ring-blue-600' : 'ring-gray-200 hover:ring-blue-300'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div><p className="font-bold">{label}</p><p className="text-sm text-gray-600">{description}</p></div>
                  {recommendedStrategy === key && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Recomendado</span>}
                </div>
                <p className="mt-3 text-sm">{plan.months ?? '—'} meses · {formatCurrency(plan.totalInterest)} em juros</p>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-700">PRÓXIMA AÇÃO</p>
            <h2 className="mt-1 text-xl font-bold">Concentre o valor extra em uma dívida por vez</h2>
            <p className="mt-1 text-gray-600">Mantenha as parcelas mínimas das demais e priorize: <b>{[...debtInputs].sort((a, b) => strategy === 'avalanche' ? b.monthlyInterestRate - a.monthlyInterestRate : a.balance - b.balance)[0]?.name}</b>.</p>
          </div>
          <Link href="/dashboard/dividas" className="btn btn-primary whitespace-nowrap">Revisar minhas dívidas</Link>
        </div>
      </section>

      <p className="text-center text-xs text-gray-500">
        Projeção educativa baseada nos valores informados. Taxas, renegociações e pagamentos reais podem alterar o resultado.
        {income > 0 && ` Sua renda cadastrada é ${formatCurrency(income)}.`}
      </p>
    </div>
  )
}
