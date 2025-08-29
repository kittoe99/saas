import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// GET /api/auth-users?email=...
// Returns: { exists: boolean }
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email')?.toLowerCase();
  const user_id = searchParams.get('user_id') || undefined;
  if (!email && !user_id) {
    return NextResponse.json({ error: 'Missing email or user_id' }, { status: 400 });
  }
  const query = supabaseServer.from('auth_users').select('user_id,email').limit(1);
  const { data, error } = user_id
    ? await query.eq('user_id', user_id)
    : await query.eq('email', email!);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ exists: Array.isArray(data) && data.length > 0, record: data?.[0] ?? null });
}

// POST /api/auth-users
// Body: { email: string }
// Upserts the email into auth_users
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = (body?.email as string | undefined)?.toLowerCase();
    const user_id = body?.user_id as string | undefined;
    if (!email && !user_id) {
      return NextResponse.json({ error: 'Missing email or user_id' }, { status: 400 });
    }
    const payload: { email?: string; user_id?: string } = {};
    if (email) payload.email = email;
    if (user_id) payload.user_id = user_id;
    const { error } = await supabaseServer
      .from('auth_users')
      .upsert(payload, { onConflict: user_id ? 'user_id' : 'email' })
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
