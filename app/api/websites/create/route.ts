import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

// POST /api/websites/create
// Creates a new draft website for the authenticated user and returns its id
export async function POST() {
  try {
    const supabase = getSupabaseServer()
    const { data: auth } = await supabase.auth.getUser()
    const user = auth?.user
    if (!user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('websites')
      .insert({ user_id: user.id, status: 'draft' })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, website_id: data?.id }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}
