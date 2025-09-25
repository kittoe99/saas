import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { SITE_URL, STRIPE_PRICE_ECOM_LARGE, STRIPE_PRICE_SMALL, STRIPE_PRICE_STARTUP } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured. Set STRIPE_SECRET_KEY." }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const planId: string | undefined = body?.planId;

    const priceMap: Record<string, string | undefined> = {
      small: STRIPE_PRICE_SMALL,
      ecom_large: STRIPE_PRICE_ECOM_LARGE,
      startup: STRIPE_PRICE_STARTUP,
    };

    const price = planId ? priceMap[planId] : undefined;
    if (!price) {
      return NextResponse.json({ error: "Invalid or missing planId/price mapping." }, { status: 400 });
    }

    const successUrl = body?.success_url || `${SITE_URL}/get-started/success`;
    const cancelUrl = body?.cancel_url || `${SITE_URL}/get-started`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      success_url: successUrl + `?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to create checkout session" }, { status: 500 });
  }
}
