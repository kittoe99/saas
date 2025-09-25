import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

// GET /api/auth-users?email=...
// Returns: { exists: boolean }
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email')?.toLowerCase();
  const user_id = searchParams.get('user_id') || undefined;
  if (!email && !user_id) {
    return NextResponse.json({ error: 'Missing email or user_id' }, { status: 400 });
  }
  const supabase = getSupabaseServer();
  // Query Supabase auth catalog directly (server-side service role client)
  const query = supabase.from('auth.users').select('id,email').limit(1);
  const { data, error } = user_id
    ? await query.eq('id', user_id)
    : await query.eq('email', email!);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // Normalize response shape to old contract
  const record = Array.isArray(data) && data.length > 0 ? { user_id: data[0].id, email: data[0].email } : null;
  return NextResponse.json({ exists: !!record, record });
}

// POST /api/auth-users
// Body: { email: string }
// Previously upserted into public.auth_users; now a no-op validator that checks existence in auth.users
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = (body?.email as string | undefined)?.toLowerCase();
    const user_id = body?.user_id as string | undefined;
    if (!email && !user_id) {
      return NextResponse.json({ error: 'Missing email or user_id' }, { status: 400 });
    }
    const supabase = getSupabaseServer();
    const q = supabase.from('auth.users').select('id').limit(1);
    const { data, error } = user_id ? await q.eq('id', user_id) : await q.eq('email', email!);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const exists = Array.isArray(data) && data.length > 0;
    return NextResponse.json({ ok: true, exists });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
