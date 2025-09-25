import { NextResponse } from "next/server";

// GET /api/domains/availability?name=example.com
export async function GET(req: Request) {
  try {
    const token = process.env.VERCEL_API_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;
    const teamSlug = process.env.VERCEL_TEAM_SLUG;
    if (!token) return NextResponse.json({ error: "Server missing VERCEL_API_TOKEN" }, { status: 500 });

    const url = new URL(req.url);
    const name = url.searchParams.get("name");
    if (!name) return NextResponse.json({ error: "Missing domain name (name)" }, { status: 400 });

    const u = new URL("https://api.vercel.com/v4/domains/availability");
    u.searchParams.set("name", name);
    if (teamId) u.searchParams.set("teamId", teamId);
    else if (teamSlug) u.searchParams.set("slug", teamSlug);

    const resp = await fetch(u.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    let data: any = await resp.json().catch(() => ({}));
    if (!resp.ok || typeof data?.available === 'undefined') {
      // Fallback to legacy/status endpoint per docs naming
      const s = new URL("https://api.vercel.com/v4/domains/status");
      s.searchParams.set("name", name);
      if (teamId) s.searchParams.set("teamId", teamId);
      else if (teamSlug) s.searchParams.set("slug", teamSlug);
      const sResp = await fetch(s.toString(), {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
      });
      const sData: any = await sResp.json().catch(() => ({}));
      if (!sResp.ok) {
        return NextResponse.json({ error: sData?.error?.message || sData?.message || data?.error?.message || data?.message || "Failed to check availability" }, { status: sResp.status });
      }
      return NextResponse.json({ available: Boolean(sData?.available) }, { status: 200 });
    }

    // Expected: { available: boolean, ... }
    return NextResponse.json({ available: Boolean(data?.available) }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected server error" }, { status: 500 });
  }
}
