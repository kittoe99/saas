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

  // Prefer higher recall for onboarding; even for site-specific queries use advanced
  const hasDomain = Boolean(opts?.siteDomain);
  const effectiveMax = typeof maxResults === "number" ? Math.max(1, Math.floor(maxResults)) : (hasDomain ? 8 : 10);
  const includeRaw = true;

  async function runOnce(params: { q: string; includeDomains?: string[] }): Promise<SearchResult[]> {
    // Extend timeout to 20s and retry once on abort/429
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    const resp = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: params.q,
        search_depth: "advanced",
        max_results: effectiveMax,
        include_answer: true,
        include_raw_content: includeRaw,
        include_domains: params.includeDomains,
        include_images: false,
      }),
      signal: controller.signal,
    } as RequestInit).finally(() => clearTimeout(timeout));

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      // surface status for caller
      throw new Error(`Tavily error ${resp.status}: ${text}`);
    }
    const data = await resp.json();
    const raw: any[] = Array.isArray(data?.results) ? data.results : [];
    return raw.map((r) => ({
      title: r.title || "",
      url: r.url || "",
      content: r.raw_content || r.content || r.snippet || "",
    }));
  }

  // Build include_domains variants when a domain is provided
  const includeDomains = hasDomain && opts?.siteDomain
    ? Array.from(new Set([opts.siteDomain, `www.${opts.siteDomain.replace(/^www\./, "")}`]))
    : undefined;

  // Attempt 1: site-qualified query with include_domains variants
  try {
    const res1 = await runOnce({ q: finalQuery, includeDomains });
    if (res1.length > 0) return res1;
    // Attempt 2: remove include_domains but keep site: qualifier
    const res2 = await runOnce({ q: finalQuery });
    return res2;
  } catch (err: any) {
    // Retry once for abort or 429
    const m = String(err?.message || "");
    if (/aborted|AbortError|\b429\b/i.test(m)) {
      try {
        const resRetry = await runOnce({ q: finalQuery, includeDomains });
        if (resRetry.length > 0) return resRetry;
        const resRetry2 = await runOnce({ q: finalQuery });
        return resRetry2;
      } catch (e) {
        throw e;
      }
    }
    throw err;
  }
}
