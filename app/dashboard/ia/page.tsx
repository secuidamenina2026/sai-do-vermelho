'use client'

import { useState } from 'react'

const CATEGORIES = [
  { value: 'geral', label: 'Visão geral' }, { value: 'essenciais', label: 'Contas essenciais' },
  { value: 'desejos', label: 'Gastos com desejos' }, { value: 'dividas', label: 'Dívidas' },
  { value: 'poupanca', label: 'Reserva e metas' },
]

const SUGGESTIONS = [
  'Qual é o próximo passo mais importante para mim?',
  'Onde consigo economizar sem piorar minha qualidade de vida?',
  'Como posso acelerar a quitação das minhas dívidas?',
]

export default function OrientacaoIA() {
  const [category, setCategory] = useState('geral')
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [usage, setUsage] = useState<{ used: number; limit: number; remaining: number } | null>(null)

  const handleAsk = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!question.trim()) return
    setLoading(true); setError(''); setResponse('')
    try {
      const result = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category, question }) })
      const data = await result.json()
      if (!result.ok) setError(data.error || 'Não foi possível analisar agora. Tente novamente.')
      else { setResponse(data.response); setUsage(data.usage) }
    } catch { setError('Erro de conexão. Tente novamente.') }
    finally { setLoading(false) }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl md:p-9">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative max-w-3xl"><p className="text-sm font-black uppercase tracking-[.18em] text-violet-300">Orientação inteligente</p><h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Seus números. Uma resposta clara.</h1><p className="mt-4 max-w-2xl leading-7 text-slate-300">Pergunte sobre sua realidade financeira. A orientação considera os dados registrados no sistema e indica caminhos possíveis, sem julgamentos.</p></div>
        <div className="relative mt-7 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm"><span>Limite de uso responsável</span><b className="text-violet-300">{usage ? `${usage.remaining} de ${usage.limit} restantes` : '30 orientações por mês'}</b></div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Você pode perguntar</p><div className="mt-4 space-y-2">{SUGGESTIONS.map(suggestion => <button key={suggestion} onClick={() => setQuestion(suggestion)} className="w-full rounded-2xl bg-slate-50 p-4 text-left text-sm font-bold leading-6 text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800">{suggestion} <span>→</span></button>)}</div><p className="mt-5 text-xs leading-5 text-slate-400">As respostas são educativas e não substituem aconselhamento financeiro profissional.</p></aside>

        <form onSubmit={handleAsk} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <label className="label">Assunto principal</label><select value={category} onChange={(event) => setCategory(event.target.value)} className="input">{CATEGORIES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
          <label className="label mt-5">O que você quer decidir?</label><textarea value={question} onChange={(event) => setQuestion(event.target.value)} className="input min-h-[160px] resize-none text-base leading-7" placeholder="Ex.: Com a minha renda atual, qual dívida devo priorizar primeiro?" required minLength={5} maxLength={600} />
          <div className="mt-2 text-right text-xs text-slate-400">{question.length}/600</div>
          <button disabled={loading} className="mt-4 w-full rounded-xl bg-slate-950 px-5 py-3.5 font-black text-white transition hover:bg-slate-800 disabled:opacity-50">{loading ? 'Analisando seus números…' : 'Receber minha orientação →'}</button>
        </form>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700" role="alert">{error}</div>}
      {response && <section className="rounded-3xl border border-violet-200 bg-gradient-to-br from-white to-violet-50 p-6 shadow-sm md:p-8"><p className="text-xs font-black uppercase tracking-[.16em] text-violet-700">Sua orientação personalizada</p><div className="mt-5 whitespace-pre-wrap leading-8 text-slate-700">{response}</div></section>}
    </div>
  )
}
