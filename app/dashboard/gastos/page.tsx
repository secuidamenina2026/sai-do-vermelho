'use client'

import { useState } from 'react'

export default function GastosPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')

  const handleAdd = () => {
    if (category && amount) {
      setExpenses([...expenses, { id: Date.now(), category, amount: Number(amount), date: new Date().toLocaleDateString('pt-BR') }])
      setCategory('')
      setAmount('')
    }
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Registrar Gastos</h1>

      <div className="card max-w-md">
        <h2 className="text-lg font-bold mb-4">Novo Gasto</h2>
        <div className="space-y-3">
          <div>
            <label className="label">Categoria</label>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Selecione...</option>
              <option value="Alimentação">Alimentação</option>
              <option value="Transporte">Transporte</option>
              <option value="Moradia">Moradia</option>
              <option value="Saúde">Saúde</option>
              <option value="Lazer">Lazer</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div>
            <label className="label">Valor</label>
            <input
              type="number"
              className="input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <button onClick={handleAdd} className="btn btn-primary w-full">Adicionar Gasto</button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-4">Gastos Registrados</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Data</th>
                <th className="text-left py-2">Categoria</th>
                <th className="text-right py-2">Valor</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id} className="border-b">
                  <td className="py-2">{e.date}</td>
                  <td className="py-2">{e.category}</td>
                  <td className="text-right py-2">R$ {e.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right font-bold text-lg">
          Total: R$ {total.toFixed(2)}
        </div>
      </div>
    </div>
  )
}
