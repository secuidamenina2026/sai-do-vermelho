'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export function Sidebar() {
  const pathname = usePathname()

  const items = [
    { href: '/dashboard', label: '📊 Dashboard', icon: '📊' },
    { href: '/dashboard/diagnostico', label: '🩺 Diagnóstico Grátis', icon: '🩺' },
    { href: '/dashboard/orcamento', label: '💰 Orçamento', icon: '💰' },
    { href: '/dashboard/gastos', label: '💳 Gastos', icon: '💳' },
    { href: '/dashboard/dividas', label: '📉 Dívidas', icon: '📉' },
    { href: '/dashboard/plano', label: '🚀 Meu Plano', icon: '🚀' },
    { href: '/dashboard/metas', label: '🎯 Metas', icon: '🎯' },
    { href: '/dashboard/ia', label: '🤖 Consultoria IA', icon: '🤖' },
    { href: '/dashboard/resumo', label: '✨ Diagnóstico Mensal', icon: '✨' },
  ]

  return (
    <aside className="w-full md:w-64 bg-white shadow-sm border-r border-gray-200 md:min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-bold flex items-center gap-2">
          💰 Sai do Vermelho
        </h2>
      </div>

      <nav className="flex md:block gap-1 overflow-x-auto px-3 pb-3 md:space-y-1 md:pb-0">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'block whitespace-nowrap px-4 py-3 rounded-lg transition-colors',
              pathname === item.href
                ? 'bg-blue-100 text-blue-900 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
