import { NextResponse } from "next/server";

export async function GET() {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { ok: false, error: "STRIPE_SECRET_KEY is not set in environment" },
        { status: 500 }
      );
    }

    // Minimal direct API call to Stripe without SDK: fetch account details
    const res = await fetch("https://api.stripe.com/v1/accounts", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      // Keep timeouts sane
      next: { revalidate: 0 },
    });

    const requestId = res.headers.get("request-id") || res.headers.get("x-request-id") || undefined;

    if (!res.ok) {
      let err: any = null;
      try { err = await res.json(); } catch { err = await res.text(); }
      return NextResponse.json(
        { ok: false, status: res.status, error: err || "Stripe API error", requestId },
        { status: 502 }
      );
    }

    const data: any = await res.json();
    return NextResponse.json({
      ok: true,
      accountId: data?.id,
      email: data?.email,
      business_type: data?.business_type,
      livemode: Boolean(data?.livemode),
      created: data?.created,
      country: data?.country,
      requestId,
      raw: process.env.NODE_ENV === "development" ? data : undefined,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
