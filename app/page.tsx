import Link from 'next/link'
import { Pricing } from '@/components/pricing'
import { CHECKOUT_URL } from '@/lib/commerce'


const features = [
  ['01', 'Diagnóstico sem julgamento', 'Entenda sua situação em poucos minutos e receba uma rota clara para começar.'],
  ['02', 'Plano para quitar dívidas', 'Compare bola de neve e avalanche e descubra a ordem que faz sentido para você.'],
  ['03', 'Orçamento que cabe na vida real', 'O método 50/30/20 se adapta à sua fase, em vez de fingir que toda renda é igual.'],
  ['04', 'Orientação com inteligência artificial', 'Faça perguntas usando seus próprios números e transforme dúvida em próxima ação.'],
  ['05', 'Metas e primeira reserva', 'Depois de respirar, construa proteção para não voltar ao vermelho.'],
  ['06', 'Progresso que você enxerga', 'Acompanhe dívidas, gastos, vitórias e evolução em uma única jornada.'],
]

const steps = [
  ['1', 'Mostre onde você está', 'Cadastre renda, gastos e dívidas com uma experiência simples e guiada.'],
  ['2', 'Receba sua rota', 'O sistema organiza as prioridades e mostra a próxima decisão com maior impacto.'],
  ['3', 'Avance toda semana', 'Cumpra ações possíveis, acompanhe o progresso e construa sua reserva.'],
]

export default function Home() {
  return (
    <div className="overflow-hidden bg-[#f7f8f4] text-slate-950">
      <section className="relative isolate px-4 pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="hero-glow absolute inset-x-0 top-0 -z-10 h-[680px]" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-bold text-emerald-800 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Um plano prático para retomar o controle
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[.98] tracking-[-0.055em] text-slate-950 md:text-7xl">
              Saia do vermelho com um próximo passo <span className="text-emerald-600">claro.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
              Organize seus gastos, escolha a melhor estratégia para suas dívidas e acompanhe sua evolução até a primeira reserva — sem planilhas complicadas e sem culpa.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={CHECKOUT_URL} className="premium-cta">Quero começar por R$ 97 <span aria-hidden="true">→</span></Link>
              <Link href="#por-dentro" className="premium-cta-secondary">Ver como funciona</Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-600">
              <span>✓ Pagamento único</span><span>✓ 12 meses de acesso</span><span>✓ Garantia de 7 dias</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -left-8 top-20 h-40 w-40 rounded-full bg-emerald-300/30 blur-3xl" />
            <div className="dashboard-preview relative overflow-hidden rounded-[2rem] border border-white/80 bg-slate-950 p-3 shadow-[0_35px_90px_-30px_rgba(15,23,42,.55)]">
              <div className="rounded-[1.4rem] bg-[#f8faf7] p-5 md:p-7">
                <div className="flex items-center justify-between">
                  <div><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Sua jornada</p><p className="mt-1 text-xl font-black">Plano de virada</p></div>
                  <div className="rounded-xl bg-emerald-100 px-3 py-2 text-sm font-black text-emerald-800">Etapa 2 de 4</div>
                </div>
                <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
                  <p className="text-sm text-slate-400">Previsão para sair do vermelho</p><p className="mt-1 text-3xl font-black">Outubro de 2027</p>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[38%] rounded-full bg-emerald-400" /></div>
                  <div className="mt-2 flex justify-between text-xs text-slate-400"><span>Hoje</span><span>38% da rota</span></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold text-slate-500">Dívida eliminada</p><p className="mt-2 text-xl font-black text-emerald-600">R$ 3.420</p></div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold text-slate-500">Próxima vitória</p><p className="mt-2 text-xl font-black">12 dias</p></div>
                </div>
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-amber-800">Missão desta semana</p><p className="mt-1 font-bold text-slate-900">Revisar dois gastos que podem liberar R$ 180 por mês</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-white px-4 py-7">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
          <p className="max-w-xl text-lg font-bold">Não é mais uma planilha. É uma rota financeira feita para você continuar.</p>
          <div className="flex gap-8">
            <div><p className="text-2xl font-black text-emerald-600">R$ 8,08</p><p className="text-xs text-slate-500">por mês de acesso</p></div>
            <div><p className="text-2xl font-black">30</p><p className="text-xs text-slate-500">orientações IA/mês</p></div>
            <div><p className="text-2xl font-black">12 meses</p><p className="text-xs text-slate-500">sem mensalidade</p></div>
          </div>
        </div>
      </section>

      <section id="por-dentro" className="px-4 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl"><p className="eyebrow">Tudo no lugar certo</p><h2 className="section-title">Você não precisa entender de finanças para começar.</h2><p className="section-copy">O Sai do Vermelho transforma números espalhados em decisões pequenas, claras e possíveis.</p></div>
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map(([number, title, copy]) => <article key={number} className="premium-card group"><span className="text-sm font-black text-emerald-600">{number}</span><h3 className="mt-8 text-xl font-black">{title}</h3><p className="mt-3 leading-7 text-slate-600">{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-24 text-white md:py-32">
        <div className="mx-auto max-w-7xl"><div className="grid gap-14 lg:grid-cols-[.85fr_1.15fr]">
          <div><p className="eyebrow text-emerald-400">Da ansiedade para a ação</p><h2 className="section-title text-white">Uma jornada com começo, meio e conquista.</h2><p className="section-copy text-slate-400">Sem promessas milagrosas. Você recebe método, visão e consistência para melhorar uma decisão por vez.</p></div>
          <div className="space-y-3">{steps.map(([number, title, copy]) => <div key={number} className="flex gap-5 rounded-2xl border border-white/10 bg-white/[.04] p-6"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-400 font-black text-slate-950">{number}</div><div><h3 className="text-lg font-black">{title}</h3><p className="mt-2 leading-7 text-slate-400">{copy}</p></div></div>)}</div>
        </div></div>
      </section>

      <section id="pricing" className="px-4 py-24 md:py-32"><Pricing /></section>

      <section className="px-4 pb-24"><div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-emerald-500 px-6 py-14 text-center text-slate-950 md:px-16 md:py-20">
        <p className="text-sm font-black uppercase tracking-[.2em]">Sua virada pode começar hoje</p><h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">Dê ao seu dinheiro uma direção.</h2><p className="mx-auto mt-5 max-w-2xl text-lg text-emerald-950/80">Acesso completo por 12 meses, sem mensalidade e protegido pela garantia de 7 dias.</p>
        <Link href={CHECKOUT_URL} className="mt-8 inline-flex items-center gap-3 rounded-xl bg-slate-950 px-7 py-4 font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-900">Quero meu plano por R$ 97 <span>→</span></Link>
      </div></section>

      <footer className="border-t border-slate-200 bg-white px-4 py-9"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row"><p>© 2026 Sai do Vermelho · Um produto EJ Digital</p><div className="flex gap-5"><Link href="/termos" className="hover:text-slate-900">Termos</Link><Link href="/privacidade" className="hover:text-slate-900">Privacidade</Link><Link href="/auth/login" className="hover:text-slate-900">Área do cliente</Link></div></div></footer>
    </div>
  )
}
