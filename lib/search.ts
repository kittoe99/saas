type SearchResult = {
  title: string;
  url: string;
  content: string;
};

export async function webSearch(query: string, maxResults?: number, opts?: { siteDomain?: string }): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("Missing TAVILY_API_KEY env var");

  // Tavily current docs: POST https://api.tavily.com/search with Bearer auth
  const finalQuery = opts?.siteDomain ? `site:${opts.siteDomain} ${query}` : query;
  const resp = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      api_key: apiKey,
      query: finalQuery,
      search_depth: "advanced",
      // If caller doesn't specify, use a reasonable high default
      max_results: typeof maxResults === "number" ? Math.max(1, Math.floor(maxResults)) : 10,
      include_answer: true,
      include_raw_content: true,
      include_domains: opts?.siteDomain ? [opts.siteDomain] : undefined,
      include_images: false,
    }),
    // 30s timeout via AbortController could be added if needed
  } as RequestInit);

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Tavily error ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  const results: any[] = Array.isArray(data?.results) ? data.results : [];
  return results.map((r) => ({
    title: r.title || "",
    url: r.url || "",
    content: r.raw_content || r.content || r.snippet || "",
  }));
}
