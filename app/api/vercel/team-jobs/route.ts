import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { vercelPost } from '@/lib/vercel';

// POST /api/vercel/team-jobs
// Processes pending vercel_team_jobs: creates Vercel team using email as name, then updates profiles.site_team
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

    // Fetch pending jobs
    const { data: jobs, error: jobsErr } = await supabase
      .from('vercel_team_jobs')
      .select('id,user_id,email,attempts')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (jobsErr) {
      return NextResponse.json({ error: `Failed to fetch jobs: ${jobsErr.message}` }, { status: 500 });
    }

    const results: Array<{ id: string; ok: boolean; error?: string; team_id?: string }> = [];

    for (const job of jobs || []) {
      try {
        // Create team on Vercel
        const team = await vercelPost<any>('/v2/teams', { name: (job.email || '').toLowerCase() });
        const teamId: string | undefined = team?.id;
        if (!teamId) {
          throw new Error('Vercel did not return a team id');
        }

        // Store on profile
        const { error: upErr } = await supabase
          .from('profiles')
          .update({ site_team: teamId })
          .eq('id', job.user_id);
        if (upErr) throw new Error(`Failed to save team to profile: ${upErr.message}`);

        // Mark job success
        const { error: markErr } = await supabase
          .from('vercel_team_jobs')
          .update({ status: 'success', last_error: null, attempts: job.attempts + 1 })
          .eq('id', job.id);
        if (markErr) throw new Error(`Failed to mark job success: ${markErr.message}`);

        results.push({ id: job.id, ok: true, team_id: teamId });
      } catch (e: any) {
        const message = e?.message || 'Unknown error';
        // Mark job error and increment attempts; keep as pending for retry up to 5 attempts, else set status error
        const attempts = (job.attempts ?? 0) + 1;
        const status = attempts >= 5 ? 'error' : 'pending';
        const { error: markErr } = await supabase
          .from('vercel_team_jobs')
          .update({ status, attempts, last_error: message })
          .eq('id', job.id);
        if (markErr) {
          // If even marking fails, include that note but continue
          results.push({ id: job.id, ok: false, error: `${message}; also failed to mark: ${markErr.message}` });
        } else {
          results.push({ id: job.id, ok: false, error: message });
        }
      }
    }

    return NextResponse.json({ ok: true, processed: results.length, results }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
