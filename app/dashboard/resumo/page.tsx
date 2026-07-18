'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Summary() {
  const [budget, setBudget] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [debts, setDebts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7) + '-01'

        const [budgetResult, expensesResult, goalsResult, debtsResult] = await Promise.all([
          supabase
            .from('monthly_budgets')
            .select('*')
            .eq('user_id', user.id)
            .eq('month', currentMonth)
            .single(),
          supabase
            .from('expenses')
            .select('*')
            .eq('user_id', user.id)
            .gte('month', currentMonth),
          supabase
            .from('goals')
            .select('*')
            .eq('user_id', user.id),
          supabase
            .from('debts')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_paid', false),
        ])

        if (budgetResult.data) setBudget(budgetResult.data)
        if (expensesResult.data) setExpenses(expensesResult.data)
        if (goalsResult.data) setGoals(goalsResult.data)
        if (debtsResult.data) setDebts(debtsResult.data)
      }
    } catch (error) {
      console.error('Error loading summary:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.actual_amount || 0), 0)
  const essentialsSpent = expenses
    .filter((e) => ['moradia', 'mercado', 'transporte', 'saúde'].includes(e.category))
    .reduce((sum, e) => sum + (e.actual_amount || 0), 0)
  const desiresSpent = expenses
    .filter((e) => ['lazer', 'delivery', 'educação', 'outro'].includes(e.category))
    .reduce((sum, e) => sum + (e.actual_amount || 0), 0)

  const totalGoals = goals.reduce((sum, g) => sum + (g.target_amount || 0), 0)
  const totalSaved = goals.reduce((sum, g) => sum + (g.saved_amount || 0), 0)

  const totalDebts = debts.reduce((sum, d) => sum + (d.total_amount || 0), 0)
  const totalMonthlyDebtPayment = debts.reduce((sum, d) => sum + (d.monthly_payment || 0), 0)

  const estimatedSavings = budget?.monthly_income 
    ? Math.max(0, budget.monthly_income - totalExpenses - totalMonthlyDebtPayment)
    : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">📈 Resumo do Mês</h1>
        <p className="text-gray-600">Visão geral completa de sua situação financeira</p>
      </div>

      {/* Top KPIs */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-gray-600 text-sm">Renda</p>
          <p className="text-3xl font-bold text-green-600">R$ {budget?.monthly_income?.toFixed(2) || '0,00'}</p>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <p className="text-gray-600 text-sm">Gastos</p>
          <p className="text-3xl font-bold text-red-600">R$ {totalExpenses.toFixed(2)}</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-gray-600 text-sm">Dívidas (Mensal)</p>
          <p className="text-3xl font-bold text-blue-600">R$ {totalMonthlyDebtPayment.toFixed(2)}</p>
        </div>
        <div className={`card bg-gradient-to-br ${estimatedSavings >= 0 ? 'from-purple-50 to-purple-100 border-purple-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
          <p className="text-gray-600 text-sm">Disponível</p>
          <p className={`text-3xl font-bold ${estimatedSavings >= 0 ? 'text-purple-600' : 'text-orange-600'}`}>
            R$ {estimatedSavings.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Expense Breakdown */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Gastos por Categoria</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Essenciais (50%)</span>
                <span className="font-bold">R$ {essentialsSpent.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full" 
                  style={{ width: `${Math.min((essentialsSpent / budget?.essentials_budget) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Limite: R$ {budget?.essentials_budget?.toFixed(2)}
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Desejos (30%)</span>
                <span className="font-bold">R$ {desiresSpent.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full" 
                  style={{ width: `${Math.min((desiresSpent / budget?.desires_budget) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Limite: R$ {budget?.desires_budget?.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Progresso das Metas</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Total Economizado</span>
                <span className="font-bold text-green-600">R$ {totalSaved.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full" 
                  style={{ width: `${Math.min((totalSaved / totalGoals) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Meta: R$ {totalGoals.toFixed(2)}
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>{goals.length}</strong> meta(s) ativa(s) | 
                <strong className="text-green-600 ml-2">
                  {goals.filter((g) => g.saved_amount >= g.target_amount).length}
                </strong> meta(s) atingida(s)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Debts Status */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Situação das Dívidas</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Dívida Total</p>
            <p className="text-2xl font-bold text-red-600">R$ {totalDebts.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Dívidas Ativas</p>
            <p className="text-2xl font-bold">{debts.length}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Tempo Estimado (Meses)</p>
            <p className="text-2xl font-bold">
              {totalMonthlyDebtPayment > 0 
                ? Math.ceil(totalDebts / totalMonthlyDebtPayment)
                : '∞'}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">💡 Recomendações</h2>
        <ul className="space-y-3 text-gray-700">
          {estimatedSavings < 0 && (
            <li className="flex gap-2">
              <span>⚠️</span>
              <span>Você está gastando mais do que ganha! Revise suas despesas.</span>
            </li>
          )}
          {essentialsSpent > budget?.essentials_budget * 1.1 && (
            <li className="flex gap-2">
              <span>📌</span>
              <span>Seus gastos essenciais excedem o orçamento. Considere reduzir custos fixos.</span>
            </li>
          )}
          {desiresSpent > budget?.desires_budget * 1.2 && (
            <li className="flex gap-2">
              <span>🎯</span>
              <span>Seus gastos com desejos ultrapassaram o orçamento. Seja mais seletivo.</span>
            </li>
          )}
          {goals.length === 0 && (
            <li className="flex gap-2">
              <span>🎪</span>
              <span>Defina suas metas financeiras para poupar com propósito!</span>
            </li>
          )}
          {debts.length > 2 && (
            <li className="flex gap-2">
              <span>💳</span>
              <span>Você tem várias dívidas. Considere usar o sistema bola de neve.</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
