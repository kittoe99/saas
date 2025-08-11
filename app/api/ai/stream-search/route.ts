import { NextResponse } from "next/server";
import { webSearch } from "@/lib/search";
import { deepseek, DSMessage } from "@/lib/deepseek";

export const runtime = "nodejs";

function buildPrompt(query: string, sources: Array<{ title: string; url: string; content: string }>) {
  const header = `You are a helpful research assistant. Answer the user query using the sources below. Cite sources inline as [n] and provide a references list at the end.`;
  const sourceBlocks = sources
    .map((s, i) => `Source [${i + 1}] ${s.title}\nURL: ${s.url}\nContent: ${s.content}`)
    .join("\n\n");
  const user = `Query: ${query}\n\nSources:\n${sourceBlocks}`;
  return { header, user };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const query: string = body.query;
    const siteDomain: string | undefined = typeof body.site === "string" && body.site.trim() ? String(body.site).trim() : undefined;
    const model: string | undefined = typeof body.model === "string" ? body.model : undefined;
    const reasoning: boolean = Boolean(body.reasoning);

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Field 'query' is required" }, { status: 400 });
    }

    // Perform search first (Tavily default)
    const results = await webSearch(query, undefined as any, { siteDomain });
    const citations = results.map((r, i) => ({ index: i + 1, title: r.title, url: r.url }));
    const { header, user } = buildPrompt(query, results);

    const stream = await deepseek.chat.completions.create({
      model: (model as any) || (reasoning ? "deepseek-reasoner" : "deepseek-chat"),
      messages: [
        { role: "system", content: header },
        { role: "user", content: user },
      ] as DSMessage[],
      temperature: 0.2,
      max_tokens: 1200,
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
