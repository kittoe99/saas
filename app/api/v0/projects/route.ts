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
    if (body?.instructions) payload.instructions = body.instructions;

    const project = await v0.projects.create(payload);

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
