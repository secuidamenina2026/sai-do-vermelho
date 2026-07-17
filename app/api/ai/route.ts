import { NextRequest, NextResponse } from 'next/server'
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase'
import { generateFinancialAdvice } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { category, question } = await request.json()

    const { data: user } = await supabase
      .from('users')
      .select('monthly_income')
      .eq('id', session.user.id)
      .single()

    const advice = await generateFinancialAdvice(
      category,
      question,
      user?.monthly_income || 0,
      0
    )

    const supabaseAdmin = getSupabaseAdmin()
    await supabaseAdmin.from('ai_consultations').insert({
      user_id: session.user.id,
      category,
      question,
      ai_response: advice,
    })

    return NextResponse.json({ advice })
  } catch (error) {
    console.error('AI error:', error)
    return NextResponse.json({ error: 'Failed to generate advice' }, { status: 400 })
  }
}
