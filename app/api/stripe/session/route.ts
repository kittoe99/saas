import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return NextResponse.json({ error: "STRIPE_SECRET_KEY not set" }, { status: 500 });

    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

    const url = `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secret}`,
      },
      // no cache
      next: { revalidate: 0 },
    });

    const requestId = res.headers.get("request-id") || res.headers.get("x-request-id") || undefined;

    if (!res.ok) {
      let err: any;
      try { err = await res.json(); } catch { err = await res.text(); }
      const msg = (typeof err === "object" && err)
        ? (err.error?.message || err.message || err.error_description || JSON.stringify(err))
        : (err || "Stripe error");
      return NextResponse.json({ ok: false, error: msg, status: res.status, requestId }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ ok: true, session: data, requestId });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
