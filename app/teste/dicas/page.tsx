import { notFound } from 'next/navigation'
import { TipsManager } from '@/components/tips-manager'
import { NotificationInbox } from '@/components/notification-inbox'
export const dynamic = 'force-dynamic'
export default function PreviewTips() {
  if (process.env.VERCEL_ENV === 'production' || (!process.env.VERCEL_ENV && process.env.NODE_ENV === 'production' && process.env.ENABLE_LOCAL_PREVIEW !== 'true')) notFound()
  return <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-8"><div className="rounded-xl border border-amber-300 bg-amber-50 p-5"><b>Versão de teste · dados fictícios</b><p className="mt-2">Este painel salva apenas neste navegador. Simular o envio avança o relógio e entrega somente à caixa de teste abaixo. Não acessa contas reais nem comprova gravação no Supabase.</p></div><TipsManager preview /><NotificationInbox preview /></div>
}
