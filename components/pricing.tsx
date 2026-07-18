'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function Pricing() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
  }, [])

  const plans = [
    {
      name: 'Free',
      price: 'R$ 0',
      period: '/mês',
      description: 'Perfeito para começar',
      features: [
        'Teste de Orçamento (3 perguntas)',
        'Cálculo 50-30-20 personalizado',
        '1 sugestão IA por categoria',
        'Exportar PDF simples',
      ],
      cta: 'Comece Grátis',
      ctaHref: '/auth/register',
      highlighted: false,
    },
    {
      name: 'Premium',
      price: 'R$ 19',
      period: '/mês',
      description: 'Para quem quer mais controle',
      features: [
        'Tudo do Free +',
        'Orçamento completo',
        'Rastreio de gastos por categoria',
        'IA consultoria 24/7 por chat',
        'Exportar relatório completo',
        'Histórico de 12 meses',
        'Alertas automáticos',
        'Calculadora de dívidas (bola de neve)',
      ],
      cta: 'Upgrade para Premium',
      ctaHref: user ? '/dashboard?plan=premium' : '/auth/register',
      highlighted: true,
    },
    {
      name: 'Pro',
      price: 'R$ 49',
      period: '/mês',
      description: 'Acesso completo + comunidade',
      features: [
        'Tudo do Premium +',
        'Acesso à comunidade SAI DO VERMELHO',
        'Análise avançada (gráficos, trends)',
        'Consultoria IA priorizada (< 5 min)',
        'Metas inteligentes (IA sugere)',
        'Integração com banco (simulado)',
        'Relatórios mensais personalizados',
      ],
      cta: 'Upgrade para Pro',
      ctaHref: user ? '/dashboard?plan=pro' : '/auth/register',
      highlighted: false,
    },
  ]

  return (
    <div className="container max-w-5xl">
      <h2 className="text-3xl font-bold text-center mb-4">Preços Simples e Transparentes</h2>
      <p className="text-center text-gray-600 mb-12">
        Sem taxas ocultas. Cancele quando quiser. Garantia 30 dias.
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`card relative ${plan.highlighted ? 'ring-2 ring-blue-600 md:scale-105' : ''}`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Mais Popular
              </div>
            )}

            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <p className="text-gray-600 mb-4">{plan.description}</p>

            <div className="mb-6">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-gray-600">{plan.period}</span>
            </div>

            <Link
              href={plan.ctaHref}
              className={`block w-full text-center btn mb-6 ${
                plan.highlighted ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {plan.cta}
            </Link>

            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600">
          💬 Dúvidas? Fale com nosso time pelo chat no app ou mande email
        </p>
      </div>
    </div>
  )
}
