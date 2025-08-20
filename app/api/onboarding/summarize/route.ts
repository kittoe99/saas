import { NextResponse } from "next/server";
export const runtime = "edge";
import { deepseekSiteIntel } from "@/lib/deepseekSearch";

function json(data: unknown, init?: number | ResponseInit) {
  return NextResponse.json(data, init as any);
}

// no-op: sitemap crawling removed; we mirror the AI page pattern (Tavily + DeepSeek)

function domainFromUrl(input: string): string | null {
  try {
    const u = new URL(input);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url: string | undefined = body?.url;
    if (!url) return json({ error: "Missing url" }, { status: 400 });
    const domain = domainFromUrl(url);
    if (!domain) return json({ error: "Invalid URL" }, { status: 400 });

    const intel = await deepseekSiteIntel(url);
    if (!intel) return json({ notFound: true });
    return json({
      notFound: false,
      summary: intel.summary || "",
      details: intel.details || {},
      about: intel.about ?? intel.summary ?? "",
      purpose: intel.purpose ?? "",
      services: Array.isArray(intel.services) ? intel.services : Array.isArray(intel.details?.offerings) ? intel.details!.offerings! : [],
    });
  } catch (e: any) {
    console.error("/api/onboarding/summarize error", e);
    return json({ error: e?.message ?? "Unexpected error" }, { status: 500 });
  }
}
