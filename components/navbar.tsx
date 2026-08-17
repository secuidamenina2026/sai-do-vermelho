'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckoutLink } from '@/components/checkout-link'

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#f7f8f4]/90 backdrop-blur-xl">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-lg font-black text-emerald-400">S</span>
          <span className="text-lg font-black tracking-tight">Sai do <span className="text-emerald-600">Vermelho</span></span>
        </Link>

        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm font-bold text-slate-600 hover:text-slate-950"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold hover:bg-slate-50"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="hidden text-sm font-bold text-slate-600 hover:text-slate-950 sm:block"
                  >
                    Entrar
                  </Link>
                  <CheckoutLink
                    className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    Começar por R$ 97
                  </CheckoutLink>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
