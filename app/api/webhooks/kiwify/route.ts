import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Supabase com service key (server-side, ignora RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

/**
 * Webhook do Kiwify — ativa/desativa o plano do usuário automaticamente.
 *
 * Eventos tratados:
 *  - compra aprovada  -> plan = 'premium' (Basic) ou 'pro' (Pro)
 *  - assinatura cancelada / reembolso / chargeback -> plan = 'free'
 *
 * Configuração no Kiwify: Apps -> Webhooks -> URL:
 *   https://sai-do-vermelho-vercel.vercel.app/api/webhooks/kiwify
 * Se definir um token no Kiwify, adicionar KIWIFY_WEBHOOK_TOKEN na Vercel.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    // Validação de assinatura (se o token estiver configurado)
    const token = process.env.KIWIFY_WEBHOOK_TOKEN
    if (token) {
      const signature = request.nextUrl.searchParams.get('signature') || ''
      const expected = crypto
        .createHmac('sha1', token)
        .update(rawBody)
        .digest('hex')
      if (signature !== expected) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    let payload: any = {}
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Kiwify pode aninhar em "order"
    const order = payload.order || payload

    // E-mail do comprador (múltiplos formatos conhecidos)
    const email: string | undefined =
      order?.Customer?.email ||
      order?.customer?.email ||
      payload?.Customer?.email ||
      payload?.customer?.email ||
      payload?.email

    // Nome/ID do produto
    const productName: string =
      order?.Product?.product_name ||
      order?.product?.product_name ||
      payload?.Product?.product_name ||
      payload?.product_name ||
      ''

    // Status / tipo de evento
    const eventType: string = (
      payload?.webhook_event_type ||
      order?.webhook_event_type ||
      ''
    ).toLowerCase()
    const orderStatus: string = (
      order?.order_status ||
      payload?.order_status ||
      ''
    ).toLowerCase()

    if (!email) {
      return NextResponse.json({ error: 'No customer email in payload' }, { status: 400 })
    }

    const isApproved =
      eventType.includes('approved') ||
      eventType === 'compra_aprovada' ||
      orderStatus === 'paid' ||
      orderStatus === 'approved'

    const isCancellation =
      eventType.includes('cancel') ||
      eventType.includes('refund') ||
      eventType.includes('chargeback') ||
      orderStatus === 'refunded' ||
      orderStatus === 'chargedback'

    if (!isApproved && !isCancellation) {
      // Evento que não nos interessa (boleto gerado, pix gerado, etc.)
      return NextResponse.json({ received: true, ignored: eventType || orderStatus })
    }

    // Basic -> 'premium' | Pro -> 'pro'
    const isPro = /pro/i.test(productName)
    const newPlan = isCancellation ? 'free' : isPro ? 'pro' : 'premium'

    const normalizedEmail = String(email).trim().toLowerCase()

    const { data, error } = await supabase
      .from('users')
      .update({ plan: newPlan })
      .ilike('email', normalizedEmail)
      .select('id, email, plan')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      // Comprador ainda não criou conta no app — nada a atualizar ainda.
      // (Ele será orientado pelo e-mail de entrega a criar conta com o mesmo e-mail;
      //  se comprar antes de criar a conta, ative manualmente ou reenvie o webhook.)
      return NextResponse.json({
        received: true,
        warning: 'user_not_found',
        email: normalizedEmail,
        intended_plan: newPlan,
      })
    }

    return NextResponse.json({ received: true, updated: data })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal error' },
      { status: 500 }
    )
  }
}
