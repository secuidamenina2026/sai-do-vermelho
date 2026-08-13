'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  CATEGORY_GROUPS,
  EXPENSE_CATEGORIES,
  getExpenseCategoryLabel,
} from '@/lib/expense-categories'
import { formatCurrency } from '@/lib/financial'

type Expense = {
  id: string
  category: string
  actual_amount: number
  notes: string | null
  created_at: string
  description: string | null
  due_date: string | null
  paid_date: string | null
  status: 'planned' | 'paid' | 'canceled'
  is_recurring: boolean
}

type CustomCategory = { id: string; name: string; slug: string; icon: string; bucket: string }

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budget, setBudget] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [formData, setFormData] = useState({
    category: 'mercado',
    actual_amount: '',
    notes: '',
    description: '',
    due_date: new Date().toISOString().slice(0, 10),
    status: 'paid' as 'planned' | 'paid',
    is_recurring: false,
  })

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7) + '-01'

        const [{ data: expensesData }, { data: categoryData }] = await Promise.all([supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .gte('month', currentMonth)
          .order('due_date', { ascending: false }), supabase.from('user_categories').select('*').eq('user_id', user.id).eq('archived', false).neq('bucket', 'income').order('name')])

        if (expensesData) {
          setExpenses(expensesData)
        }
        setCustomCategories(categoryData || [])

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
            description: formData.description.trim() || formData.notes.trim() || 'Gasto registrado',
            due_date: formData.due_date,
            paid_date: formData.status === 'paid' ? new Date().toISOString().slice(0, 10) : null,
            status: formData.status,
            is_recurring: formData.is_recurring,
            recurrence: formData.is_recurring ? 'monthly' : null,
          })
          .select()

        if (data) {
          setExpenses([data[0], ...expenses])
          setFormData({
            category: 'mercado',
            actual_amount: '',
            notes: '',
            description: '',
            due_date: new Date().toISOString().slice(0, 10),
            status: 'paid',
            is_recurring: false,
          })
          setShowForm(false)
        }
      }
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  const addCustomCategory = async () => {
    const name = newCategory.trim()
    if (!name) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const slug = `custom-${name.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
    const { data, error } = await supabase.from('user_categories').insert({ user_id: user.id, name, slug, icon: '🏷️', bucket: 'essential' }).select().single()
    if (!error && data) { setCustomCategories((items) => [...items, data]); setFormData((current) => ({ ...current, category: data.slug })); setNewCategory('') }
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
  const categoriesInUse = Array.from(new Set(expenses.map((expense) => expense.category)))
  const categoryTotals = categoriesInUse.map((cat) => ({
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
          <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
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
                <label className="label">Descrição</label>
                <input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input" placeholder="Ex.: Conta de energia" required />
              </div>
              <div>
                <label className="label">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                >
                  {CATEGORY_GROUPS.map((group) => (
                    <optgroup key={group} label={group}>
                      {EXPENSE_CATEGORIES.filter((category) => category.group === group).map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  {customCategories.length > 0 && <optgroup label="Minhas categorias">{customCategories.map((category) => <option key={category.id} value={category.slug}>{category.icon} {category.name}</option>)}</optgroup>}
                </select>
                <div className="mt-2 flex gap-2"><input className="input" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Criar categoria própria" /><button type="button" onClick={addCustomCategory} className="btn btn-secondary">Criar</button></div>
              </div>

              <div>
                <label className="label">Vencimento</label>
                <input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="label">Situação</label>
                <select className="input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as 'planned' | 'paid' })}><option value="planned">Previsto</option><option value="paid">Já foi pago</option></select>
              </div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_recurring} onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })} /> Repetir todo mês</label>
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
                  <span>{getExpenseCategoryLabel(cat.category)}</span>
                  <span className="font-bold">{formatCurrency(cat.total)}</span>
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
                    {new Date((expense.due_date || expense.created_at) + (expense.due_date ? 'T12:00:00' : '')).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3">{getExpenseCategoryLabel(expense.category)}</td>
                  <td className="py-3 text-sm text-gray-600"><b className="block text-gray-900">{expense.description || expense.notes}</b>{expense.status === 'planned' ? <span className="text-amber-700">Previsto</span> : <span className="text-emerald-700">Pago</span>}</td>
                  <td className="py-3 text-right font-bold">
                    {formatCurrency(expense.actual_amount || 0)}
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
