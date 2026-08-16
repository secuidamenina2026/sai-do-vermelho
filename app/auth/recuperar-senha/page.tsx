'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RecuperarSenha() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const redirectTo = `${window.location.origin}/auth/nova-senha`
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

    if (resetError) setError('Não foi possível enviar o link. Confira o e-mail e tente novamente.')
    else setMessage('Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha.')
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_#d1fae5,_#f8fafc_45%,_#ecfdf5)] px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-emerald-100 bg-white p-7 shadow-2xl shadow-emerald-950/10 md:p-10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-950 text-2xl text-white">🔐</div>
        <h1 className="mb-2 text-center text-3xl font-bold">Recuperar senha</h1>
        <p className="mb-6 text-center text-gray-600">Enviaremos um link seguro para o seu e-mail.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && <div className="rounded border border-green-200 bg-green-50 px-4 py-3 text-green-800" role="status">{message}</div>}
          {error && <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700" role="alert">{error}</div>}
          <div>
            <label htmlFor="recovery-email" className="label">E-mail</label>
            <input id="recovery-email" type="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          </div>
          <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Enviando...' : 'Enviar link de recuperação'}</button>
        </form>
        <p className="mt-6 text-center text-sm"><Link href="/auth/login" className="font-semibold text-emerald-700 hover:underline">Voltar ao login</Link></p>
      </div>
    </div>
  )
}
