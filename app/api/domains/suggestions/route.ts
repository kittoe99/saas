import { NextResponse } from "next/server";

// GET /api/domains/suggestions?q=acme&tlds=com,net,org,io,co
// Returns: { suggestions: Array<{ name: string; available: boolean | null; price: number | null; period: number | null }> }
export async function GET(req: Request) {
  try {
    const token = process.env.VERCEL_API_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;
    const teamSlug = process.env.VERCEL_TEAM_SLUG;
    if (!token) return NextResponse.json({ error: "Server missing VERCEL_API_TOKEN" }, { status: 500 });

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();
    const tldsParam = url.searchParams.get("tlds");

    if (!q) return NextResponse.json({ error: "Missing query (q)" }, { status: 400 });

    const defaultTlds = ["com", "net", "org", "io", "co", "app", "dev", "ai", "xyz"];
    const tlds = (tldsParam ? tldsParam.split(",") : defaultTlds).map((s) => s.trim().replace(/^\./, "")).filter(Boolean).slice(0, 12);

    // Make a small set of variants
    const bases = Array.from(new Set([
      q,
      q.replace(/[^a-z0-9]+/g, "").slice(0, 30),
      q.replace(/\s+/g, "-").slice(0, 30),
      q.endsWith("app") ? q : `${q}app`,
      q.endsWith("hq") ? q : `${q}hq`,
    ].filter(Boolean)));

    // Build candidate names
    const candidates: string[] = [];
    for (const base of bases) {
      for (const tld of tlds) {
        candidates.push(`${base}.${tld}`);
      }
    }

    // Helper to append team params
    const withScope = (u: URL) => {
      if (teamId) u.searchParams.set("teamId", teamId);
      else if (teamSlug) u.searchParams.set("slug", teamSlug);
      return u;
    };

    const fetchAvailabilityAndPrice = async (name: string) => {
      try {
        // Availability (with fallback)
        const availUrl = withScope(new URL("https://api.vercel.com/v4/domains/availability"));
        availUrl.searchParams.set("name", name);
        let available: boolean | null = null;
        try {
          const availResp = await fetch(availUrl.toString(), { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, cache: "no-store" });
          const availJson: any = await availResp.json().catch(() => ({}));
          if (availResp.ok && typeof availJson?.available !== 'undefined') {
            available = Boolean(availJson.available);
          } else {
            const statusUrl = withScope(new URL("https://api.vercel.com/v4/domains/status"));
            statusUrl.searchParams.set("name", name);
            const sResp = await fetch(statusUrl.toString(), { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, cache: 'no-store' });
            const sJson: any = await sResp.json().catch(() => ({}));
            if (sResp.ok && typeof sJson?.available !== 'undefined') {
              available = Boolean(sJson.available);
            }
          }
        } catch {}

        // Price
        const priceUrl = withScope(new URL("https://api.vercel.com/v4/domains/price"));
        priceUrl.searchParams.set("name", name);
        priceUrl.searchParams.set("type", "new");
        let price: number | null = null;
        let period: number | null = null;
        try {
          const priceResp = await fetch(priceUrl.toString(), { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, cache: "no-store" });
          const priceJson: any = await priceResp.json().catch(() => ({}));
          if (priceResp.ok && typeof priceJson?.price !== 'undefined' && typeof priceJson?.period !== 'undefined') {
            price = Number(priceJson.price);
            period = Number(priceJson.period);
          }
        } catch {}

        return { name, available, price, period };
      } catch {
        return { name, available: null, price: null, period: null };
      }
    };

    // Limit to a reasonable number to avoid rate limits
    const limited = candidates.slice(0, 24);
    const results = await Promise.all(limited.map((n) => fetchAvailabilityAndPrice(n)));

    // Sort: available first, then by price asc
    const suggestions = results
      .sort((a, b) => {
        const aAvail = a.available ? 1 : 0;
        const bAvail = b.available ? 1 : 0;
        if (aAvail !== bAvail) return bAvail - aAvail;
        const ap = a.price ?? Number.POSITIVE_INFINITY;
        const bp = b.price ?? Number.POSITIVE_INFINITY;
        return ap - bp;
      });

    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected server error" }, { status: 500 });
  }
}
