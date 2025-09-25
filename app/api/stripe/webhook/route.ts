import { NextRequest, NextResponse } from "next/server";

// Stripe integration temporarily disabled. Webhook endpoint returns 410 Gone.
export async function POST(_req: NextRequest) {
  return NextResponse.json({ error: "Stripe integration disabled" }, { status: 410 });
}

export async function GET(_req: NextRequest) {
  return NextResponse.json({ error: "Stripe integration disabled" }, { status: 410 });
}
