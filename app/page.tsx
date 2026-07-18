'use client'

import Link from 'next/link'
import { Pricing } from '@/components/pricing'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
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

      {/* Features Section */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Orçamento Inteligente</h3>
              <p className="text-gray-600">
                Método 50-30-20: 50% essenciais, 30% desejos, 20% poupança. Totalmente personalizado para sua renda.
              </p>
            </div>

            <div className="card">
              <div className="text-4xl mb-4">💹</div>
              <h3 className="text-xl font-bold mb-2">Rastreio de Gastos</h3>
              <p className="text-gray-600">
                Registre todos os gastos por categoria e veja quanto você realmente gasta em cada área.
              </p>
            </div>

            <div className="card">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">Consultoria IA 24/7</h3>
              <p className="text-gray-600">
                Pergunte para nossa IA sobre qualquer categoria de gasto e receba recomendações personalizadas.
              </p>
            </div>

            <div className="card">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Metas Financeiras</h3>
              <p className="text-gray-600">
                Defina metas (carro, férias, emergência) e acompanhe seu progresso em tempo real.
              </p>
            </div>

            <div className="card">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-bold mb-2">Gestor de Dívidas</h3>
              <p className="text-gray-600">
                Gerencie dívidas com sistema de "bola de neve" para sair do vermelho mais rápido.
              </p>
            </div>

            <div className="card">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold mb-2">Relatórios Detalhados</h3>
              <p className="text-gray-600">
                Exporte PDF e analise tendências. Veja seu progresso mês a mês com gráficos inteligentes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Proof Section */}
      <section className="py-20 bg-gray-50">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-12">O Que Conseguem Nossos Usuários</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-green-600">R$ 5k</div>
              <p className="text-gray-600 mt-2">poupados por ano em média</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">45%</div>
              <p className="text-gray-600 mt-2">redução em gastos supérfluos</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">3 meses</div>
              <p className="text-gray-600 mt-2">para sair do vermelho</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <Pricing />
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container max-w-2xl text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Pronto para Transformar suas Finanças?</h2>
          <p className="text-xl mb-8 opacity-90">
            Garantia 30 dias. Se não gostar, devolvemos seu dinheiro.
          </p>
          <Link href="/auth/register" className="btn bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
            Comece Agora → Grátis
          </Link>
        </div>
      </section>
    </div>
  )
}
