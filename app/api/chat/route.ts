import { NextResponse } from "next/server";
import { dsComplete, type DSMessage } from "@/lib/deepseek";
import { deepseekSiteIntel } from "@/lib/deepseekSearch";

export const runtime = "edge";

function json(data: unknown, init?: number | ResponseInit) {
  return NextResponse.json(data, init as any);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: DSMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    const search: boolean = !!body?.search;
    const siteUrl: string | undefined = body?.siteUrl;

    if (!process.env.DEEPSEEK_API_KEY) {
      return json({ error: "Missing DEEPSEEK_API_KEY" }, { status: 400 });
    }

    let composed: DSMessage[] = [];

    if (search && siteUrl) {
      try {
        const intel = await deepseekSiteIntel(siteUrl);
        if (intel && (intel.summary || intel.details)) {
          const contextParts: string[] = [];
          if (intel.summary) contextParts.push(`Summary: ${intel.summary}`);
          if (intel.details) {
            contextParts.push(`Details: ${JSON.stringify(intel.details)}`);
          }
          composed.push({
            role: "system",
            content:
              "You are an assistant that can use provided site context to answer questions about the business. Prefer the provided context. If the user asks unrelated questions, answer normally.",
          });
          composed.push({
            role: "user",
            content: `Site context (from live search):\n${contextParts.join("\n")}`,
          });
        }
      } catch (e) {
        // If retrieval fails, continue with plain chat
      }
    }

    // Append conversation messages last (so they take precedence over context prompt ordering)
    composed = composed.concat(messages);

    const res = await dsComplete(composed, { temperature: 0.3, max_tokens: 900, reasoning: true });
    const text = res.choices?.[0]?.message?.content || "";
    return json({ message: text });
  } catch (e: any) {
    console.error("/api/chat error", e);
    return json({ error: e?.message ?? "Unexpected error" }, { status: 500 });
  }
}
