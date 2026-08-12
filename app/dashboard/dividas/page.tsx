'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, simulatePayoffPlan, type PayoffStrategy } from '@/lib/financial'

type Debt = {
  id: string
  creditor: string
  total_amount: number
  original_amount: number
  monthly_interest_rate: number | null
  monthly_payment: number | null
  priority_order: number | null
}

type DebtPayment = {
  id: string
  debt_id: string
  amount: number
  paid_at: string
  notes: string | null
}

export default function Debts() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [strategy, setStrategy] = useState<PayoffStrategy>('snowball')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<DebtPayment[]>([])
  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [savingPayment, setSavingPayment] = useState(false)
  const [celebration, setCelebration] = useState('')
  const [formData, setFormData] = useState({
    creditor: '',
    total_amount: '',
    monthly_interest_rate: '',
    monthly_payment: '',
  })

  useEffect(() => {
    loadDebts()
  }, [])

  const loadDebts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const [{ data }, { data: paymentData }] = await Promise.all([
          supabase.from('debts').select('*').eq('user_id', user.id).eq('is_paid', false).order('priority_order', { ascending: true }),
          supabase.from('debt_payments').select('*').eq('user_id', user.id).order('paid_at', { ascending: false }).limit(50),
        ])

        if (data) {
          setDebts(data)
        }
        if (paymentData) setPayments(paymentData)
      }
    } catch (error) {
      console.error('Error loading debts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentDebt) return
    const amount = Number(paymentAmount)
    if (!amount || amount <= 0 || amount > paymentDebt.total_amount) return

    setSavingPayment(true)
    try {
      const { data, error } = await supabase.rpc('record_debt_payment', {
        p_debt_id: paymentDebt.id,
        p_amount: amount,
        p_notes: paymentNotes,
      })
      if (error) throw error

      if (data?.is_paid) {
        setDebts((current) => current.filter((debt) => debt.id !== paymentDebt.id))
        setCelebration(`Parabéns! Você quitou ${paymentDebt.creditor}!`)
      } else {
        setDebts((current) => current.map((debt) => debt.id === paymentDebt.id
          ? { ...debt, total_amount: Number(data.new_balance) }
          : debt))
        setCelebration(`${formatCurrency(amount)} abatidos. Você está mais perto da liberdade!`)
      }

      setPayments((current) => [{
        id: data.payment_id,
        debt_id: paymentDebt.id,
        amount,
        paid_at: new Date().toISOString(),
        notes: paymentNotes || null,
      }, ...current])
      setPaymentDebt(null)
      setPaymentAmount('')
      setPaymentNotes('')
    } catch (error) {
      console.error('Error recording payment:', error)
      alert('Não foi possível registrar o pagamento. Confira o valor e tente novamente.')
    } finally {
      setSavingPayment(false)
    }
  }

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const nextPriority = debts.length + 1

        const { data } = await supabase
          .from('debts')
          .insert({
            user_id: user.id,
            creditor: formData.creditor,
            total_amount: parseFloat(formData.total_amount),
            monthly_interest_rate: parseFloat(formData.monthly_interest_rate) || 0,
            monthly_payment: parseFloat(formData.monthly_payment),
            priority_order: nextPriority,
            is_paid: false,
          })
          .select()

        if (data) {
          setDebts([...debts, data[0]])
          setFormData({
            creditor: '',
            total_amount: '',
            monthly_interest_rate: '',
            monthly_payment: '',
          })
          setShowForm(false)
        }
      }
    } catch (error) {
      console.error('Error adding debt:', error)
    }
  }

  const handleMarkPaid = async (id: string) => {
    try {
      await supabase
        .from('debts')
        .update({ is_paid: true })
        .eq('id', id)

      setDebts(debts.filter((d) => d.id !== id))
    } catch (error) {
      console.error('Error marking debt as paid:', error)
    }
  }

  const handleDeleteDebt = async (id: string) => {
    try {
      await supabase.from('debts').delete().eq('id', id)
      setDebts(debts.filter((d) => d.id !== id))
    } catch (error) {
      console.error('Error deleting debt:', error)
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  const totalDebt = debts.reduce((sum, d) => sum + (d.total_amount || 0), 0)
  const totalMonthlyPayment = debts.reduce((sum, d) => sum + (d.monthly_payment || 0), 0)
  const payoff = simulatePayoffPlan(
    debts.map((debt) => ({
      id: debt.id,
      name: debt.creditor,
      balance: debt.total_amount,
      monthlyInterestRate: debt.monthly_interest_rate || 0,
      minimumPayment: debt.monthly_payment || 0,
    })),
    totalMonthlyPayment,
    strategy,
  )
  const orderedDebts = [...debts].sort((a, b) =>
    strategy === 'avalanche'
      ? (b.monthly_interest_rate || 0) - (a.monthly_interest_rate || 0) || a.total_amount - b.total_amount
      : a.total_amount - b.total_amount || (b.monthly_interest_rate || 0) - (a.monthly_interest_rate || 0),
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">💳 Gestor de Dívidas</h1>
        <p className="text-gray-600">
          Pague o mínimo de todas e direcione todo valor extra para uma dívida por vez.
          Escolha entre vitórias rápidas ou menor custo de juros.
        </p>
      </div>

      {celebration && (
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 p-5 text-white shadow-lg" role="status">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-2xl">🎉</p><p className="font-bold">{celebration}</p></div>
            <button onClick={() => setCelebration('')} aria-label="Fechar comemoração" className="rounded-lg bg-white/15 px-3 py-2">✕</button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-gray-600 text-sm">Dívida Total</p>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Pagamento Mensal Total</p>
          <p className="text-3xl font-bold">{formatCurrency(totalMonthlyPayment)}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Dívidas Ativas</p>
          <p className="text-3xl font-bold">{debts.length}</p>
        </div>
      </div>

      {debts.length > 0 && (
        <div className="card border-blue-200 bg-blue-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-lg">Escolha sua estratégia</h2>
              <p className="text-sm text-gray-600">
                A ordem abaixo muda automaticamente conforme sua escolha.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStrategy('snowball')}
                className={`btn text-sm ${strategy === 'snowball' ? 'btn-primary' : 'btn-secondary'}`}
              >
                ❄️ Bola de neve
              </button>
              <button
                onClick={() => setStrategy('avalanche')}
                className={`btn text-sm ${strategy === 'avalanche' ? 'btn-primary' : 'btn-secondary'}`}
              >
                🏔️ Avalanche
              </button>
            </div>
          </div>
          <p className="text-sm mt-4">
            {strategy === 'snowball'
              ? 'Prioriza o menor saldo para gerar vitórias rápidas.'
              : 'Prioriza a maior taxa para reduzir o total de juros.'}
          </p>
          {payoff.months !== null ? (
            <p className="mt-3 font-medium">
              Previsão: <b>{payoff.months} meses</b> · Juros estimados: <b>{formatCurrency(payoff.totalInterest)}</b>
            </p>
          ) : (
            <p className="mt-3 text-red-700 font-medium">
              O pagamento mensal atual não é suficiente para gerar uma previsão segura de quitação.
            </p>
          )}
        </div>
      )}

      {/* Add Debt Form */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Adicionar Dívida</h2>
          {showForm && <button className="text-sm text-gray-500" onClick={() => setShowForm(false)}>✕</button>}
        </div>

        {showForm ? (
          <form onSubmit={handleAddDebt} className="space-y-4">
            <div>
              <label className="label">Credor/Instituição</label>
              <input
                type="text"
                value={formData.creditor}
                onChange={(e) => setFormData({ ...formData, creditor: e.target.value })}
                className="input"
                placeholder="Banco, Crediário, etc..."
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Valor Total da Dívida (R$)</label>
                <input
                  type="number"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  className="input"
                  placeholder="0,00"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="label">Taxa de Juros (% a.m.)</label>
                <input
                  type="number"
                  value={formData.monthly_interest_rate}
                  onChange={(e) => setFormData({ ...formData, monthly_interest_rate: e.target.value })}
                  className="input"
                  placeholder="0,00"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="label">Pagamento Mensal (R$)</label>
              <input
                type="number"
                value={formData.monthly_payment}
                onChange={(e) => setFormData({ ...formData, monthly_payment: e.target.value })}
                className="input"
                placeholder="0,00"
                step="0.01"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Adicionar Dívida
            </button>
          </form>
        ) : (
          <button onClick={() => setShowForm(true)} className="btn btn-primary w-full">
            + Nova Dívida
          </button>
        )}
      </div>

      {/* Debts List */}
      <div className="space-y-4">
        {debts.length === 0 ? (
          <div className="card bg-green-50 border-green-200 text-center py-8">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="font-bold mb-2">Parabéns!</h3>
            <p>Você não tem dívidas ativas. Continue assim! 💪</p>
          </div>
        ) : (
          orderedDebts.map((debt, index) => {
            const individual = simulatePayoffPlan([{
              id: debt.id,
              name: debt.creditor,
              balance: debt.total_amount,
              monthlyInterestRate: debt.monthly_interest_rate || 0,
              minimumPayment: debt.monthly_payment || 0,
            }], debt.monthly_payment || 0, strategy)
            const originalAmount = Math.max(debt.original_amount || debt.total_amount, debt.total_amount)
            const paidAmount = Math.max(0, originalAmount - debt.total_amount)
            const progress = originalAmount > 0 ? Math.min(100, (paidAmount / originalAmount) * 100) : 0
            const debtPayments = payments.filter((payment) => payment.debt_id === debt.id)
            return (
              <div key={debt.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-medium">
                        #{index + 1}
                      </span>
                      <h3 className="text-xl font-bold">{debt.creditor}</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {debt.monthly_interest_rate || 0}% a.m. | Pagamento mensal: {formatCurrency(debt.monthly_payment || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatCurrency(debt.total_amount)}</p>
                    <p className="text-xs text-gray-500">
                      {individual.months === null ? 'parcela insuficiente' : `~${individual.months} meses isoladamente`}
                    </p>
                  </div>
                </div>

                <p className="text-sm mb-4 bg-gray-50 rounded-lg p-3">
                  Prioridade #{index + 1} no método {strategy === 'snowball' ? 'bola de neve' : 'avalanche'}.
                </p>

                <div className="mb-5">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium">Progresso da quitação</span>
                    <span>{progress.toFixed(0)}% · {formatCurrency(paidAmount)} pagos</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {debtPayments.length > 0 && (
                  <details className="mb-4 rounded-xl bg-gray-50 p-3">
                    <summary className="cursor-pointer text-sm font-semibold">Ver histórico ({debtPayments.length})</summary>
                    <div className="mt-3 space-y-2">
                      {debtPayments.map((payment) => (
                        <div key={payment.id} className="flex justify-between gap-4 text-sm">
                          <span>{new Date(payment.paid_at).toLocaleDateString('pt-BR')}{payment.notes ? ` · ${payment.notes}` : ''}</span>
                          <b className="text-emerald-700">-{formatCurrency(payment.amount)}</b>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setPaymentDebt(debt)
                      setPaymentAmount(String(debt.monthly_payment || ''))
                    }}
                    className="flex-1 btn btn-primary text-sm"
                  >
                    + Registrar pagamento
                  </button>
                  <button
                    onClick={() => handleDeleteDebt(debt.id)}
                    className="flex-1 btn btn-secondary text-sm"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {paymentDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="payment-title">
          <form onSubmit={handlePayment} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-700">ABATER DÍVIDA</p>
                <h2 id="payment-title" className="text-2xl font-bold">{paymentDebt.creditor}</h2>
                <p className="mt-1 text-sm text-gray-600">Saldo atual: {formatCurrency(paymentDebt.total_amount)}</p>
              </div>
              <button type="button" onClick={() => setPaymentDebt(null)} aria-label="Fechar" className="rounded-lg bg-gray-100 px-3 py-2">✕</button>
            </div>
            <label className="label mt-6">Valor pago</label>
            <input autoFocus required className="input" type="number" min="0.01" max={paymentDebt.total_amount} step="0.01" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} />
            <label className="label mt-4">Observação (opcional)</label>
            <input className="input" placeholder="Ex.: parcela de agosto" value={paymentNotes} onChange={(event) => setPaymentNotes(event.target.value)} />
            <button disabled={savingPayment} className="btn btn-primary mt-6 w-full disabled:opacity-50">
              {savingPayment ? 'Registrando…' : 'Confirmar pagamento'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
