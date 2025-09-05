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

    const payload = { user_id, plan: plan ?? null, data } as { user_id: string; plan: string | null; data: any };

    // Use upsert since user may resubmit
    const { error } = await supabase
      .from("plans")
      .upsert(payload, { onConflict: "user_id" })
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
