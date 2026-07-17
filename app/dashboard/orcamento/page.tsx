'use client'

import { useState } from 'react'

export default function OrcamentoPage() {
  const [income, setIncome] = useState(0)
  const essentials = Math.round(income * 0.5)
  const desires = Math.round(income * 0.3)
  const savings = Math.round(income * 0.2)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orçamento 50-30-20</h1>

      <div className="card max-w-md">
        <label className="label">Renda Mensal</label>
        <div className="flex gap-2">
          <span className="text-2xl">R$</span>
          <input
            type="number"
            className="input text-2xl"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card bg-blue-50 border-2 border-blue-300">
          <p className="text-gray-600 mb-2">Essenciais (50%)</p>
          <p className="text-3xl font-bold text-blue-600">R$ {essentials.toLocaleString('pt-BR')}</p>
          <div className="w-full bg-gray-300 rounded-full h-4 mt-4">
            <div className="bg-blue-600 h-4 rounded-full w-1/2"></div>
          </div>
        </div>

        <div className="card bg-green-50 border-2 border-green-300">
          <p className="text-gray-600 mb-2">Desejos (30%)</p>
          <p className="text-3xl font-bold text-green-600">R$ {desires.toLocaleString('pt-BR')}</p>
          <div className="w-full bg-gray-300 rounded-full h-4 mt-4">
            <div className="bg-green-600 h-4 rounded-full w-3/10"></div>
          </div>
        </div>

        <div className="card bg-purple-50 border-2 border-purple-300">
          <p className="text-gray-600 mb-2">Poupança (20%)</p>
          <p className="text-3xl font-bold text-purple-600">R$ {savings.toLocaleString('pt-BR')}</p>
          <div className="w-full bg-gray-300 rounded-full h-4 mt-4">
            <div className="bg-purple-600 h-4 rounded-full w-1/5"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
