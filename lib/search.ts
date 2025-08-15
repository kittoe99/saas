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

  // Lighter defaults when a specific domain is provided
  const useBasicDepth = Boolean(opts?.siteDomain);
  const effectiveMax = typeof maxResults === "number" ? Math.max(1, Math.floor(maxResults)) : (useBasicDepth ? 3 : 10);
  const includeRaw = useBasicDepth ? false : true;

  // Add a 10s timeout to avoid hanging on slow searches
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  const resp = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      api_key: apiKey,
      query: finalQuery,
      search_depth: useBasicDepth ? "basic" : "advanced",
      // If caller doesn't specify, use a reasonable default
      max_results: effectiveMax,
      include_answer: true,
      include_raw_content: includeRaw,
      include_domains: opts?.siteDomain ? [opts.siteDomain] : undefined,
      include_images: false,
    }),
    signal: controller.signal,
    // 10s timeout via AbortController above
  } as RequestInit).finally(() => clearTimeout(timeout));

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
