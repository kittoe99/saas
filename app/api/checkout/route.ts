import { NextRequest, NextResponse } from "next/server";

// Stubbed checkout endpoint. No real payment integration yet.
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: "Checkout not implemented yet. Payment integration is pending." },
    { status: 501 }
  );
}
