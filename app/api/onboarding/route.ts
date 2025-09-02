import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

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

    const payload = { user_id, data } as { user_id: string; data: any };

    const { error } = await supabaseServer
      .from('onboarding')
      .upsert(payload, { onConflict: 'user_id' })
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
