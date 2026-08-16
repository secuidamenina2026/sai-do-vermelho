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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        const accessResponse = await fetch('/api/access/status', { cache: 'no-store' })
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
    }
    checkAuth()
  }, [router])

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
