import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/access-server'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email?.trim().toLowerCase()
  if (!user || !email) return NextResponse.json({ claimed: false }, { status: 401 })

  const admin = getAdminClient()
  const { data: pending } = await admin
    .from('pending_entitlements')
    .select('*')
    .eq('email', email)
    .eq('status', 'active')
    .maybeSingle()

  if (!pending) return NextResponse.json({ claimed: false, code: 'PURCHASE_NOT_FOUND' }, { status: 404 })

  const { error } = await admin.from('access_entitlements').upsert({
    user_id: user.id,
    email,
    status: 'active',
    source: pending.source,
    purchase_id: pending.purchase_id,
    starts_at: pending.starts_at,
    expires_at: pending.expires_at,
    updated_at: new Date().toISOString(),
  })
  if (error) return NextResponse.json({ claimed: false, code: 'CLAIM_FAILED' }, { status: 500 })
  return NextResponse.json({ claimed: true, expires_at: pending.expires_at })
}
