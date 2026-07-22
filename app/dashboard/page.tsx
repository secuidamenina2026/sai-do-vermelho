'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [budget, setBudget] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)

          // Load user profile
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

          if (userData) {
            setUser(userData)
          }

          // Load current month budget
          const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7) + '-01'
          const { data: budgetData } = await supabase
            .from('monthly_budgets')
            .select('*')
            .eq('user_id', user.id)
            .eq('month', currentMonth)
            .single()

          if (budgetData) {
            setBudget(budgetData)
          }

          // Load current month expenses
          const { data: expensesData } = await supabase
            .from('expenses')
            .select('*')
            .eq('user_id', user.id)
            .gte('month', currentMonth)
            .order('created_at', { ascending: false })
            .limit(10)

          if (expensesData) {
            setExpenses(expensesData)
          }
        }
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  const essentialsPercentage = budget?.monthly_income 
    ? (budget.essentials_budget / budget.monthly_income) * 100 
    : 0
  const desiresPercentage = budget?.monthly_income 
    ? (budget.desires_budget / budget.monthly_income) * 100 
    : 0
  const savingsPercentage = budget?.monthly_income 
    ? (budget.savings_budget / budget.monthly_income) * 100 
    : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Bem-vindo, {user?.full_name}! 👋</h1>
        <p className="text-gray-600">Aqui está sua visão geral financeira</p>
      </div>

      {/* Diagnóstico CTA — destaque principal */}
      <Link
        href="/dashboard/diagnostico"
        className="block bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
      >
        <div className="flex items-center gap-4">
          <div className="text-5xl">🩺</div>
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold mb-1">Faça seu Diagnóstico Financeiro GRÁTIS</h2>
            <p className="text-white/90 text-sm md:text-base">
              Em 2 minutos você descobre o tamanho real das suas dívidas e recebe um plano de ataque. Comece por aqui! 👇
            </p>
          </div>
          <div className="hidden md:block text-3xl">→</div>
        </div>
      </Link>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-600 text-sm">Renda Mensal</p>
          <p className="text-3xl font-bold">R$ {budget?.monthly_income?.toFixed(2) || '0,00'}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Essenciais (50%)</p>
          <p className="text-3xl font-bold">R$ {budget?.essentials_budget?.toFixed(2) || '0,00'}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Desejos (30%)</p>
          <p className="text-3xl font-bold">R$ {budget?.desires_budget?.toFixed(2) || '0,00'}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Poupança (20%)</p>
          <p className="text-3xl font-bold">R$ {budget?.savings_budget?.toFixed(2) || '0,00'}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Budget Visualization */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Orçamento 50-30-20</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Essenciais</span>
                <span className="text-sm">{essentialsPercentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(essentialsPercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Desejos</span>
                <span className="text-sm">{desiresPercentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(desiresPercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Poupança</span>
                <span className="text-sm">{savingsPercentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(savingsPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <Link href="/dashboard/orcamento" className="btn btn-primary w-full mt-6">
            Editar Orçamento
          </Link>
        </div>

        {/* Recent Expenses */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Gastos Recentes</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {expenses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum gasto registrado</p>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium capitalize">{expense.category}</p>
                    <p className="text-sm text-gray-500">{expense.notes}</p>
                  </div>
                  <p className="font-bold">R$ {expense.actual_amount?.toFixed(2) || '0,00'}</p>
                </div>
              ))
            )}
          </div>

          <Link href="/dashboard/gastos" className="btn btn-primary w-full mt-6">
            Ver Todos os Gastos
          </Link>
        </div>
      </div>

      {/* CTA Sections */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link 
          href="/dashboard/dividas"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="text-3xl mb-2">💳</div>
          <h3 className="font-bold mb-1">Gerenciar Dívidas</h3>
          <p className="text-sm text-gray-600">Sistema bola de neve para sair do vermelho</p>
        </Link>

        <Link 
          href="/dashboard/metas"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="font-bold mb-1">Metas Financeiras</h3>
          <p className="text-sm text-gray-600">Defina e acompanhe suas metas de poupança</p>
        </Link>

        <Link
          href="/dashboard/ia"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="font-bold mb-1">Consultoria IA</h3>
          <p className="text-sm text-gray-600">Receba recomendações personalizadas</p>
        </Link>
      </div>
    </div>
  )
}
