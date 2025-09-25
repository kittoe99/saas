import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured. Set STRIPE_SECRET_KEY." }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const { customer_id, return_url } = body || {};
    if (!customer_id || typeof customer_id !== "string") {
      return NextResponse.json({ error: "Missing customer_id" }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: return_url || `${SITE_URL}/dashboard` ,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to create billing portal session" }, { status: 500 });
  }
}
