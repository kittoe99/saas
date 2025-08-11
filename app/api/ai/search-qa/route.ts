import { NextResponse } from "next/server";
import { webSearch } from "@/lib/search";
import { deepseek, dsComplete, r1Complete } from "@/lib/deepseek";
import { fetchPageText } from "@/lib/fetchText";

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
    const topK: number = Math.min(Math.max(Number(body.topK ?? 5), 1), 8);
    const siteDomain: string | undefined = typeof body.site === "string" && body.site.trim() ? String(body.site).trim() : undefined;
    const provider = (process.env.SEARCH_PROVIDER || "tavily").toLowerCase();
    const model: string | undefined = typeof body.model === "string" ? body.model : undefined;
    const reasoning: boolean = Boolean(body.reasoning);

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Field 'query' is required" }, { status: 400 });
    }

    if (provider === "deepseek") {
      // Tool-calling flow: let DeepSeek Reasoner orchestrate search and fetch
      const messages: any[] = [
        {
          role: "system",
          content:
            "You are a research assistant. Use the provided tools to search the web and fetch pages as needed. When answering, cite sources inline as [n] matching the provided tool results, and include a References list at the end.",
        },
        { role: "user", content: query },
      ];

      const tools = [
        {
          type: "function",
          function: {
            name: "search_web",
            description: "Search the web for relevant pages about the query and return top results",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string", description: "Search query" },
                top_k: { type: "integer", minimum: 1, maximum: 8, default: topK },
                site_domain: { type: "string", description: "Optional domain to restrict results (e.g., example.com)" },
              },
              required: ["query"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "fetch_url",
            description: "Fetch and extract readable text from a given URL",
            parameters: {
              type: "object",
              properties: {
                url: { type: "string" },
                max_chars: { type: "integer", minimum: 1000, maximum: 20000, default: 8000 },
              },
              required: ["url"],
            },
          },
        },
      ];

      let toolIterations = 0;
      const maxToolIterations = 5;
      let finalContent = "";
      let citations: Array<{ index: number; title: string; url: string }> = [];
      let lastResults: Array<{ title: string; url: string; content: string }> = [];

      while (toolIterations < maxToolIterations) {
        const response = await deepseek.chat.completions.create({
          model: (model as any) || (reasoning ? "deepseek-reasoner" : "deepseek-chat"),
          messages,
          tools,
          temperature: 0.2,
          max_tokens: 1200,
        } as any);

        const choice = response.choices?.[0];
        const toolCalls = (choice as any)?.message?.tool_calls;
        const content = (choice as any)?.message?.content as string | undefined;

        if (toolCalls && toolCalls.length > 0) {
          // Execute tool calls sequentially and push tool results back
          for (const call of toolCalls) {
            const fn = call.function?.name;
            const args = call.function?.arguments ? JSON.parse(call.function.arguments) : {};

            if (fn === "search_web") {
              const q = String(args.query || query);
              const k = Number.isFinite(args.top_k) ? Math.max(1, Math.min(8, Number(args.top_k))) : topK;
              const sd = typeof args.site_domain === "string" && args.site_domain.trim() ? String(args.site_domain).trim() : undefined;
              const results = await webSearch(q, k, { siteDomain: sd });
              lastResults = results;
              citations = results.map((r, i) => ({ index: i + 1, title: r.title, url: r.url }));
              messages.push({
                role: "tool",
                tool_call_id: call.id,
                content: JSON.stringify({
                  results: results.map((r, i) => ({ index: i + 1, title: r.title, url: r.url, snippet: r.content })),
                }),
              });
            } else if (fn === "fetch_url") {
              const url = String(args.url || "");
              const maxChars = Number.isFinite(args.max_chars) ? Number(args.max_chars) : 8000;
              const text = url ? await fetchPageText(url, maxChars) : "";
              messages.push({
                role: "tool",
                tool_call_id: call.id,
                content: JSON.stringify({ url, text: text.slice(0, maxChars) }),
              });
            } else {
              messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify({ error: "unknown tool" }) });
            }
          }
          toolIterations++;
          continue; // loop again to let the model use the tool outputs
        }

        // No tool calls; take final content
        finalContent = content || "";
        break;
      }

      return NextResponse.json({ ok: true, answer: finalContent, citations, provider: "deepseek-tools" });
    } else {
      // Default: Tavily-based web search + R1 answer
      const results = await webSearch(query, topK, { siteDomain });
      const { header, user } = buildPrompt(query, results);

      const res = await dsComplete([
        { role: "system", content: header },
        { role: "user", content: user },
      ], { temperature: 0.2, max_tokens: 1200, model, reasoning });

      const content = res.choices?.[0]?.message?.content ?? "";
      const citations = results.map((r, i) => ({ index: i + 1, title: r.title, url: r.url }));
      return NextResponse.json({ ok: true, answer: content, citations, provider: "tavily" });
    }
  } catch (err: any) {
    console.error("/api/ai/search-qa error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
