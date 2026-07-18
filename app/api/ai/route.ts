import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { generateFinancialAdvice } from '@/lib/anthropic'

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

    // Check user's plan - AI consultoria only for Basic+ users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Plan enforcement: Only 'basic' and 'pro' can use AI
    if (userData.plan === 'free') {
      return NextResponse.json(
        {
          error: 'AI consultoria é disponível apenas para planos Basic e Pro',
          code: 'PLAN_UPGRADE_REQUIRED'
        },
        { status: 403 }
      )
    }

    const { category, question } = await request.json()

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
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
