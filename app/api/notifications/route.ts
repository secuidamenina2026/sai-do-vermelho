import { NextRequest, NextResponse } from 'next/server'
import { tipsSession, dbUnavailable } from '@/lib/tips-server'
import { defaultPreferences } from '@/lib/tips'
export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    const session = await tipsSession()
    if (session.response) return session.response
    const [notices, preferences, admin] = await Promise.all([
      session.db.from('notifications').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(100),
      session.db.from('notification_preferences').select('tips_enabled,offers_enabled').eq('user_id', session.user.id).maybeSingle(),
      session.db.from('tip_admins').select('user_id').eq('user_id', session.user.id).maybeSingle(),
    ])
    if (notices.error || preferences.error || admin.error) return dbUnavailable()
    return NextResponse.json({ notices: notices.data, preferences: preferences.data || defaultPreferences, admin: !!admin.data })
  } catch { return dbUnavailable() }
}
export async function PATCH(request: NextRequest) {
  try {
    const session = await tipsSession()
    if (session.response) return session.response
    const body = await request.json()
    if (body.action === 'preferences' && typeof body.tips_enabled === 'boolean' && typeof body.offers_enabled === 'boolean') {
      const { error } = await session.db.from('notification_preferences').upsert({ user_id: session.user.id, tips_enabled: body.tips_enabled, offers_enabled: body.offers_enabled })
      return error ? dbUnavailable() : NextResponse.json({ ok: true })
    }
    if (body.action === 'read' && typeof body.id === 'string') {
      const { data, error } = await session.db.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', body.id).eq('user_id', session.user.id).select('id').maybeSingle()
      if (error) return dbUnavailable()
      return NextResponse.json({ ok: !!data }, { status: data ? 200 : 404 })
    }
    return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 })
  } catch { return dbUnavailable() }
}
