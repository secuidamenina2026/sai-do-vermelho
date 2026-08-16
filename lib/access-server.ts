import 'server-only'

import { createClient } from '@supabase/supabase-js'

export const ACCESS_MONTHS = 12
export const AI_USER_MONTHLY_LIMIT = 30
export const AI_GLOBAL_MONTHLY_LIMIT = 3000

export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY
  if (!url || !serviceKey) throw new Error('Supabase administrativo não configurado')
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function annualExpiration(from = new Date()) {
  const expiration = new Date(from)
  expiration.setUTCMonth(expiration.getUTCMonth() + ACCESS_MONTHS)
  return expiration.toISOString()
}
