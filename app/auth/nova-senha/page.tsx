'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NovaSenha() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (password.length < 8) return setError('Use pelo menos 8 caracteres.')
    if (password !== confirmation) return setError('As senhas não coincidem.')
    setLoading(true)
    setError('')
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError('O link expirou ou não é válido. Solicite uma nova recuperação.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_#d1fae5,_#f8fafc_45%,_#ecfdf5)] px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-emerald-100 bg-white p-7 shadow-2xl shadow-emerald-950/10 md:p-10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-950 text-2xl text-white">✓</div>
        <h1 className="mb-2 text-center text-3xl font-bold">Criar nova senha</h1>
        <p className="mb-6 text-center text-gray-600">Escolha uma senha segura para voltar à sua jornada.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700" role="alert">{error}</div>}
          <div><label htmlFor="new-password" className="label">Nova senha</label><input id="new-password" type="password" className="input" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required autoComplete="new-password" /></div>
          <div><label htmlFor="confirm-password" className="label">Confirmar senha</label><input id="confirm-password" type="password" className="input" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={8} required autoComplete="new-password" /></div>
          <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Salvando...' : 'Salvar nova senha'}</button>
        </form>
      </div>
    </div>
  )
}
