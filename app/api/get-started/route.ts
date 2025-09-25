import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

// POST /api/get-started
// Body: { user_id: string; plan?: string; data: any }
// Upserts a get started submission keyed by user_id
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const user_id: string | undefined = body?.user_id;
    const plan: string | undefined = body?.plan;
    const data: any = body?.data ?? null;

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }
    if (data === null || typeof data !== "object") {
      return NextResponse.json({ error: "Invalid data payload" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // 1) Ensure there is a website for this user (create one if none exists)
    const { data: existingSites, error: siteErr } = await supabase
      .from("websites")
      .select("id")
      .eq("user_id", user_id)
      .order("created_at", { ascending: true })
      .limit(1);
    if (siteErr) {
      return NextResponse.json({ error: siteErr.message }, { status: 500 });
    }

    let website_id: string | undefined = existingSites?.[0]?.id;
    if (!website_id) {
      const { data: created, error: createErr } = await supabase
        .from("websites")
        .insert([{ user_id, plan: plan ?? null, status: "draft" }])
        .select("id")
        .single();
      if (createErr) {
        return NextResponse.json({ error: createErr.message }, { status: 500 });
      }
      website_id = created.id as string;
    } else if (plan) {
      // Update plan on the existing website (optional best-effort)
      await supabase.from("websites").update({ plan }).eq("id", website_id);
    }

    // 2) Upsert onboarding for this website/user with provided data
    const { error: obErr } = await supabase
      .from("onboarding")
      .upsert({ website_id, user_id, data }, { onConflict: "website_id" })
      .single();
    if (obErr) {
      return NextResponse.json({ error: obErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, website_id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
