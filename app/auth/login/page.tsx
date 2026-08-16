'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      // Vincula automaticamente uma compra feita antes da criação da conta.
      await fetch('/api/access/claim', { method: 'POST' })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-73px)] bg-[#f7f8f4] lg:grid-cols-2">
      <aside className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div><p className="text-sm font-black uppercase tracking-[.2em] text-emerald-400">Sua jornada continua</p><h2 className="mt-5 max-w-xl text-5xl font-black leading-[1.02] tracking-tight">Clareza hoje. Liberdade amanhã.</h2><p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">Entre para registrar seus avanços, cumprir sua próxima missão e acompanhar cada dívida que ficou para trás.</p></div>
        <div className="rounded-3xl border border-white/10 bg-white/[.05] p-6"><p className="text-sm text-slate-400">O que importa agora</p><p className="mt-2 text-xl font-black">Um próximo passo possível.</p></div>
      </aside>
      <div className="flex items-center justify-center px-4 py-12 md:px-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl md:p-9">
        <p className="text-sm font-black uppercase tracking-[.16em] text-emerald-600">Área do cliente</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Bem-vindo de volta</h1>
        <p className="mb-7 mt-2 text-slate-500">Acesse sua rota financeira.</p>

        <form onSubmit={handleSignIn} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="label">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="label">Senha</label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pr-12"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-lg text-gray-500 hover:text-gray-900"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-950 px-5 py-3.5 font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Fazer Login'}
          </button>

          <div className="text-right">
            <Link href="/auth/recuperar-senha" className="text-sm font-bold text-emerald-700 hover:underline">
              Esqueci minha senha
            </Link>
          </div>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Não tem conta?{' '}
          <Link href="/auth/register" className="font-bold text-emerald-700 hover:underline">
            Criar meu acesso
          </Link>
        </p>
      </div>
      </div>
    </div>
  )
}
