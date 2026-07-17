'use client'

import Link from 'next/link'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-600 text-sm">Renda Mensal</p>
          <p className="text-3xl font-bold text-blue-600">R$ 0</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Gastos Mês</p>
          <p className="text-3xl font-bold text-red-600">R$ 0</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Economizado</p>
          <p className="text-3xl font-bold text-green-600">R$ 0</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Dívidas</p>
          <p className="text-3xl font-bold text-orange-600">R$ 0</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Começar</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/dashboard/orcamento" className="btn btn-primary">
            💰 Definir Orçamento
          </Link>
          <Link href="/dashboard/gastos" className="btn btn-secondary">
            📊 Registrar Gastos
          </Link>
          <Link href="/dashboard/metas" className="btn btn-primary">
            🎯 Definir Metas
          </Link>
        </div>
      </div>
    </div>
  )
}
