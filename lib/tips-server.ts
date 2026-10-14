import 'server-only'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function tipsSession(admin = false) {
  const db = createRouteHandlerClient({ cookies })
  const { data: { user }, error } = await db.auth.getUser()
  if (error || !user) return { response: NextResponse.json({ error: 'Entre novamente para continuar.' }, { status: 401 }) }
  if (admin) {
    const { data, error: roleError } = await db.from('tip_admins').select('user_id').eq('user_id', user.id).maybeSingle()
    if (roleError) return { response: NextResponse.json({ error: 'Painel indisponível. Verifique a configuração do banco.' }, { status: 503 }) }
    if (!data) return { response: NextResponse.json({ error: 'Acesso restrito à administração.' }, { status: 403 }) }
  }
  return { db, user }
}
export function dbUnavailable() {
  return NextResponse.json({ error: 'Não foi possível acessar o banco. Tente novamente em instantes.' }, { status: 503 })
}
