'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Debts() {
  const [debts, setDebts] = useState<any[]>([])
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">💳 Gestor de Dívidas</h1>
        <p className="text-gray-600">
          Sistema "Bola de Neve": pague juros + mínimo nas grandes e apenas mínimo nas pequenas.
          Quando uma é quitada, todos os pagamentos vão para a próxima.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-gray-600 text-sm">Dívida Total</p>
          <p className="text-3xl font-bold text-red-600">R$ {totalDebt.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Pagamento Mensal Total</p>
          <p className="text-3xl font-bold">R$ {totalMonthlyPayment.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Dívidas Ativas</p>
          <p className="text-3xl font-bold">{debts.length}</p>
        </div>
      </div>

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
          debts.map((debt, index) => {
            const monthsToPayOff = debt.monthly_payment > 0 
              ? Math.ceil(debt.total_amount / debt.monthly_payment)
              : '∞'
            const progress = Math.min(
              ((debt.monthly_payment * (index + 1)) / debt.total_amount) * 100,
              100
            )

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
                      {debt.monthly_interest_rate}% a.m. | Pagamento mensal: R$ {debt.monthly_payment.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">R$ {debt.total_amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">~{monthsToPayOff} meses</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{progress.toFixed(0)}% prioridade</p>
                </div>

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
