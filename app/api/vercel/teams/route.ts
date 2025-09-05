import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { vercelPostNoTeam } from '@/lib/vercel';

// POST /api/vercel/teams
// Body: { user_id?: string; email?: string }
// Creates a Vercel team using the email as the team name, then stores the team id in profiles.site_team
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const user_id: string | undefined = body?.user_id;
    let email: string | undefined = (body?.email as string | undefined)?.toLowerCase();

    const supabase = getSupabaseServer();

    if (!user_id && !email) {
      return NextResponse.json({ error: 'Missing user_id or email' }, { status: 400 });
    }

    // Resolve email from profiles if only user_id provided
    if (!email && user_id) {
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user_id)
        .maybeSingle();
      if (profErr) return NextResponse.json({ error: `Failed to read profile: ${profErr.message}` }, { status: 500 });
      email = (prof?.email || '').toLowerCase();
      if (!email) return NextResponse.json({ error: 'No email found on profile' }, { status: 400 });
    }

    // Create Vercel team using a normalized name + slug derived from email
    const raw = (email || '').toLowerCase();
    const base = raw.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const name = base.slice(0, 48) || 'team';
    // Vercel requires a `slug` now: 3-32 chars, lowercase, alphanumeric or hyphen, must start/end alphanumeric
    let slug = base.replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '');
    if (!slug || slug.length < 3) {
      const rand = Math.random().toString(36).slice(2, 6);
      slug = `team-${rand}`;
    }
    slug = slug.slice(0, 32);
    const team = await vercelPostNoTeam<any>('/v2/teams', { name, slug });
    const teamId: string | undefined = team?.id;
    if (!teamId) {
      return NextResponse.json({ error: 'Vercel did not return a team id' }, { status: 502 });
    }

    // If we don't have user_id but have email, try to resolve user_id from profiles to store the team id
    let resolvedUserId = user_id;
    if (!resolvedUserId) {
      const { data: prof, error: findErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email!)
        .limit(1)
        .maybeSingle();
      if (findErr) return NextResponse.json({ error: `Failed to resolve user from email: ${findErr.message}` }, { status: 500 });
      resolvedUserId = prof?.id as string | undefined;
    }

    if (resolvedUserId) {
      const { error: upErr } = await supabase
        .from('profiles')
        .update({ site_team: teamId })
        .eq('id', resolvedUserId);
      if (upErr) return NextResponse.json({ error: `Failed to save team to profile: ${upErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true, team_id: teamId, team }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
