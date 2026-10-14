import { timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/access-server'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = request.headers.get('authorization') || ''
  const expected = `Bearer ${secret}`
  if (!secret || Buffer.byteLength(auth) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(auth), Buffer.from(expected))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Fail closed until the reviewed migration and production activation are complete.
  if (process.env.TIP_DELIVERY_ENABLED !== 'true' || process.env.VERCEL_ENV !== 'production') {
    return NextResponse.json({ enabled: false, delivered: 0 })
  }
  try {
    const { data, error } = await getAdminClient().rpc('deliver_due_tips')
    if (error) throw error
    return NextResponse.json({ enabled: true, delivered: data })
  } catch { return NextResponse.json({ error: 'Delivery failed; retry safely.' }, { status: 503 }) }
}
