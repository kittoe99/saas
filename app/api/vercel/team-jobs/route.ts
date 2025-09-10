import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { vercelPost } from '@/lib/vercel';

// POST /api/vercel/team-jobs
// Processes profiles that are missing a Vercel team: creates a Vercel team using profile email as name,
// then updates profiles.site_team with the created team id.
// Optional body: { limit?: number }

// Allow GET to run the same processor (e.g., Vercel Cron GET)
export async function GET(req: Request) {
  // Delegate to POST with empty body
  return POST(new Request(req.url, { method: 'POST', headers: req.headers }));
}
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.max(1, Math.min(Number(body?.limit ?? 10), 50));

    const supabase = getSupabaseServer();
    // Fetch profiles needing a team (no queue table)
    const { data: profiles, error: profErr } = await supabase
      .from('profiles')
      .select('id,email,site_team')
      .is('site_team', null)
      .not('email', 'is', null)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (profErr) {
      return NextResponse.json({ error: `Failed to fetch profiles: ${profErr.message}` }, { status: 500 });
    }

    const results: Array<{ user_id: string; ok: boolean; error?: string; team_id?: string }> = [];

    for (const prof of profiles || []) {
      try {
        // Create team on Vercel
        const team = await vercelPost<any>('/v2/teams', { name: (prof.email || '').toLowerCase() });
        const teamId: string | undefined = team?.id;
        if (!teamId) {
          throw new Error('Vercel did not return a team id');
        }

        // Store on profile
        const { error: upErr } = await supabase
          .from('profiles')
          .update({ site_team: teamId })
          .eq('id', prof.id);
        if (upErr) throw new Error(`Failed to save team to profile: ${upErr.message}`);

        results.push({ user_id: prof.id, ok: true, team_id: teamId });
      } catch (e: any) {
        const message = e?.message || 'Unknown error';
        // Just report the failure for this profile
        results.push({ user_id: prof.id, ok: false, error: message });
      }
    }

    return NextResponse.json({ ok: true, processed: results.length, results }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
