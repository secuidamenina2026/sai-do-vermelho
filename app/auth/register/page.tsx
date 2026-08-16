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
  const [success, setSuccess] = useState('')

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

        // Se a compra aconteceu antes do cadastro, vincula o acesso pelo
        // mesmo e-mail utilizado no checkout.
        if (authData.session) {
          await fetch('/api/access/claim', { method: 'POST' })
          router.push('/onboarding')
        } else {
          setSuccess('Conta criada. Abra o e-mail que enviamos para confirmar seu cadastro e depois faça o login.')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-73px)] bg-[#f7f8f4] lg:grid-cols-[.9fr_1.1fr]">
      <aside className="hidden bg-emerald-500 p-12 text-slate-950 lg:flex lg:flex-col lg:justify-between">
        <div><p className="text-sm font-black uppercase tracking-[.2em]">Primeiro acesso</p><h2 className="mt-5 max-w-xl text-5xl font-black leading-[1.02] tracking-tight">Sua vida financeira merece uma direção.</h2><p className="mt-6 max-w-lg text-lg leading-8 text-emerald-950/75">Use o mesmo e-mail informado na compra. Assim, seus 12 meses de acesso serão reconhecidos automaticamente.</p></div>
        <div className="grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-white/35 p-4"><b className="block text-xl">5 min</b><span className="text-xs">primeiro plano</span></div><div className="rounded-2xl bg-white/35 p-4"><b className="block text-xl">12 meses</b><span className="text-xs">de acesso</span></div><div className="rounded-2xl bg-white/35 p-4"><b className="block text-xl">30 IA</b><span className="text-xs">por mês</span></div></div>
      </aside>
      <div className="flex items-center justify-center px-4 py-12 md:px-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl md:p-9">
        <p className="text-sm font-black uppercase tracking-[.16em] text-emerald-600">Ative sua jornada</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Criar minha conta</h1>
        <p className="mb-7 mt-2 text-slate-500">Use o mesmo e-mail utilizado no pagamento.</p>

        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">{success}</div>}

          <div>
            <label htmlFor="full-name" className="label">Nome Completo</label>
            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
              placeholder="Seu nome"
              required
            />
          </div>

          <div>
            <label htmlFor="register-email" className="label">Email</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="register-password" className="label">Senha</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-950 px-5 py-3.5 font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? 'Criando conta...' : 'Criar minha conta'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Já tem conta?{' '}
          <Link href="/auth/login" className="font-bold text-emerald-700 hover:underline">
            Faça login
          </Link>
        </p>

        <p className="text-center text-xs text-gray-500 mt-4">
          Use o mesmo e-mail informado no pagamento para liberar seu acesso automaticamente.
        </p>
        <p className="text-center text-xs text-gray-500 mt-3">
          Ao criar conta, você concorda com nossos{' '}
          <Link href="/termos" className="hover:underline">
            Termos de Serviço
          </Link>
          {' '}e nossa{' '}
          <Link href="/privacidade" className="hover:underline">Política de Privacidade</Link>
        </p>
      </div>
      </div>
    </div>
  )
}
