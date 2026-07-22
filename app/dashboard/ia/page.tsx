'use client'

import { useState } from 'react'

const KIWIFY_PRO = 'https://pay.kiwify.com.br/1XzR7vC'

const CATEGORIAS = [
  { value: 'geral', label: '💬 Pergunta geral' },
  { value: 'essenciais', label: '🏠 Contas essenciais' },
  { value: 'desejos', label: '🛍️ Gastos com desejos' },
  { value: 'dividas', label: '📉 Dívidas' },
  { value: 'poupanca', label: '🐷 Poupança e metas' },
]

export default function ConsultoriaIA() {
  const [category, setCategory] = useState('geral')
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needUpgrade, setNeedUpgrade] = useState(false)

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    setError('')
    setResponse('')
    setNeedUpgrade(false)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, question }),
      })
      const data = await res.json()

      if (res.status === 403 && data.code === 'PLAN_UPGRADE_REQUIRED') {
        setNeedUpgrade(true)
      } else if (!res.ok) {
        setError(data.error || 'Erro ao consultar a IA. Tente novamente.')
      } else {
        setResponse(data.response)
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">🤖 Consultoria IA</h1>
      <p className="text-gray-600 mb-8">
        Pergunte qualquer coisa sobre suas finanças. A IA responde com base nos SEUS números.
      </p>

      <form onSubmit={handleAsk} className="card mb-6 space-y-4">
        <div>
          <label className="label">Sobre o que é sua dúvida?</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
          >
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Sua pergunta</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="input min-h-[120px]"
            placeholder="Ex: Como faço para quitar minha dívida do cartão em 6 meses com a minha renda atual?"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? 'Analisando suas finanças...' : 'Perguntar à IA 🚀'}
        </button>
      </form>

      {needUpgrade && (
        <div className="card border-2 border-blue-600 bg-blue-50">
          <h3 className="text-xl font-bold mb-2">🔒 A Consultoria IA é exclusiva dos planos pagos</h3>
          <p className="text-gray-700 mb-4">
            Desbloqueie um consultor financeiro pessoal 24h por dia, que conhece seus números
            e te diz exatamente o que fazer — por menos de R$1,60 por dia.
          </p>
          <a href={KIWIFY_PRO} className="btn btn-primary text-center block w-full text-lg py-4">
            ⭐ Assinar o Plano Completo — R$47/mês
          </a>
          <p className="text-sm text-gray-500 mt-3 text-center">
            Garantia de 7 dias. Cancele quando quiser.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {response && (
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🤖</span>
            <h3 className="font-bold">Sua consultoria personalizada</h3>
          </div>
          <div className="whitespace-pre-wrap text-gray-800">{response}</div>
        </div>
      )}
    </div>
  )
}
