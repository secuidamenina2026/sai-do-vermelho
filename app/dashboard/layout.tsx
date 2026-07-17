'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user')
        if (!res.ok) router.push('/auth/login')
        else setUser(await res.json())
      } catch {
        router.push('/auth/login')
      }
    }
    checkAuth()
  }, [router])

  if (!user) return <div className="flex items-center justify-center min-h-screen">Carregando...</div>

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-blue-900 text-white">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-8">💰 SAI DO VERMELHO</h2>
          <nav className="space-y-4">
            <Link href="/dashboard" className="block hover:bg-blue-800 p-3 rounded">📊 Dashboard</Link>
            <Link href="/dashboard/orcamento" className="block hover:bg-blue-800 p-3 rounded">📈 Orçamento</Link>
            <Link href="/dashboard/gastos" className="block hover:bg-blue-800 p-3 rounded">💸 Gastos</Link>
            <Link href="/dashboard/dividas" className="block hover:bg-blue-800 p-3 rounded">💳 Dívidas</Link>
            <Link href="/dashboard/metas" className="block hover:bg-blue-800 p-3 rounded">🎯 Metas</Link>
            <Link href="/dashboard/resumo" className="block hover:bg-blue-800 p-3 rounded">📄 Resumo</Link>
          </nav>
        </div>
      </aside>

      <main className="flex-1">
        <header className="bg-white shadow-sm p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Bem-vindo, {user.full_name}!</h1>
            <button
              onClick={() => {
                localStorage.removeItem('auth')
                router.push('/')
              }}
              className="btn btn-secondary"
            >
              Sair
            </button>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
