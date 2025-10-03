import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

// GET /api/onboarding?website_id=... or ?user_id=...
// If website_id is provided, returns onboarding for that website.
// Otherwise, if user_id is provided, returns the most recent onboarding for that user's websites (if any).
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const supabase = getSupabaseServer();
    const website_id = searchParams.get('website_id') || undefined;
    const user_id = searchParams.get('user_id') || undefined;

    if (!website_id && !user_id) {
      return NextResponse.json({ error: 'Missing website_id or user_id' }, { status: 400 });
    }

    if (website_id) {
      const { data: obRow, error } = await supabase
        .from('onboarding')
        .select('*')
        .eq('website_id', website_id)
        .maybeSingle();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Try to supplement from latest onboarding_submissions for completeness
      const { data: subRow } = await supabase
        .from('onboarding_submissions')
        .select('answers')
        .eq('website_id', website_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const base = (obRow?.data as any) || {};
      const extra = (subRow?.answers as any) || {};
      // Shallow merge (do not overwrite defined values in base)
      const merged: any = { ...extra, ...base };
      const mergedRow = obRow ? { ...obRow, data: merged } : (Object.keys(merged).length ? { website_id, data: merged } : null);

      return NextResponse.json({ ok: true, row: mergedRow }, { status: 200 });
    }

    // Fallback: find any onboarding row for any website owned by this user (avoid joins for RLS compatibility)
    const { data: sites, error: sitesErr } = await supabase
      .from('websites')
      .select('id, created_at')
      .eq('user_id', user_id!)
      .order('created_at', { ascending: false });
    if (sitesErr) return NextResponse.json({ error: sitesErr.message }, { status: 500 });
    const siteIds = (sites || []).map((s: any) => s.id);
    if (siteIds.length === 0) return NextResponse.json({ ok: true, row: null }, { status: 200 });

    const { data: obAny, error: obAnyErr } = await supabase
      .from('onboarding')
      .select('*')
      .in('website_id', siteIds)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (obAnyErr) return NextResponse.json({ error: obAnyErr.message }, { status: 500 });
    if (!obAny?.website_id) return NextResponse.json({ ok: true, row: null }, { status: 200 });

    const { data: subRow } = await supabase
      .from('onboarding_submissions')
      .select('answers')
      .eq('website_id', obAny.website_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const base = (obAny?.data as any) || {};
    const extra = (subRow?.answers as any) || {};
    const merged: any = { ...extra, ...base };
    const mergedRow = { ...obAny, data: merged };

    return NextResponse.json({ ok: true, row: mergedRow }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

// POST /api/onboarding
// Body: { user_id: string; website_id?: string; data: any }
// Upserts onboarding data per website. If website_id is not provided, a draft website will be created/reused for the user.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const user_id: string | undefined = body?.user_id;
    let website_id: string | undefined = body?.website_id || undefined;
    const data: any = body?.data ?? null;

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }
    if (data === null || typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid data payload' }, { status: 400 });
    }

    // lazy init client to surface env issues as JSON
    const supabase = getSupabaseServer();

    // Validate or create website
    if (website_id) {
      // Ensure the website belongs to the user
      const { data: owned, error: ownErr } = await supabase
        .from('websites')
        .select('id,user_id')
        .eq('id', website_id)
        .maybeSingle();
      if (ownErr) return NextResponse.json({ error: `Failed to verify website: ${ownErr.message}` }, { status: 500 });
      if (!owned || owned.user_id !== user_id) {
        return NextResponse.json({ error: 'Website does not exist or is not owned by user' }, { status: 403 });
      }
      // If a name is provided in onboarding data, update website name for easier identification in Dashboard
      const newName = typeof data?.name === 'string' && data.name.trim().length ? data.name.trim() : null;
      if (newName) {
        await supabase.from('websites').update({ name: newName }).eq('id', website_id);
      }
    } else {
      // Reuse existing site when possible to avoid duplicate website records.
      // 1) Prefer website that already has onboarding for this user (latest).
      const { data: existingOb, error: obFindErr } = await supabase
        .from('onboarding')
        .select('website_id, websites!inner(user_id, created_at)')
        .eq('websites.user_id', user_id)
        .order('websites.created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (obFindErr) {
        return NextResponse.json({ error: `Failed to look up onboarding: ${obFindErr.message}` }, { status: 500 });
      }
      if (existingOb?.website_id) {
        website_id = existingOb.website_id as string;
      } else {
        // 2) Otherwise reuse the user's most recent website if any
        const { data: site, error: siteErr } = await supabase
          .from('websites')
          .select('id')
          .eq('user_id', user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (siteErr) {
          return NextResponse.json({ error: `Failed to look up website: ${siteErr.message}` }, { status: 500 });
        }
        if (site?.id) {
          website_id = site.id as string;
        } else {
          // 3) Finally, create a new draft website
          const newSite = {
            user_id,
            name: typeof data?.name === 'string' && data.name.trim().length ? data.name.trim() : null,
            status: 'draft' as const,
          };
          const { data: created, error: siteCreateErr } = await supabase
            .from('websites')
            .insert(newSite)
            .select('id')
            .single();
          if (siteCreateErr) {
            return NextResponse.json({ error: `Failed to create website: ${siteCreateErr.message}` }, { status: 500 });
          }
          website_id = created?.id as string | undefined;
        }
      }
    }

    const payload = { user_id, data, website_id } as { user_id: string; data: any; website_id: string | undefined };

    const { error } = await supabase
      .from('onboarding')
      .upsert(payload, { onConflict: 'website_id' })
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // Read back the row to confirm what was written (debug aid)
    const { data: row, error: readErr } = await supabase
      .from('onboarding')
      .select('*')
      .eq('website_id', website_id!)
      .single();

    if (readErr) {
      return NextResponse.json({ ok: true, warn: 'Saved but failed to read back', error: readErr.message }, { status: 200 });
    }

    let keys: string[] = [];
    try {
      keys = row && row.data ? Object.keys(row.data) : [];
    } catch {}

    // Sync a convenience flag on websites so Dashboard logic can rely on the websites table alone
    try {
      const completed = keys.length > 0;
      if (website_id) {
        await supabase
          .from('websites')
          .update({ onboarding_completed: completed })
          .eq('id', website_id);
      }
    } catch {}

    return NextResponse.json({ ok: true, user_id, website_id: row?.website_id ?? website_id, keys, row }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
