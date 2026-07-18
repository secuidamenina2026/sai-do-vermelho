'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [budget, setBudget] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    category: 'mercado',
    actual_amount: '',
    notes: '',
  })

  const categories = [
    'mercado',
    'moradia',
    'transporte',
    'lazer',
    'delivery',
    'saúde',
    'educação',
    'outro',
  ]

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7) + '-01'

        const { data: expensesData } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .gte('month', currentMonth)
          .order('created_at', { ascending: false })

        if (expensesData) {
          setExpenses(expensesData)
        }

        const { data: budgetData } = await supabase
          .from('monthly_budgets')
          .select('*')
          .eq('user_id', user.id)
          .eq('month', currentMonth)
          .single()

        if (budgetData) {
          setBudget(budgetData)
        }
      }
    } catch (error) {
      console.error('Error loading expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7) + '-01'
        
        const { data } = await supabase
          .from('expenses')
          .insert({
            user_id: user.id,
            category: formData.category,
            actual_amount: parseFloat(formData.actual_amount),
            month: currentMonth,
            notes: formData.notes,
          })
          .select()

        if (data) {
          setExpenses([data[0], ...expenses])
          setFormData({
            category: 'mercado',
            actual_amount: '',
            notes: '',
          })
          setShowForm(false)
        }
      }
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      await supabase.from('expenses').delete().eq('id', id)
      setExpenses(expenses.filter((e) => e.id !== id))
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.actual_amount || 0), 0)
  const categoryTotals = categories.map((cat) => ({
    category: cat,
    total: expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + (e.actual_amount || 0), 0),
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">💳 Rastreio de Gastos</h1>
        <p className="text-gray-600">Acompanhe cada centavo gasto neste mês</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-600 text-sm">Total Gasto</p>
          <p className="text-3xl font-bold text-red-600">R$ {totalExpenses.toFixed(2)}</p>
        </div>
        {budget && (
          <>
            <div className="card">
              <p className="text-gray-600 text-sm">Limite Essenciais</p>
              <p className="text-3xl font-bold">R$ {budget.essentials_budget?.toFixed(2)}</p>
            </div>
            <div className="card">
              <p className="text-gray-600 text-sm">Limite Desejos</p>
              <p className="text-3xl font-bold">R$ {budget.desires_budget?.toFixed(2)}</p>
            </div>
            <div className="card">
              <p className="text-gray-600 text-sm">Poupança (Meta)</p>
              <p className="text-3xl font-bold">R$ {budget.savings_budget?.toFixed(2)}</p>
            </div>
          </>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Add Expense Form */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Adicionar Gasto</h2>
            {showForm && <button className="text-sm text-gray-500" onClick={() => setShowForm(false)}>✕</button>}
          </div>

          {showForm ? (
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="label">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Valor (R$)</label>
                <input
                  type="number"
                  value={formData.actual_amount}
                  onChange={(e) => setFormData({ ...formData, actual_amount: e.target.value })}
                  className="input"
                  placeholder="0,00"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="label">Notas (opcional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input"
                  placeholder="Descrição do gasto..."
                  rows={3}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Adicionar Gasto
              </button>
            </form>
          ) : (
            <button onClick={() => setShowForm(true)} className="btn btn-primary w-full">
              + Novo Gasto
            </button>
          )}
        </div>

        {/* Category Summary */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Gastos por Categoria</h2>
          <div className="space-y-3">
            {categoryTotals
              .filter((cat) => cat.total > 0)
              .sort((a, b) => b.total - a.total)
              .map((cat) => (
                <div key={cat.category} className="flex justify-between items-center">
                  <span className="capitalize">{cat.category}</span>
                  <span className="font-bold">R$ {cat.total.toFixed(2)}</span>
                </div>
              ))}
            {categoryTotals.every((cat) => cat.total === 0) && (
              <p className="text-gray-500 text-center py-4">Nenhum gasto registrado</p>
            )}
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Histórico de Gastos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">Data</th>
                <th className="text-left py-2">Categoria</th>
                <th className="text-left py-2">Descrição</th>
                <th className="text-right py-2">Valor</th>
                <th className="text-right py-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">
                    {new Date(expense.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 capitalize">{expense.category}</td>
                  <td className="py-3 text-sm text-gray-600">{expense.notes}</td>
                  <td className="py-3 text-right font-bold">
                    R$ {expense.actual_amount?.toFixed(2)}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
