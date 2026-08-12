import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * Acesso demo sem login/senha.
 *
 * GET /api/demo-login?t=<token>
 *
 * O token e a senha da conta demo são derivados da SUPABASE_SERVICE_KEY,
 * então nada novo precisa ser configurado no Vercel. Quem tiver o link
 * entra direto no dashboard com uma conta de teste (plano Pro), sem
 * acesso a dados de outros usuários.
 */

const DEMO_EMAIL = 'teste@saidovermelho.app'
const DEMO_NAME = 'Conta de Teste'

const derive = (salt: string) =>
  createHash('sha256')
    .update(`${process.env.SUPABASE_SERVICE_KEY || ''}:${salt}`)
    .digest('hex')

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('t') || ''
  if (!process.env.SUPABASE_SERVICE_KEY || token !== derive('demo-access').slice(0, 24)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const password = derive('demo-password').slice(0, 32)

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password,
    email_confirm: true,
    user_metadata: { full_name: DEMO_NAME },
  })

  let userId = created?.user?.id
  if (createError) {
    // Conta já existe: recupera o id e garante a senha derivada
    const { data: link, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: DEMO_EMAIL,
    })
    if (linkError || !link?.user?.id) {
      return NextResponse.json({ error: 'Falha ao localizar a conta demo' }, { status: 500 })
    }
    userId = link.user.id
    await admin.auth.admin.updateUserById(userId, { password, email_confirm: true })
  }

  await admin.from('users').upsert({
    id: userId,
    email: DEMO_EMAIL,
    full_name: DEMO_NAME,
    plan: 'pro',
  })

  const supabase = createRouteHandlerClient({ cookies })
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password,
  })
  if (signInError) {
    return NextResponse.json({ error: signInError.message }, { status: 500 })
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
