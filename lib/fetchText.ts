export async function fetchPageText(url: string, maxChars = 8000): Promise<string> {
  const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; DeepSeek-Integrator/1.0)" } } as RequestInit);
  const ctype = resp.headers.get("content-type") || "";
  if (!resp.ok) throw new Error(`Fetch ${url} failed: ${resp.status}`);
  if (!ctype.includes("text/html") && !ctype.includes("text/plain")) {
    return ""; // skip non-text
  }
  const html = await resp.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, maxChars);
}
