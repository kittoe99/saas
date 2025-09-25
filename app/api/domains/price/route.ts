import { NextResponse } from "next/server";

// GET /api/domains/price?name=example.com&type=new
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const name = url.searchParams.get("name");
    const type = url.searchParams.get("type") || "new"; // new | renewal | transfer | redemption

    if (!name) {
      return NextResponse.json({ error: "Missing domain name (name)" }, { status: 400 });
    }

    const token = process.env.VERCEL_API_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;
    const teamSlug = process.env.VERCEL_TEAM_SLUG;

    if (!token) {
      return NextResponse.json({ error: "Server missing VERCEL_API_TOKEN" }, { status: 500 });
    }

    const params = new URLSearchParams({ name, type });
    if (teamId) params.set("teamId", teamId);
    if (!teamId && teamSlug) params.set("slug", teamSlug);

    const resp = await fetch(`https://api.vercel.com/v4/domains/price?${params.toString()}` , {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // cache disabled to ensure fresh pricing
      cache: "no-store",
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json({ error: data?.error?.message || data?.message || "Failed to fetch price" }, { status: resp.status });
    }

    // Expected: { price: number, period: number }
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected server error" }, { status: 500 });
  }
}
