import Link from 'next/link'
import { CHECKOUT_URL } from '@/lib/commerce'

const features = [
  'Diagnóstico financeiro e plano de ação',
  'Plano completo para quitar suas dívidas',
  'Orçamento 50/30/20 adaptado à sua realidade',
  'Controle detalhado de entradas e gastos',
  'Estratégias bola de neve e avalanche',
  'Metas e construção da primeira reserva',
  '30 orientações personalizadas por IA por mês',
  'Diagnóstico mensal com sua próxima missão',
  'Atualizações e suporte humano durante o acesso',
]

export function Pricing() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid items-center gap-12 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <p className="eyebrow">Oferta de lançamento</p>
          <h2 className="section-title">Um ano inteiro para mudar sua relação com o dinheiro.</h2>
          <p className="section-copy">Sem mensalidade, sem renovação automática e sem letras pequenas. Você paga uma vez e usa o sistema completo por 12 meses.</p>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600">
            <strong className="block text-slate-950">Garantia incondicional de 7 dias</strong>
            Entre, conheça o sistema e comece seu plano. Se não fizer sentido para você, solicite o reembolso dentro do prazo.
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl md:p-10">
          <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="relative">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-7 sm:flex-row sm:items-start sm:justify-between">
              <div><p className="text-sm font-black uppercase tracking-[.18em] text-emerald-400">Acesso completo</p><h3 className="mt-2 text-2xl font-black">Sai do Vermelho</h3></div>
              <div className="sm:text-right"><p className="text-5xl font-black tracking-tight">R$ 97</p><p className="mt-1 text-sm text-slate-400">pagamento único</p></div>
            </div>
            <ul className="my-8 grid gap-4 sm:grid-cols-2">
              {features.map((feature) => <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-300"><span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-xs font-black text-slate-950">✓</span><span>{feature}</span></li>)}
            </ul>
            <Link href={CHECKOUT_URL} className="flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-400 px-6 py-4 text-center text-lg font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-300">Começar agora por R$ 97 <span>→</span></Link>
            <p className="mt-4 text-center text-xs text-slate-500">12 meses de acesso · Compra segura · Garantia de 7 dias</p>
          </div>
        </div>
      </div>
    </div>
  )
}
