import { NextRequest, NextResponse } from 'next/server'
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, fullName } = await request.json()
    const supabase = getSupabase()
    const supabaseAdmin = getSupabaseAdmin()

    if (action === 'signup') {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (authData.user) {
        const { error: userError } = await supabaseAdmin
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            full_name: fullName,
            plan: 'free',
          })

        if (userError) throw userError
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return NextResponse.json({ success: true, user: data.user })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Auth failed' }, { status: 400 })
  }
}
