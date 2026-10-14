'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { supabase } from '@/lib/supabase'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const checkAuth = async () => {
      setErrorMessage(''); setLoading(true)
      try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError && authError.status !== 401 && authError.status !== 403 && authError.name !== 'AuthSessionMissingError') throw authError
      if (!user) {
        router.push('/auth/login')
        return
      } else {
        const accessResponse = await fetch('/api/access/status', { cache: 'no-store' })
        if (!accessResponse.ok) throw new Error('Não foi possível verificar seu acesso.')
        const access = await accessResponse.json()
        if (!access.active) {
          router.push('/acesso-expirado')
          return
        }
        const { data: profile } = await supabase.from('users').select('onboarding_completed').eq('id', user.id).single()
        if (profile && !profile.onboarding_completed) {
          router.push('/onboarding')
          return
        }
      }
      setLoading(false)
      } catch {
        setErrorMessage('Não foi possível conectar ao sistema. Seus dados não foram alterados. Tente novamente em instantes.')
        setLoading(false)
      }
    }
    checkAuth()
  }, [router, retry])

  if (errorMessage) return <div role="alert" className="mx-auto my-12 max-w-xl rounded-xl border border-red-200 p-6"><p>{errorMessage}</p><button className="btn btn-primary mt-4" onClick={() => setRetry(value => value + 1)}>Tentar novamente</button></div>

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f7f8f4]">
        <div className="flex items-center gap-3 font-bold text-slate-500"><span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />Preparando sua jornada…</div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#f7f8f4] md:flex">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 md:p-8 lg:p-10">
        {children}
      </main>
    </div>
  )
}
