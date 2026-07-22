'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Register() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Sign up with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          plan: 'free',
        })

        if (profileError) throw profileError

        // Create initial budget for current month
        const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7) + '-01'
        await supabase.from('monthly_budgets').insert({
          user_id: authData.user.id,
          month: currentMonth,
          monthly_income: 0,
          essentials_budget: 0,
          desires_budget: 0,
          savings_budget: 0,
        })

        router.push('/dashboard/diagnostico')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="card max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2">Criar Conta</h1>
        <p className="text-center text-gray-600 mb-6">Comece sua jornada financeira agora</p>

        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="label">Nome Completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
              placeholder="Seu nome"
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="label">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Criando conta...' : 'Criar Conta Grátis'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Já tem conta?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
            Faça login
          </Link>
        </p>

        <p className="text-center text-xs text-gray-500 mt-4">
          Ao criar conta, você concorda com nossos{' '}
          <Link href="#" className="hover:underline">
            Termos de Serviço
          </Link>
        </p>
      </div>
    </div>
  )
}
