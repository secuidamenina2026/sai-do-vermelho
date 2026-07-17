import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICE_IDS } from '@/lib/stripe'
import { getSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await request.json()
    const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS]

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: 'https://sai-do-vermelho.vercel.app/dashboard?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://sai-do-vermelho.vercel.app/',
    })

    return NextResponse.json({ sessionId: checkoutSession.id })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 400 })
  }
}
