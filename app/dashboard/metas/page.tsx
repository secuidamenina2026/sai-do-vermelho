'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Goals() {
  const [goals, setGoals] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    goal_name: '',
    target_amount: '',
    target_date: '',
  })

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('target_date', { ascending: true })

        if (data) {
          setGoals(data)
        }
      }
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('goals')
          .insert({
            user_id: user.id,
            goal_name: formData.goal_name,
            target_amount: parseFloat(formData.target_amount),
            saved_amount: 0,
            target_date: formData.target_date || null,
          })
          .select()

        if (data) {
          setGoals([...goals, data[0]])
          setFormData({
            goal_name: '',
            target_amount: '',
            target_date: '',
          })
          setShowForm(false)
        }
      }
    } catch (error) {
      console.error('Error adding goal:', error)
    }
  }

  const handleUpdateSavedAmount = async (id: string, amount: string) => {
    const newAmount = parseFloat(amount)
    try {
      await supabase
        .from('goals')
        .update({ saved_amount: newAmount })
        .eq('id', id)

      setGoals(goals.map((g) => 
        g.id === id ? { ...g, saved_amount: newAmount } : g
      ))
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  const handleDeleteGoal = async (id: string) => {
    try {
      await supabase.from('goals').delete().eq('id', id)
      setGoals(goals.filter((g) => g.id !== id))
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  const totalTarget = goals.reduce((sum, g) => sum + (g.target_amount || 0), 0)
  const totalSaved = goals.reduce((sum, g) => sum + (g.saved_amount || 0), 0)
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">🎯 Metas Financeiras</h1>
        <p className="text-gray-600">Defina e acompanhe suas metas de poupança</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-600 text-sm">Meta Total</p>
          <p className="text-3xl font-bold">R$ {totalTarget.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Total Economizado</p>
          <p className="text-3xl font-bold text-green-600">R$ {totalSaved.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Falta para Atingir</p>
          <p className="text-3xl font-bold">R$ {(totalTarget - totalSaved).toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Progresso Geral</p>
          <p className="text-3xl font-bold">{overallProgress.toFixed(0)}%</p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-4">
        <div 
          className="bg-green-600 h-4 rounded-full transition-all" 
          style={{ width: `${Math.min(overallProgress, 100)}%` }}
        ></div>
      </div>

      {/* Add Goal Form */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Adicionar Meta</h2>
          {showForm && <button className="text-sm text-gray-500" onClick={() => setShowForm(false)}>✕</button>}
        </div>

        {showForm ? (
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label className="label">Nome da Meta</label>
              <input
                type="text"
                value={formData.goal_name}
                onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })}
                className="input"
                placeholder="Ex: Carro, Férias, Fundo de emergência..."
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Valor Meta (R$)</label>
                <input
                  type="number"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  className="input"
                  placeholder="0,00"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="label">Data Alvo (opcional)</label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Adicionar Meta
            </button>
          </form>
        ) : (
          <button onClick={() => setShowForm(true)} className="btn btn-primary w-full">
            + Nova Meta
          </button>
        )}
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="card bg-blue-50 border-blue-200 text-center py-8">
            <div className="text-4xl mb-2">📍</div>
            <h3 className="font-bold mb-2">Nenhuma meta definida</h3>
            <p>Defina suas primeiras metas para começar a poupar com propósito</p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = goal.target_amount > 0 
              ? (goal.saved_amount / goal.target_amount) * 100 
              : 0
            const remaining = Math.max(0, goal.target_amount - goal.saved_amount)
            const daysRemaining = goal.target_date
              ? Math.ceil(
                  (new Date(goal.target_date).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
                )
              : null

            return (
              <div key={goal.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{goal.goal_name}</h3>
                    <p className="text-sm text-gray-600">
                      {daysRemaining !== null && daysRemaining > 0 
                        ? `${daysRemaining} dias para atingir`
                        : 'Sem data definida'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">R$ {goal.saved_amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">de R$ {goal.target_amount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Progresso</span>
                    <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all" 
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Falta: <span className="font-bold">R$ {remaining.toFixed(2)}</span>
                </p>

                <div className="space-y-2">
                  <div>
                    <label className="label text-xs">Atualizar Valor Economizado</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        defaultValue={goal.saved_amount}
                        onBlur={(e) => handleUpdateSavedAmount(goal.id, e.target.value)}
                        className="input flex-1"
                        placeholder="0,00"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="w-full btn btn-secondary text-sm"
                  >
                    Deletar Meta
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
