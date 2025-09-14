import { NextResponse } from 'next/server';
import { v0 } from '@/lib/v0';
import { getSupabaseServer } from '@/lib/supabaseServer';

// POST /api/v0/projects
// Body: { name: string, description?: string, icon?: string, env?: Record<string,string>, instructions?: string, user_id: string, website_id?: string }
// Creates a v0 project and persists linkage for the user (and optional website)
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body?.name as string | undefined)?.trim();
    if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });
    const website_id: string | undefined = body?.website_id;
    const user_id: string | undefined = body?.user_id;
    if (!user_id) return NextResponse.json({ error: 'Missing user_id (sign in required)' }, { status: 400 });

    const payload: any = { name };
    if (body?.description) payload.description = body.description;
    if (body?.icon) payload.icon = body.icon;
    if (body?.env) payload.env = body.env;
    if (body?.instructions) {
      const instr = String(body.instructions);
      payload.instructions = instr.slice(0, 1000);
    }

    let project: any = null;
    try {
      project = await (v0 as any).projects.create(payload);
    } catch (e) {
      // REST fallback
      const apiKey = process.env.V0_API_KEY;
      const base = process.env.V0_API_BASE || 'https://api.v0.dev';
      if (!apiKey) throw e;
      const r = await fetch(`${base}/projects`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const j = await r.json().catch(() => ({} as any));
      if (!r.ok) return NextResponse.json({ error: j?.error || 'Failed to create project (REST)' }, { status: r.status });
      project = j;
    }

    // Persist strictly using the service role client
    const supabase = getSupabaseServer();
    const { error: persistErr } = await supabase
      .from('v0_projects')
      .insert({
        user_id,
        website_id: website_id ?? null,
        v0_project_id: (project as any).id,
        name: (project as any).name ?? name,
      })
      .single();
    if (persistErr) {
      return NextResponse.json({ error: `Failed to persist project: ${persistErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ id: (project as any).id, project }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
