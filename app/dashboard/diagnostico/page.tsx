'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const KIWIFY_PRO = 'https://pay.kiwify.com.br/1XzR7vC'

const TIPOS_DIVIDA = [
  '💳 Cartão de crédito',
  '🏦 Cheque especial',
  '💰 Empréstimo',
  '🚗 Financiamento',
  '📄 Boleto atrasado',
  '📱 Outro',
]

type Divida = { tipo: string; valor: number; parcela: number }

export default function Diagnostico() {
  const [etapa, setEtapa] = useState(1)
  const [renda, setRenda] = useState('')
  const [dividas, setDividas] = useState<Divida[]>([])
  const [tipoAtual, setTipoAtual] = useState(TIPOS_DIVIDA[0])
  const [valorAtual, setValorAtual] = useState('')
  const [parcelaAtual, setParcelaAtual] = useState('')
  const [salvando, setSalvando] = useState(false)

  const rendaNum = parseFloat(renda.replace(',', '.')) || 0
  const totalDividas = dividas.reduce((s, d) => s + d.valor, 0)
  const totalParcelas = dividas.reduce((s, d) => s + d.parcela, 0)
  const comprometimento = rendaNum > 0 ? (totalParcelas / rendaNum) * 100 : 0
  const verba20 = rendaNum * 0.2
  const mesesQuitar = verba20 > 0 ? Math.ceil(totalDividas / verba20) : 0

  const nivel =
    comprometimento >= 30 || totalDividas > rendaNum * 6
      ? { cor: 'red', emoji: '🔴', titulo: 'VERMELHO CRÍTICO', frase: 'Suas dívidas estão consumindo sua renda. Agir agora faz toda a diferença.' }
      : comprometimento >= 15 || totalDividas > rendaNum * 2
      ? { cor: 'yellow', emoji: '🟡', titulo: 'SINAL DE ALERTA', frase: 'Ainda dá para virar o jogo rápido — com método, em poucos meses o cenário muda.' }
      : { cor: 'green', emoji: '🟢', titulo: 'SITUAÇÃO CONTROLÁVEL', frase: 'Com organização, você sai dessa mais rápido do que imagina.' }

  const ordemAtaque = [...dividas].sort((a, b) => a.valor - b.valor)

  const addDivida = () => {
    const v = parseFloat(valorAtual.replace(',', '.'))
    if (!v || v <= 0) return
    const p = parseFloat(parcelaAtual.replace(',', '.')) || 0
    setDividas([...dividas, { tipo: tipoAtual, valor: v, parcela: p }])
    setValorAtual('')
    setParcelaAtual('')
  }

  const gerarRelatorio = async () => {
    setEtapa(3)
    // Salva em segundo plano (não trava a experiência)
    setSalvando(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        for (const d of dividas) {
          await supabase.from('debts').insert({
            user_id: user.id,
            creditor: d.tipo.replace(/^[^ ]+ /, ''),
            total_amount: d.valor,
            monthly_payment: d.parcela || null,
            is_paid: false,
          })
        }
        const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7) + '-01'
        await supabase.from('monthly_budgets').upsert(
          { user_id: user.id, month: currentMonth, monthly_income: rendaNum },
          { onConflict: 'user_id,month' }
        )
      }
    } catch { /* silencioso */ } finally {
      setSalvando(false)
    }
  }

  const fmt = (n: number) =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-1">🩺 Diagnóstico Financeiro Grátis</h1>
      <p className="text-gray-600 mb-6 text-sm md:text-base">
        Responda em 1 minuto e receba seu raio-X das dívidas.
      </p>

      {/* Barra de progresso */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`h-2 flex-1 rounded-full ${etapa >= n ? 'bg-blue-600' : 'bg-gray-200'}`} />
        ))}
      </div>

      {/* ETAPA 1 — RENDA */}
      {etapa === 1 && (
        <div className="card space-y-4">
          <h2 className="text-lg font-bold">Qual é a sua renda mensal?</h2>
          <p className="text-sm text-gray-500">Pode ser aproximada. Ninguém além de você vê isso.</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-500">R$</span>
            <input
              type="number"
              inputMode="decimal"
              value={renda}
              onChange={(e) => setRenda(e.target.value)}
              className="input text-2xl font-bold flex-1"
              placeholder="3000"
              autoFocus
            />
          </div>
          <button
            onClick={() => rendaNum > 0 && setEtapa(2)}
            disabled={rendaNum <= 0}
            className="btn btn-primary w-full text-lg py-4 disabled:opacity-40"
          >
            Continuar →
          </button>
        </div>
      )}

      {/* ETAPA 2 — DÍVIDAS */}
      {etapa === 2 && (
        <div className="space-y-4">
          <div className="card space-y-4">
            <h2 className="text-lg font-bold">Agora lance suas dívidas</h2>
            <p className="text-sm text-gray-500">Uma por vez. Simples e rápido.</p>

            <div className="grid grid-cols-2 gap-2">
              {TIPOS_DIVIDA.map((t) => (
                <button
                  key={t}
                  onClick={() => setTipoAtual(t)}
                  className={`py-3 px-2 rounded-lg border text-sm font-medium transition ${
                    tipoAtual === t
                      ? 'border-blue-600 bg-blue-50 text-blue-800'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div>
              <label className="label">Quanto você deve no total?</label>
              <input
                type="number"
                inputMode="decimal"
                value={valorAtual}
                onChange={(e) => setValorAtual(e.target.value)}
                className="input text-xl"
                placeholder="Ex: 2500"
              />
            </div>
            <div>
              <label className="label">Parcela/pagamento mensal (opcional)</label>
              <input
                type="number"
                inputMode="decimal"
                value={parcelaAtual}
                onChange={(e) => setParcelaAtual(e.target.value)}
                className="input"
                placeholder="Ex: 300"
              />
            </div>
            <button onClick={addDivida} className="btn btn-secondary w-full py-3">
              + Adicionar esta dívida
            </button>
          </div>

          {dividas.length > 0 && (
            <div className="card">
              <h3 className="font-bold mb-2">Suas dívidas ({dividas.length})</h3>
              <ul className="space-y-2 mb-4">
                {dividas.map((d, i) => (
                  <li key={i} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                    <span>{d.tipo}</span>
                    <span className="font-bold">{fmt(d.valor)}</span>
                    <button
                      onClick={() => setDividas(dividas.filter((_, j) => j !== i))}
                      className="text-red-500 text-xs"
                    >
                      remover
                    </button>
                  </li>
                ))}
              </ul>
              <button onClick={gerarRelatorio} className="btn btn-primary w-full text-lg py-4">
                📊 Gerar meu Diagnóstico
              </button>
            </div>
          )}

          {dividas.length === 0 && (
            <button
              onClick={() => setEtapa(3)}
              className="w-full text-center text-sm text-gray-500 underline"
            >
              Não tenho dívidas — quero só organizar minha renda
            </button>
          )}
        </div>
      )}

      {/* ETAPA 3 — RELATÓRIO + CONVERSÃO */}
      {etapa === 3 && (
        <div className="space-y-4">
          <div className={`card border-2 ${
            nivel.cor === 'red' ? 'border-red-400 bg-red-50' :
            nivel.cor === 'yellow' ? 'border-yellow-400 bg-yellow-50' :
            'border-green-400 bg-green-50'
          }`}>
            <div className="text-center">
              <div className="text-5xl mb-2">{nivel.emoji}</div>
              <h2 className="text-xl font-extrabold mb-1">{nivel.titulo}</h2>
              <p className="text-sm text-gray-700">{nivel.frase}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="card text-center">
              <p className="text-xs text-gray-500 mb-1">Total de dívidas</p>
              <p className="text-xl font-extrabold text-red-600">{fmt(totalDividas)}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-gray-500 mb-1">Renda comprometida</p>
              <p className="text-xl font-extrabold">{comprometimento.toFixed(0)}%</p>
            </div>
          </div>

          {ordemAtaque.length > 0 && (
            <div className="card">
              <h3 className="font-bold mb-1">🎯 Sua ordem de ataque (bola de neve)</h3>
              <p className="text-xs text-gray-500 mb-3">Quite da menor para a maior — cada vitória libera fôlego para a próxima.</p>
              <ol className="space-y-2">
                {ordemAtaque.map((d, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    <span className="flex-1">{d.tipo}</span>
                    <span className="font-bold">{fmt(d.valor)}</span>
                  </li>
                ))}
              </ol>
              {mesesQuitar > 0 && (
                <p className="text-sm mt-4 bg-blue-50 rounded-lg p-3">
                  💡 Destinando <b>20% da sua renda</b> ({fmt(verba20)}/mês), você quita tudo em
                  aproximadamente <b>{mesesQuitar} {mesesQuitar === 1 ? 'mês' : 'meses'}</b>.
                </p>
              )}
            </div>
          )}

          {/* BLOCO DE CONVERSÃO */}
          <div className="card border-2 border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50">
            <h3 className="text-xl font-extrabold mb-2">Quer usar TODOS os nossos recursos agora mesmo? 🚀</h3>
            <p className="text-sm text-gray-700 mb-3">
              Esse diagnóstico é só o começo. No plano completo, você destrava:
            </p>
            <ul className="space-y-2 text-sm mb-4">
              <li className="flex gap-2"><span>🤖</span><span><b>Consultoria de IA ilimitada:</b> pergunte "como quito o cartão em 4 meses?" e receba um plano feito para os SEUS números — como um consultor de R$300/hora, por menos de R$1,60 por dia</span></li>
              <li className="flex gap-2"><span>📉</span><span><b>Plano de quitação acompanhado mês a mês</b> — o app recalcula sua bola de neve a cada pagamento</span></li>
              <li className="flex gap-2"><span>📊</span><span><b>Orçamento 50-30-20 automático</b> com alertas quando algo sai do trilho</span></li>
              <li className="flex gap-2"><span>🎯</span><span><b>Metas inteligentes</b> — a IA sugere quanto guardar e onde cortar</span></li>
            </ul>
            <p className="text-sm text-gray-700 mb-4 font-medium">
              Você acabou de ver o tamanho do problema. Agora imagine ter um especialista do seu lado
              todos os dias até a última dívida sumir.
            </p>
            <a
              href={KIWIFY_PRO}
              className="btn btn-primary w-full text-center text-lg py-4 mb-2 block"
            >
              ⭐ ASSINAR O PLANO COMPLETO — R$47/mês
            </a>
            <p className="text-xs text-gray-500 text-center mt-2">
              Garantia de 7 dias · Cancele quando quiser · Pagamento seguro
            </p>
          </div>

          <button
            onClick={() => { setEtapa(1); setDividas([]); setRenda('') }}
            className="w-full text-center text-xs text-gray-400 underline py-2"
          >
            refazer diagnóstico
          </button>
          {salvando && <p className="text-xs text-gray-400 text-center">salvando seus dados…</p>}
        </div>
      )}
    </div>
  )
}
