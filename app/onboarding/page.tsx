'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/financial'

const goals = [
  { value: 'debt', icon: '📉', label: 'Sair das dívidas' },
  { value: 'organize', icon: '🧭', label: 'Organizar meu dinheiro' },
  { value: 'reserve', icon: '🛡️', label: 'Criar uma reserva' },
  { value: 'maintain', icon: '🌱', label: 'Manter minha vida em ordem' },
]

type DraftDebt = { creditor: string; amount: string; payment: string; interest: string }

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [goal, setGoal] = useState('debt')
  const [incomeType, setIncomeType] = useState<'fixed' | 'variable'>('fixed')
  const [income, setIncome] = useState('')
  const [essentialCost, setEssentialCost] = useState('')
  const [debts, setDebts] = useState<DraftDebt[]>([])
  const [draftDebt, setDraftDebt] = useState<DraftDebt>({ creditor: '', amount: '', payment: '', interest: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.replace('/auth/login')
      const { data } = await supabase.from('users').select('onboarding_completed,onboarding_step,financial_goal,income_type,monthly_income').eq('id', user.id).single()
      if (data?.onboarding_completed) return router.replace('/dashboard')
      setStep(Math.min(data?.onboarding_step || 1, 5))
      if (data?.financial_goal) setGoal(data.financial_goal)
      if (data?.income_type) setIncomeType(data.income_type)
      if (data?.monthly_income) setIncome(String(data.monthly_income))
      setLoading(false)
    }
    load()
  }, [router])

  const saveProgress = async (nextStep: number, extra: Record<string, unknown> = {}) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Sessão não encontrada')
    const { error } = await supabase.from('users').update({ onboarding_step: nextStep, ...extra }).eq('id', user.id)
    if (error) throw error
    setStep(nextStep)
  }

  const next = async () => {
    setError('')
    setSaving(true)
    try {
      if (step === 1) await saveProgress(2, { financial_goal: goal })
      if (step === 2) {
        if (Number(income) <= 0) throw new Error('Informe uma renda mensal maior que zero.')
        await saveProgress(3, { income_type: incomeType, monthly_income: Number(income) })
      }
      if (step === 3) await saveProgress(4)
      if (step === 4) await saveProgress(5)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  const addDebt = () => {
    if (!draftDebt.creditor.trim() || Number(draftDebt.amount) <= 0) return
    setDebts((current) => [...current, draftDebt])
    setDraftDebt({ creditor: '', amount: '', payment: '', interest: '' })
  }

  const finish = async () => {
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Sessão não encontrada')
      const month = `${new Date().toISOString().slice(0, 7)}-01`
      const hasDebts = debts.length > 0
      const incomeValue = Number(income)
      const essentialsRate = hasDebts ? 0.6 : 0.5
      const desiresRate = hasDebts ? 0.1 : 0.3
      const informedEssentials = Number(essentialCost)
      const essentialsBudget = informedEssentials > 0
        ? Math.min(incomeValue, informedEssentials)
        : incomeValue * essentialsRate
      const desiresBudget = Math.min(incomeValue * desiresRate, Math.max(0, incomeValue - essentialsBudget))
      const futureBudget = Math.max(0, incomeValue - essentialsBudget - desiresBudget)

      const operations: PromiseLike<unknown>[] = [
        supabase.from('monthly_budgets').upsert({
          user_id: user.id, month, monthly_income: incomeValue,
          essentials_budget: essentialsBudget,
          desires_budget: desiresBudget,
          savings_budget: futureBudget,
        }, { onConflict: 'user_id,month' }),
      ]
      if (debts.length) operations.push(supabase.from('debts').insert(debts.map((debt, index) => ({
        user_id: user.id,
        creditor: debt.creditor.trim(),
        total_amount: Number(debt.amount),
        original_amount: Number(debt.amount),
        monthly_payment: Number(debt.payment) || 0,
        monthly_interest_rate: Number(debt.interest) || 0,
        priority_order: index + 1,
        is_paid: false,
      }))))
      await Promise.all(operations)
      const { error: userError } = await supabase.from('users').update({ onboarding_completed: true, onboarding_step: 6 }).eq('id', user.id)
      if (userError) throw userError
      router.replace(hasDebts ? '/dashboard/plano' : '/dashboard/reserva')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir seu plano.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center">Preparando sua jornada…</div>

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between"><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 font-black text-slate-950">S</span><b>Sai do Vermelho</b></div><span className="text-sm font-bold text-slate-400">Etapa {step} de 5</span></div>
        <div className="mb-8 flex gap-2">{[1,2,3,4,5].map((item) => <div key={item} className={`h-2 flex-1 rounded-full ${item <= step ? 'bg-emerald-400' : 'bg-white/10'}`} />)}</div>
        <section className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl md:p-9">
          {step === 1 && <>
            <p className="text-sm font-black uppercase tracking-[.16em] text-emerald-700">Sua virada começa aqui</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">O que você mais quer conquistar?</h1>
            <p className="mt-2 text-gray-600">Isso nos ajuda a organizar sua jornada na ordem certa.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">{goals.map((item) => <button key={item.value} onClick={() => setGoal(item.value)} className={`rounded-2xl border-2 p-4 text-left transition ${goal === item.value ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}><span className="text-2xl">{item.icon}</span><p className="mt-2 font-black">{item.label}</p></button>)}</div>
          </>}
          {step === 2 && <>
            <p className="text-sm font-black uppercase tracking-[.16em] text-emerald-700">Sua renda</p><h1 className="mt-2 text-3xl font-black tracking-tight">Quanto realmente entra por mês?</h1>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setIncomeType('fixed')} className={`rounded-xl border-2 p-3 font-bold ${incomeType === 'fixed' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>Renda fixa</button>
              <button onClick={() => setIncomeType('variable')} className={`rounded-xl border-2 p-3 font-bold ${incomeType === 'variable' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>Renda variável</button>
            </div>
            <label className="label mt-6">Renda líquida mensal</label><input autoFocus className="input text-2xl font-bold" type="number" min="0" step="0.01" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="R$ 0,00" />
            {incomeType === 'variable' && <p className="mt-2 text-sm text-gray-500">Use uma média conservadora. Depois, o sistema calculará sua média real pelas entradas registradas.</p>}
          </>}
          {step === 3 && <>
            <p className="text-sm font-black uppercase tracking-[.16em] text-emerald-700">Seu essencial</p><h1 className="mt-2 text-3xl font-black tracking-tight">Quanto custa manter sua casa funcionando?</h1>
            <p className="mt-2 text-gray-600">Uma estimativa é suficiente agora. Você poderá detalhar depois.</p>
            <label className="label mt-6">Gasto essencial mensal estimado</label><input className="input text-2xl font-bold" type="number" min="0" step="0.01" value={essentialCost} onChange={(e) => setEssentialCost(e.target.value)} placeholder={formatCurrency(Number(income) * 0.5)} />
            <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">Inclua moradia, mercado, contas básicas, transporte, saúde e despesas indispensáveis.</div>
          </>}
          {step === 4 && <>
            <p className="text-sm font-black uppercase tracking-[.16em] text-emerald-700">Suas dívidas</p><h1 className="mt-2 text-3xl font-black tracking-tight">Existe alguma dívida para organizar?</h1>
            <div className="mt-5 grid gap-3 sm:grid-cols-2"><input className="input" value={draftDebt.creditor} onChange={(e) => setDraftDebt({...draftDebt, creditor:e.target.value})} placeholder="Credor ou instituição" /><input className="input" type="number" value={draftDebt.amount} onChange={(e) => setDraftDebt({...draftDebt, amount:e.target.value})} placeholder="Saldo total" /><input className="input" type="number" value={draftDebt.payment} onChange={(e) => setDraftDebt({...draftDebt, payment:e.target.value})} placeholder="Parcela mensal" /><input className="input" type="number" value={draftDebt.interest} onChange={(e) => setDraftDebt({...draftDebt, interest:e.target.value})} placeholder="Juros % ao mês" /></div>
            <button onClick={addDebt} className="btn btn-secondary mt-3 w-full">+ Adicionar dívida</button>
            {debts.length > 0 && <div className="mt-4 space-y-2">{debts.map((debt,index) => <div key={index} className="flex justify-between rounded-xl bg-gray-50 p-3 text-sm"><span>{debt.creditor}</span><b>{formatCurrency(Number(debt.amount))}</b></div>)}</div>}
            <p className="mt-3 text-xs text-gray-500">Se não tiver dívidas, avance normalmente.</p>
          </>}
          {step === 5 && <>
            <p className="text-sm font-black uppercase tracking-[.16em] text-emerald-700">Seu plano está pronto</p><h1 className="mt-2 text-3xl font-black tracking-tight">A partir de agora, você não caminha sem direção</h1>
            <div className="mt-6 space-y-3 rounded-2xl bg-slate-950 p-5 text-white">
              <div className="flex justify-between"><span>Renda informada</span><b>{formatCurrency(Number(income))}</b></div>
              <div className="flex justify-between"><span>Dívidas cadastradas</span><b>{debts.length}</b></div>
              <div className="flex justify-between"><span>Modo inicial</span><b>{debts.length ? 'Recuperação 60-10-30' : 'Equilíbrio 50-30-20'}</b></div>
            </div>
            <p className="mt-5 text-gray-600">Sua primeira missão será manter os lançamentos atualizados e seguir o próximo passo indicado no painel.</p>
          </>}
          {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="mt-7 flex gap-3">
            {step > 1 && step < 5 && <button onClick={() => setStep(step - 1)} className="btn btn-secondary">Voltar</button>}
            <button onClick={step === 5 ? finish : next} disabled={saving} className="btn btn-primary flex-1 py-3 disabled:opacity-50">{saving ? 'Salvando…' : step === 5 ? 'Entrar no meu plano →' : 'Continuar →'}</button>
          </div>
        </section>
      </div>
    </main>
  )
}
