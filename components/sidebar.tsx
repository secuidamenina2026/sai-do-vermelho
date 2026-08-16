'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const sections = [
  { label: 'Hoje', items: [
    { href: '/dashboard', label: 'Visão geral', icon: '⌂' },
    { href: '/dashboard/gastos', label: 'Gastos', icon: '↗' },
    { href: '/dashboard/entradas', label: 'Entradas', icon: '↙' },
    { href: '/dashboard/calendario', label: 'Calendário', icon: '□' },
  ]},
  { label: 'Minha virada', items: [
    { href: '/dashboard/plano', label: 'Meu plano', icon: '◇' },
    { href: '/dashboard/dividas', label: 'Dívidas', icon: '−' },
    { href: '/dashboard/orcamento', label: 'Orçamento', icon: '%' },
    { href: '/dashboard/reserva', label: 'Minha reserva', icon: '△' },
    { href: '/dashboard/metas', label: 'Metas', icon: '◎' },
  ]},
  { label: 'Inteligência', items: [
    { href: '/dashboard/resumo', label: 'Diagnóstico mensal', icon: '✦' },
    { href: '/dashboard/ia', label: 'Orientação IA', icon: '✧' },
    { href: '/dashboard/diagnostico', label: 'Raio-X financeiro', icon: '+' },
  ]},
]

export function Sidebar() {
  const pathname = usePathname()
  const items = sections.flatMap(section => section.items)
  return (
    <>
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white md:block">
        <div className="sticky top-[73px] flex h-[calc(100vh-73px)] flex-col overflow-y-auto px-4 py-6">
          <div className="mb-6 rounded-2xl bg-slate-950 p-4 text-white"><p className="text-xs font-black uppercase tracking-[.16em] text-emerald-400">Sua jornada</p><p className="mt-2 font-black">Um passo por vez.</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-2/5 rounded-full bg-emerald-400" /></div></div>
          <nav className="space-y-6">
            {sections.map(section => <div key={section.label}><p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[.18em] text-slate-400">{section.label}</p><div className="space-y-1">{section.items.map(item => <Link key={item.href} href={item.href} className={clsx('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition', pathname === item.href ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950')}><span className={clsx('flex h-7 w-7 items-center justify-center rounded-lg text-sm', pathname === item.href ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 text-slate-500')}>{item.icon}</span>{item.label}</Link>)}</div></div>)}
          </nav>
          <Link href="/dashboard/conta" className="mt-6 flex items-center gap-3 border-t border-slate-100 px-3 pt-5 text-sm font-bold text-slate-500 hover:text-slate-950"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">⚙</span>Minha conta</Link>
        </div>
      </aside>

      <nav className="sticky top-[73px] z-40 flex gap-2 overflow-x-auto border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur md:hidden">
        {items.map(item => <Link key={item.href} href={item.href} className={clsx('flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-black', pathname === item.href ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600')}><span>{item.icon}</span>{item.label}</Link>)}
      </nav>
    </>
  )
}
