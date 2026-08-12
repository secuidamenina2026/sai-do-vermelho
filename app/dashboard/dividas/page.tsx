'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, simulatePayoffPlan, type PayoffStrategy } from '@/lib/financial'

type Debt = {
  id: string
  creditor: string
  total_amount: number
  monthly_interest_rate: number | null
  monthly_payment: number | null
  priority_order: number | null
}

export default function Debts() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [strategy, setStrategy] = useState<PayoffStrategy>('snowball')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
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
        const { data } = await supabase
          .from('debts')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_paid', false)
          .order('priority_order', { ascending: true })

        if (data) {
          setDebts(data)
        }
      }
    } catch (error) {
      console.error('Error loading debts:', error)
    } finally {
      setLoading(false)
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

                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkPaid(debt.id)}
                    className="flex-1 btn btn-primary text-sm"
                  >
                    ✓ Quitada
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
    </div>
  )
}
