import Anthropic from '@anthropic-ai/sdk'

const apiKey = process.env.ANTHROPIC_API_KEY || ''

export const anthropic = new Anthropic({ apiKey })

export async function generateFinancialAdvice(
  category: string,
  income: number,
  currentSpending: number,
  question: string
): Promise<string> {
  const prompt = `Você é um consultor financeiro experiente que ajuda brasileiros a organizar suas finanças.

Informações do cliente:
- Renda mensal: R$ ${income.toFixed(2)}
- Categoria: ${category}
- Gasto atual nesta categoria: R$ ${currentSpending.toFixed(2)}
- Pergunta: ${question}

Fornece um conselho prático, breve (máximo 3 parágrafos) e acionável para melhorar a situação financeira desta pessoa nesta categoria. Use a metodologia 50-30-20 (50% essenciais, 30% desejos, 20% poupança) como referência.`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const textContent = message.content.find((block) => block.type === 'text')
  return textContent && textContent.type === 'text' ? textContent.text : ''
}

export async function optimizeBudget(
  income: number,
  expenses: Record<string, number>
): Promise<string> {
  const expensesList = Object.entries(expenses)
    .map(([cat, amount]) => `${cat}: R$ ${amount.toFixed(2)}`)
    .join('\n')

  const prompt = `Você é um especialista em finanças pessoais. Analise este orçamento e recomende otimizações:

Renda: R$ ${income.toFixed(2)}
Despesas:
${expensesList}

Metodologia: 50% essenciais, 30% desejos, 20% poupança

Forneça 3-4 recomendações práticas (máximo 150 palavras) para melhorar o orçamento.`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 400,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const textContent = message.content.find((block) => block.type === 'text')
  return textContent && textContent.type === 'text' ? textContent.text : ''
}
