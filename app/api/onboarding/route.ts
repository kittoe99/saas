import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

// GET /api/onboarding?user_id=...
// Returns the onboarding row for the given user_id, if present
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id') || undefined;
    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }
    const supabase = getSupabaseServer();
    const { data: row, error } = await supabase
      .from('onboarding')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!row) {
      return NextResponse.json({ ok: true, row: null }, { status: 200 });
    }
    return NextResponse.json({ ok: true, row }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

// POST /api/onboarding
// Body: { user_id: string; data: any }
// Upserts onboarding data per user
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const user_id: string | undefined = body?.user_id;
    const data: any = body?.data ?? null;

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }
    if (data === null || typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid data payload' }, { status: 400 });
    }

    const payload = { user_id, data } as { user_id: string; data: any };

    // lazy init client to surface env issues as JSON
    const supabase = getSupabaseServer();

    const { error } = await supabase
      .from('onboarding')
      .upsert(payload, { onConflict: 'user_id' })
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // Read back the row to confirm what was written (debug aid)
    const { data: row, error: readErr } = await supabase
      .from('onboarding')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (readErr) {
      return NextResponse.json({ ok: true, warn: 'Saved but failed to read back', error: readErr.message }, { status: 200 });
    }

    let keys: string[] = [];
    try {
      keys = row && row.data ? Object.keys(row.data) : [];
    } catch {}

    return NextResponse.json({ ok: true, user_id, keys, row }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
