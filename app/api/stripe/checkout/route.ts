import { NextRequest, NextResponse } from "next/server";

function formEncode(data: Record<string, any>, prefix?: string, out: URLSearchParams = new URLSearchParams()): URLSearchParams {
  for (const [key, value] of Object.entries(data)) {
    const k = prefix ? `${prefix}[${key}]` : key;
    if (value === undefined || value === null) continue;
    if (typeof value === "object" && !Array.isArray(value)) {
      formEncode(value, k, out);
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (typeof v === "object") formEncode(v, `${k}[${i}]`, out);
        else out.append(`${k}[${i}]`, String(v));
      });
    } else {
      out.append(k, String(value));
    }
  }
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY not set" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));

    const amount = Number(body?.amount_cents);
    const currency = (body?.currency || "usd").toString();
    const name = (body?.name || "Test Payment").toString();
    const quantity = Number(body?.quantity || 1);
    const userId = body?.user_id ? String(body.user_id) : undefined;
    const email = body?.email ? String(body.email) : undefined;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "amount_cents must be a positive integer" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || req.nextUrl.origin || "http://localhost:3000";
    // Include session_id placeholder so success page can query details if needed
    const success = (body?.success_url as string) || `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancel = (body?.cancel_url as string) || `${origin}/checkout/cancel`;

    // Build params for Stripe Checkout Session (mode=payment) with inline price_data
    const params = formEncode({
      mode: "payment",
      // Restrict to card to remove Stripe Link and other methods unless explicitly added later
      payment_method_types: ["card"],
      success_url: success,
      cancel_url: cancel,
      client_reference_id: userId,
      customer_email: email,
      metadata: {
        user_id: userId,
        name,
      },
      automatic_tax: { enabled: true },
      // Prevent promotion codes and shipping for minimal flow; extend as needed
      line_items: [
        {
          quantity: quantity,
          price_data: {
            currency,
            unit_amount: amount,
            product_data: { name },
          },
        },
      ],
    });

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      // Disable caching
      next: { revalidate: 0 },
    });

    const requestId = res.headers.get("request-id") || res.headers.get("x-request-id") || undefined;

    if (!res.ok) {
      let err: any = null;
      try { err = await res.json(); } catch { err = await res.text(); }
      const msg =
        (typeof err === "object" && err)
          ? (err.error?.message || err.message || err.error_description || JSON.stringify(err))
          : (err || "Stripe error");
      return NextResponse.json({ ok: false, error: msg, status: res.status, requestId }, { status: 502 });
    }

    const data: any = await res.json();
    // Respond with session URL so client can redirect
    return NextResponse.json({ id: data?.id, url: data?.url, requestId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
