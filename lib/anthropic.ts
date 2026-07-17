import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateFinancialAdvice(
  category: string,
  question: string,
  monthlyIncome: number,
  monthlySpending: number
) {
  const prompt = `Você é um consultor financeiro especializado. O usuário ganha R$ ${monthlyIncome}/mês e gasta R$ ${monthlySpending}/mês.

Pergunta sobre ${category}: ${question}

Responda em português, de forma prática e acionável. Máximo 3 parágrafos.`

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}

export async function optimizeBudget(income: number, expenses: Record<string, number>) {
  const prompt = `Você é um especialista em finanças pessoais. Analize este orçamento:

Renda: R$ ${income}
Despesas atuais: ${Object.entries(expenses)
    .map(([cat, val]) => `${cat}: R$ ${val}`)
    .join(', ')}

Use o método 50-30-20 (50% essenciais, 30% desejos, 20% poupança) e sugira otimizações.
Responda em português, máximo 4 parágrafos.`

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}
