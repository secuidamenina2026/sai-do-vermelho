import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { generateFinancialAdvice } from '@/lib/anthropic'
import { AI_GLOBAL_MONTHLY_LIMIT, AI_USER_MONTHLY_LIMIT, getAdminClient } from '@/lib/access-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { category, question } = await request.json()
    if (typeof question !== 'string' || question.trim().length < 5 || question.length > 600) {
      return NextResponse.json({ error: 'Escreva uma pergunta entre 5 e 600 caracteres.' }, { status: 400 })
    }

    const admin = getAdminClient()
    const { data: quota, error: quotaError } = await admin.rpc('consume_ai_quota', {
      p_user_id: user.id,
      p_user_limit: AI_USER_MONTHLY_LIMIT,
      p_global_limit: AI_GLOBAL_MONTHLY_LIMIT,
    })
    if (quotaError) return NextResponse.json({ error: 'Não foi possível validar o limite de uso.' }, { status: 503 })
    if (!quota?.allowed) {
      const messages: Record<string, string> = {
        ACCESS_REQUIRED: 'Seu acesso precisa estar ativo para usar a orientação por IA.',
        USER_LIMIT_REACHED: 'Você utilizou as 30 orientações deste mês. O limite será renovado no próximo mês.',
        GLOBAL_LIMIT_REACHED: 'A orientação por IA atingiu o limite de segurança temporário. Nosso suporte já foi avisado.',
        RATE_LIMITED: 'Aguarde alguns segundos antes de enviar outra pergunta.',
      }
      return NextResponse.json({ error: messages[quota.code] || 'Limite de uso atingido.', code: quota.code }, { status: 429 })
    }

    // Get user's budget and spending data
    const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7) + '-01'
    const { data: budgetData } = await supabase
      .from('monthly_budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .single()

    const { data: expensesData } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', category)
      .gte('month', currentMonth)

    const income = budgetData?.monthly_income || 0
    const categorySpending = expensesData?.reduce((sum, e) => sum + (e.actual_amount || 0), 0) || 0

    // Generate AI advice
    const aiResponse = await generateFinancialAdvice(
      category,
      income,
      categorySpending,
      question
    )

    // Save consultation to database
    const { data, error } = await supabase
      .from('ai_consultations')
      .insert({
        user_id: user.id,
        category,
        question,
        ai_response: aiResponse,
        tokens_used: Math.ceil(aiResponse.length / 4), // Rough estimate
      })
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      response: aiResponse,
      consultation: data?.[0],
      usage: { used: quota.used, limit: quota.limit, remaining: quota.remaining },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
