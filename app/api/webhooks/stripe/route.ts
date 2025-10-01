import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

// Utility: constant-time string comparison
function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

// Verify Stripe signature manually (no SDK)
function verifyStripeSignature({
  payload,
  header,
  secret,
  toleranceSeconds = 300,
}: {
  payload: string;
  header: string | null;
  secret: string;
  toleranceSeconds?: number;
}): { ok: boolean; message?: string } {
  if (!header) return { ok: false, message: "Missing Stripe-Signature header" };

  // Header format: t=timestamp,v1=signature[,v1=alt]...
  const parts = header.split(",").map((p) => p.trim());
  const timePart = parts.find((p) => p.startsWith("t="));
  const sigParts = parts.filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (!timePart || sigParts.length === 0) return { ok: false, message: "Malformed Stripe-Signature header" };

  const timestamp = Number(timePart.slice(2));
  if (!Number.isFinite(timestamp)) return { ok: false, message: "Invalid timestamp in signature" };

  // Optional: reject stale events
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) {
    return { ok: false, message: "Signature timestamp outside tolerance" };
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");

  // Stripe may send multiple v1 signatures; accept if any matches
  const match = sigParts.some((sig) => timingSafeEqual(sig, expected));
  if (!match) return { ok: false, message: "Signature mismatch" };
  return { ok: true };
}

export async function POST(req: NextRequest) {
  // Read raw body for signature verification
  const text = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    // Return 500 so Stripe retries until configured
    return NextResponse.json({ ok: false, error: "STRIPE_WEBHOOK_SECRET not set" }, { status: 500 });
  }

  const verified = verifyStripeSignature({ payload: text, header: sig, secret });
  if (!verified.ok) {
    return NextResponse.json({ ok: false, error: verified.message || "Invalid signature" }, { status: 400 });
  }

  // Now the payload is trusted; parse JSON
  let event: any;
  try {
    event = JSON.parse(text);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  try {
    const type = event?.type as string | undefined;
    const dataObject = event?.data?.object;

    // Minimal handlers for test mode; extend as needed.
    switch (type) {
      case "checkout.session.completed": {
        // Identify user who paid
        const clientRef = dataObject?.client_reference_id || null;
        const metaUser = dataObject?.metadata?.user_id || null;
        const customer = dataObject?.customer || null;
        const amountTotal = dataObject?.amount_total || null;
        const currency = dataObject?.currency || null;
        const status = dataObject?.status || null;
        const livemode = Boolean(dataObject?.livemode);
        const sessionId = dataObject?.id || null;
        const paymentIntentId = dataObject?.payment_intent || null;
        const metaWebsiteId = dataObject?.metadata?.website_id || null;
        const metaPlan = dataObject?.metadata?.plan || null;

        // Insert into Supabase (PostgREST) if env is configured
        const supabaseUrl = process.env.SUPABASE_URL; // e.g. https://mjgwoukwyqwoectxfwqv.supabase.co
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && serviceKey && sessionId && (metaUser || clientRef)) {
          const payload = [{
            user_id: metaUser || clientRef,
            session_id: sessionId,
            customer_id: customer,
            payment_intent_id: paymentIntentId,
            amount_total: amountTotal,
            currency,
            status,
            livemode,
            metadata: dataObject?.metadata || {},
            website_id: metaWebsiteId || null,
            plan: metaPlan || null,
          }];

          const url = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/payments?on_conflict=session_id`;
          const ins = await fetch(url, {
            method: "POST",
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
              Prefer: "resolution=merge-duplicates,return=representation",
            },
            body: JSON.stringify(payload),
          });

          // Best-effort: don't fail webhook if DB write fails; log-like response body for debugging
          if (!ins.ok) {
            let errBody: any = null;
            try { errBody = await ins.json(); } catch { errBody = await ins.text(); }
            return NextResponse.json({ ok: false, step: "db_insert", status: ins.status, error: errBody }, { status: 500 });
          }
        }
        break;
      }
      case "invoice.payment_succeeded": {
        // For subscriptions in the future
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        // For subscriptions lifecycle
        break;
      }
      default: {
        // Ignore unhandled types in test mode
        break;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // Ensure Stripe sees a 2xx only when processed successfully
    return NextResponse.json({ ok: false, error: e?.message || "Webhook processing error" }, { status: 500 });
  }
}
