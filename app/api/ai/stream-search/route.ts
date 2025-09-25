import { NextResponse } from "next/server";
import { webSearch } from "@/lib/search";
import { getDeepseek, DSMessage } from "@/lib/deepseek";

export const runtime = "nodejs";

function buildPrompt(query: string, sources: Array<{ title: string; url: string; content: string }>) {
  const header = [
    "You are an onboarding copy expert and factual research assistant.",
    "Write concise, neutral, marketing-light output suitable for a product onboarding screen.",
    "Strict rules:",
    "- Base all claims ONLY on the provided sources; do not invent details.",
    "- Prefer specifics (industries, offerings, audience, locations).",
    "- No preambles like 'Based on the sources'; no disclaimers; no repeated content.",
    "- Include what the organization does, who it serves, and key services/offerings when known.",
    "- If something is unclear in sources, omit it (do not speculate).",
    "- Cite sources inline as [n] where appropriate and end with a 'References' list.",
  ].join("\n");

  const sourceBlocks = sources
    .map((s, i) => `Source [${i + 1}] ${s.title}\nURL: ${s.url}\nContent: ${s.content}`)
    .join("\n\n");

  const user = [
    `Task: ${query}`,
    "\nSources:",
    sourceBlocks,
    "\nOutput format:",
    "- First, a 2–4 sentence paragraph summary (no heading).",
    "- Then, 4–7 single-line bullets (start each with '- '). Use short category headings and bold them, e.g., '**Services**:'",
    "  Recommended headings: Services, Service areas, Pricing, Specializations, Process, Certifications, Contact.",
    "  Suggested bullets: What they do; Who they serve; Key offerings/services; Locations (if any); Contact (if any); Differentiators (if any).",
    "  Keep each bullet concise (max ~20 words). Place citations [n] at the end of the bullet if used.",
    "- Then a 'References' section with [n] -> URL lines.",
  ].join("\n");

  return { header, user };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const query: string = body.query;
    const siteRaw: string | undefined = typeof body.site === "string" && body.site.trim() ? String(body.site).trim() : undefined;
    // Allow either domain or full URL; normalize to hostname without www.
    let siteDomain: string | undefined = siteRaw;
    if (siteRaw) {
      try {
        const u = new URL(/^https?:\/\//i.test(siteRaw) ? siteRaw : `https://${siteRaw}`);
        siteDomain = u.hostname.replace(/^www\./, "");
      } catch {
        // keep as-is if not parseable; Tavily will still accept site:foo.com in the query
        siteDomain = siteRaw;
      }
    }
    const model: string | undefined = typeof body.model === "string" ? body.model : undefined;
    const reasoning: boolean = Boolean(body.reasoning);

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Field 'query' is required" }, { status: 400 });
    }

    // Perform search first (Tavily default)
    const results = await webSearch(query, undefined as any, { siteDomain });
    if (!Array.isArray(results) || results.length === 0) {
      // Explicitly communicate zero-results so UI can show unified failure state
      return NextResponse.json({ error: "NO_RESULTS" }, { status: 204 });
    }
    const citations = results.map((r, i) => ({ index: i + 1, title: r.title, url: r.url }));
    const { header, user } = buildPrompt(query, results);

    const client = getDeepseek();
    const stream = await client.chat.completions.create({
      model: (model as any) || (reasoning ? "deepseek-reasoner" : "deepseek-chat"),
      messages: [
        { role: "system", content: header },
        { role: "user", content: user },
      ] as DSMessage[],
      temperature: 0.2,
      max_tokens: 800,
      stream: true,
    } as any);

    const preview = results.map((r, i) => ({
      index: i + 1,
      title: r.title,
      url: r.url,
      snippet: (r.content || "").slice(0, 240),
    }));
    const searchHeader = JSON.stringify({ count: results.length, results: preview });
    const citationsHeader = JSON.stringify({ citations });
    const encoder = new TextEncoder();
    const rs = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          // Announce search info first
          controller.enqueue(encoder.encode(`__SEARCH__${searchHeader}\n`));
          // Then send citations metadata
          controller.enqueue(encoder.encode(`__META__${citationsHeader}\n`));
          // @ts-ignore OpenAI v5 stream is async iterable
          for await (const chunk of stream) {
            const delta = chunk?.choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          }
        } catch (e) {
          controller.error(e);
          return;
        }
        controller.close();
      },
    });

    return new Response(rs, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    console.error("/api/ai/stream-search error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
