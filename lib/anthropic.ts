import Anthropic from '@anthropic-ai/sdk'

const apiKey = process.env.ANTHROPIC_API_KEY || ''

export const anthropic = new Anthropic({ apiKey })

export async function generateFinancialAdvice(
    category: string,
    income: number,
    currentSpending: number,
    question: string
  ): Promise<string> {
    const prompt = `Voce e um consultor financeiro experiente que ajuda brasileiros a organizar suas financas.

    Informacoes do cliente:
    - Renda mensal: R$ ${income.toFixed(2)}
    - Categoria: ${category}
    - Gasto atual nesta categoria: R$ ${currentSpending.toFixed(2)}
    - Pergunta: ${question}

    Fornece um conselho pratico, breve (maximo 3 paragrafos) e acionavel para melhorar a situacao financeira desta pessoa nesta categoria. Use a metodologia 50-30-20 (50% essenciais, 30% desejos, 20% poupanca) como referencia.`

  const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
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

  const prompt = `Voce e um especialista em financas pessoais. Analise este orcamento e recomende otimizacoes:

  Renda: R$ ${income.toFixed(2)}
  Despesas:
  ${expensesList}

  Metodologia: 50% essenciais, 30% desejos, 20% poupanca

  Forneca 3-4 recomendacoes praticas (maximo 150 palavras) para melhorar o orcamento.`

  const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
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
