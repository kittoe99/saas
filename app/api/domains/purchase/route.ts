import { NextResponse } from "next/server";

// POST /api/domains/purchase
// Body: {
//   name: string,
//   expectedPrice: number,
//   renew?: boolean,
//   country: string,
//   orgName?: string,
//   firstName: string,
//   lastName: string,
//   address1: string,
//   address2?: string,
//   city: string,
//   state?: string,
//   postalCode: string,
//   phone: string,
//   email: string
// }
export async function POST(req: Request) {
  try {
    const token = process.env.VERCEL_API_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;
    const teamSlug = process.env.VERCEL_TEAM_SLUG;
    if (!token) {
      return NextResponse.json({ error: "Server missing VERCEL_API_TOKEN" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({} as any));
    const {
      name,
      expectedPrice,
      renew = true,
      country,
      orgName,
      firstName,
      lastName,
      address1,
      address2,
      city,
      state,
      postalCode,
      phone,
      email,
    } = body || {};

    // Minimal validation
    const missing: string[] = [];
    if (!name) missing.push("name");
    if (expectedPrice === undefined || expectedPrice === null) missing.push("expectedPrice");
    if (!country) missing.push("country");
    if (!firstName) missing.push("firstName");
    if (!lastName) missing.push("lastName");
    if (!address1) missing.push("address1");
    if (!city) missing.push("city");
    if (!postalCode) missing.push("postalCode");
    if (!phone) missing.push("phone");
    if (!email) missing.push("email");

    if (missing.length) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
    }

    const params = new URLSearchParams();
    if (teamId) params.set("teamId", teamId);
    if (!teamId && teamSlug) params.set("slug", teamSlug);

    const resp = await fetch(`https://api.vercel.com/v4/domains/buy?${params.toString()}` , {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        name,
        expectedPrice,
        renew,
        country,
        orgName,
        firstName,
        lastName,
        address1,
        address2,
        city,
        state,
        postalCode,
        phone,
        email,
      }),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      // Avoid echoing sensitive data back
      return NextResponse.json({ error: data?.error?.message || data?.message || "Failed to purchase domain" }, { status: resp.status });
    }

    // Expected: { domain: { uid, ns[], verified, created, pending } }
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected server error" }, { status: 500 });
  }
}
