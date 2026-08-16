import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ active: false, code: 'UNAUTHORIZED' }, { status: 401 })

  const { data, error } = await supabase
    .from('access_entitlements')
    .select('status, starts_at, expires_at, source')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ active: false, code: 'ACCESS_CHECK_FAILED' }, { status: 503 })
  const active = data?.status === 'active' && new Date(data.expires_at).getTime() > Date.now()
  return NextResponse.json({ active, entitlement: data || null })
}
