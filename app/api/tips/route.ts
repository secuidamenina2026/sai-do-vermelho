import { NextRequest, NextResponse } from 'next/server'
import { tipsSession, dbUnavailable } from '@/lib/tips-server'
import { validateCampaign } from '@/lib/tips'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await tipsSession(true)
    if (session.response) return session.response
    const { data, error } = await session.db.from('tip_campaigns').select('*').order('created_at', { ascending: false }).limit(100)
    return error ? dbUnavailable() : NextResponse.json({ campaigns: data })
  } catch { return dbUnavailable() }
}
export async function POST(request: NextRequest) {
  try {
    const session = await tipsSession(true)
    if (session.response) return session.response
    let payload
    try { payload = validateCampaign(await request.json()) }
    catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Dados inválidos.' }, { status: 400 }) }
    const { data, error } = await session.db.from('tip_campaigns').insert({ ...payload, created_by: session.user.id }).select().single()
    return error ? dbUnavailable() : NextResponse.json({ campaign: data }, { status: 201 })
  } catch { return dbUnavailable() }
}
export async function PATCH(request: NextRequest) {
  try {
    const session = await tipsSession(true)
    if (session.response) return session.response
    const { id } = await request.json()
    if (typeof id !== 'string') return NextResponse.json({ error: 'Identificador inválido.' }, { status: 400 })
    const { data, error } = await session.db.from('tip_campaigns').update({ status: 'canceled' }).eq('id', id).in('status', ['draft', 'scheduled']).select().maybeSingle()
    if (error) return dbUnavailable()
    return data ? NextResponse.json({ campaign: data }) : NextResponse.json({ error: 'O envio já foi processado ou cancelado.' }, { status: 409 })
  } catch { return dbUnavailable() }
}
