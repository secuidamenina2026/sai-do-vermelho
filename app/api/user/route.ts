import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (userError) throw userError

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { data: user, error: userError } = await supabase
      .from('users')
      .update(body)
      .eq('id', session.user.id)
      .select()
      .single()

    if (userError) throw userError

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 400 })
  }
}
