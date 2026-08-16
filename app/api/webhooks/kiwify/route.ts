import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { annualExpiration } from '@/lib/access-server'

export const dynamic = 'force-dynamic'

// Inicializado somente quando o webhook é chamado. Assim o build não depende
// de segredos que existem apenas no ambiente da Vercel.
const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase não configurado para o webhook')
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

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
    const supabase = getSupabaseAdmin()
    const rawBody = await request.text()

    // A Kiwify permite cadastrar a URL completa. O segredo deve ser incluído
    // como ?token=... e é obrigatório para evitar ativações fraudulentas.
    const token = process.env.KIWIFY_WEBHOOK_TOKEN
    const receivedToken = request.nextUrl.searchParams.get('token') || ''
    if (!token) return NextResponse.json({ error: 'Webhook token not configured' }, { status: 503 })
    const tokenIsValid = token.length === receivedToken.length && crypto.timingSafeEqual(Buffer.from(token), Buffer.from(receivedToken))
    if (!tokenIsValid) return NextResponse.json({ error: 'Invalid webhook token' }, { status: 401 })

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

    const normalizedEmail = String(email).trim().toLowerCase()
    const purchaseId = String(order?.order_id || order?.id || payload?.order_id || payload?.transaction_id || crypto.createHash('sha256').update(rawBody).digest('hex'))

    if (isCancellation) {
      await supabase.from('pending_entitlements').update({ status: 'refunded', updated_at: new Date().toISOString() }).eq('purchase_id', purchaseId)
      await supabase.from('access_entitlements').update({ status: 'refunded', updated_at: new Date().toISOString() }).eq('purchase_id', purchaseId)
      await supabase.from('users').update({ plan: 'free' }).ilike('email', normalizedEmail)
      return NextResponse.json({ received: true, access: 'revoked' })
    }

    const startsAt = new Date().toISOString()
    const expiresAt = annualExpiration()
    const { error: pendingError } = await supabase.from('pending_entitlements').upsert({
      email: normalizedEmail,
      status: 'active',
      source: 'kiwify',
      purchase_id: purchaseId,
      starts_at: startsAt,
      expires_at: expiresAt,
      updated_at: startsAt,
    }, { onConflict: 'email' })
    if (pendingError) return NextResponse.json({ error: pendingError.message }, { status: 500 })

    const isPro = /pro/i.test(productName)
    const newPlan = isPro ? 'pro' : 'premium'

    const { data, error } = await supabase
      .from('users')
      .update({ plan: newPlan })
      .ilike('email', normalizedEmail)
      .select('id, email, plan')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        received: true,
        access: 'pending_account_creation',
        email: normalizedEmail,
        expires_at: expiresAt,
      })
    }

    const { error: entitlementError } = await supabase.from('access_entitlements').upsert({
      user_id: data[0].id,
      email: normalizedEmail,
      status: 'active',
      source: 'kiwify',
      purchase_id: purchaseId,
      starts_at: startsAt,
      expires_at: expiresAt,
      updated_at: startsAt,
    })
    if (entitlementError) return NextResponse.json({ error: entitlementError.message }, { status: 500 })

    return NextResponse.json({ received: true, access: 'activated', expires_at: expiresAt })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal error' },
      { status: 500 }
    )
  }
}
