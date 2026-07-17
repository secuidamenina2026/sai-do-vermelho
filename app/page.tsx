'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Organize sua vida financeira em 5 minutos
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Use grátis, escale com IA. Descubra quanto você pode poupar com nosso sistema 50-30-20.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register" className="btn btn-primary text-lg px-8 py-3">
              Comece Grátis
            </Link>
            <Link href="#pricing" className="btn btn-secondary text-lg px-8 py-3">
              Ver Preços
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Orçamento Inteligente</h3>
              <p className="text-gray-600">Método 50-30-20: 50% essenciais, 30% desejos, 20% poupança.</p>
            </div>
            <div className="card">
              <div className="text-4xl mb-4">💹</div>
              <h3 className="text-xl font-bold mb-2">Rastreio de Gastos</h3>
              <p className="text-gray-600">Registre todos os gastos por categoria e veja o que realmente gasta.</p>
            </div>
            <div className="card">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">Consultoria IA 24/7</h3>
              <p className="text-gray-600">Pergunte para nossa IA sobre qualquer categoria e receba recomendações.</p>
            </div>
            <div className="card">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Metas Financeiras</h3>
              <p className="text-gray-600">Defina metas e acompanhe seu progresso em tempo real.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Planos</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card">
              <h3 className="text-2xl font-bold mb-4">Grátis</h3>
              <p className="text-gray-600 mb-6">R$ 0/mês</p>
              <Link href="/auth/register" className="btn btn-secondary w-full mb-6">Começar</Link>
              <ul className="text-sm space-y-2">
                <li>✅ Orçamento 50-30-20</li>
                <li>✅ Rastreio de gastos</li>
                <li>❌ Consultoria IA</li>
              </ul>
            </div>
            <div className="card border-2 border-blue-600">
              <div className="bg-blue-600 text-white px-3 py-1 inline-block text-sm font-bold mb-4">Popular</div>
              <h3 className="text-2xl font-bold mb-4">Premium</h3>
              <p className="text-gray-600 mb-6">R$ 19/mês</p>
              <button className="btn btn-primary w-full mb-6">Upgrade</button>
              <ul className="text-sm space-y-2">
                <li>✅ Tudo do Grátis</li>
                <li>✅ Consultoria IA ilimitada</li>
                <li>✅ Análise de gastos</li>
              </ul>
            </div>
            <div className="card">
              <h3 className="text-2xl font-bold mb-4">Pro</h3>
              <p className="text-gray-600 mb-6">R$ 49/mês</p>
              <button className="btn btn-primary w-full mb-6">Upgrade</button>
              <ul className="text-sm space-y-2">
                <li>✅ Tudo do Premium</li>
                <li>✅ Comunidade privada</li>
                <li>✅ Relatórios avançados</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
