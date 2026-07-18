'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Budget() {
  const [budget, setBudget] = useState<any>(null)
  const [income, setIncome] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadBudget = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7) + '-01'
          const { data } = await supabase
            .from('monthly_budgets')
            .select('*')
            .eq('user_id', user.id)
            .eq('month', currentMonth)
            .single()

          if (data) {
            setBudget(data)
            setIncome(data.monthly_income.toString())
          }
        }
      } catch (error) {
        console.error('Error loading budget:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBudget()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const incomeValue = parseFloat(income) || 0
        const essentials = incomeValue * 0.5
        const desires = incomeValue * 0.3
        const savings = incomeValue * 0.2

        const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7) + '-01'
        
        if (budget?.id) {
          await supabase
            .from('monthly_budgets')
            .update({
              monthly_income: incomeValue,
              essentials_budget: essentials,
              desires_budget: desires,
              savings_budget: savings,
            })
            .eq('id', budget.id)
        } else {
          await supabase
            .from('monthly_budgets')
            .insert({
              user_id: user.id,
              month: currentMonth,
              monthly_income: incomeValue,
              essentials_budget: essentials,
              desires_budget: desires,
              savings_budget: savings,
            })
        }

        setBudget({
          ...budget,
          monthly_income: incomeValue,
          essentials_budget: essentials,
          desires_budget: desires,
          savings_budget: savings,
        })
      }
    } catch (error) {
      console.error('Error saving budget:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  const incomeValue = parseFloat(income) || 0
  const essentials = incomeValue * 0.5
  const desires = incomeValue * 0.3
  const savings = incomeValue * 0.2

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">📊 Seu Orçamento 50-30-20</h1>
        <p className="text-gray-600">
          O método 50-30-20: dedique 50% à essenciais, 30% a desejos e 20% à poupança.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Sua Renda Mensal</h2>

          <div className="space-y-4">
            <div>
              <label className="label">Renda Mensal (R$)</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="input text-2xl font-bold"
                placeholder="0,00"
              />
              <p className="text-xs text-gray-500 mt-2">
                Inclua seu salário ou renda total do mês (antes de descontos)
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary w-full"
            >
              {saving ? 'Salvando...' : 'Salvar Orçamento'}
            </button>
          </div>
        </div>

        {/* Calculation Section */}
        <div className="space-y-4">
          {/* Essentials */}
          <div className="card">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">🏠 Essenciais (50%)</h3>
              <span className="text-2xl font-bold text-green-600">
                R$ {essentials.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Moradia, alimentação, transporte, contas básicas
            </p>
            <div className="mt-3 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full" 
                style={{ width: '50%' }}
              ></div>
            </div>
          </div>

          {/* Desires */}
          <div className="card">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">🎉 Desejos (30%)</h3>
              <span className="text-2xl font-bold text-blue-600">
                R$ {desires.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Lazer, entretenimento, restaurantes, hobbies
            </p>
            <div className="mt-3 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full" 
                style={{ width: '30%' }}
              ></div>
            </div>
          </div>

          {/* Savings */}
          <div className="card">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">💰 Poupança (20%)</h3>
              <span className="text-2xl font-bold text-purple-600">
                R$ {savings.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Investimentos, fundo de emergência, aplicações
            </p>
            <div className="mt-3 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-purple-600 h-3 rounded-full" 
                style={{ width: '20%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="card bg-blue-50 border-blue-200">
        <h2 className="font-bold mb-4">💡 Dicas do Sistema 50-30-20</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ Se seus essenciais excederem 50%, considere reduzir custos fixos</li>
          <li>✓ A categoria desejos é onde você pode fazer cortes se precisar economizar</li>
          <li>✓ Mantenha a poupança em 20% mesmo que seja pequeno o valor inicial</li>
          <li>✓ Revise este orçamento mensalmente para acompanhar mudanças</li>
        </ul>
      </div>
    </div>
  )
}
