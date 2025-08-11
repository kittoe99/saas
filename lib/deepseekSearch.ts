import { webSearch } from "@/lib/search";
import { dsComplete, type DSMessage } from "@/lib/deepseek";

export type SiteIntel = {
  summary: string;
  details?: {
    name?: string;
    tagline?: string;
    industries?: string[];
    offerings?: string[];
    audience?: string[];
    locations?: string[];
    contact?: { email?: string; phone?: string };
    socialLinks?: string[];
  };
  about?: string;
  purpose?: string;
  services?: string[];
};

function domainFromUrl(input: string): string | null {
  try {
    const u = new URL(/^https?:\/\//.test(input) ? input : `https://${input}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function buildContext(results: { title: string; url: string; content: string }[]): string {
  return results
    .slice(0, 10)
    .map((r, i) => `#${i + 1} ${r.title}\n${r.url}\n${r.content?.slice(0, 3000)}`)
    .join("\n\n");
}

export async function deepseekSiteIntel(targetUrl: string): Promise<SiteIntel | null> {
  if (!process.env.DEEPSEEK_API_KEY) throw new Error("Missing DEEPSEEK_API_KEY env var");
  if (!process.env.TAVILY_API_KEY) throw new Error("Missing TAVILY_API_KEY env var");

  const domain = domainFromUrl(targetUrl);
  if (!domain) return null;

  // Tavily: broader site-scoped queries
  const [about, services, contact, blog] = await Promise.all([
    webSearch("about company overview mission", 8, { siteDomain: domain }),
    webSearch("services products pricing offerings", 8, { siteDomain: domain }),
    webSearch("contact locations team", 6, { siteDomain: domain }),
    webSearch("blog news updates case studies", 6, { siteDomain: domain }),
  ]);
  const docs = [...about, ...services, ...contact, ...blog].filter((d) => d?.content);
  if (!docs.length) return null;

  const context = buildContext(docs);
  const startUrl = /^https?:\/\//.test(targetUrl) ? targetUrl : `https://${targetUrl}`;

  const messages: DSMessage[] = [
    {
      role: "system",
      content: `You extract accurate website information STRICTLY from provided content. Produce a concise narrative summary (3-6 sentences) suitable for onboarding, plus structured details when available. Do not invent facts. Respond ONLY valid JSON with keys: {"summary": string, "details": {"name"?: string, "tagline"?: string, "industries"?: string[], "offerings"?: string[], "audience"?: string[], "locations"?: string[], "contact"?: {"email"?: string, "phone"?: string}, "socialLinks"?: string[]}, "about"?: string, "purpose"?: string, "services"?: string[]}`,
    },
    {
      role: "user",
      content: `Website: ${startUrl}\nTask: Extract clear information about this site for onboarding. Identify name, what it does, key offerings/services, audiences, locations, and contact if present.\n\nCollected content (from Tavily, site-scoped):\n\n${context}`,
    },
  ];

  const res = await dsComplete(messages, { temperature: 0.1, max_tokens: 700, reasoning: true });
  const text = res.choices?.[0]?.message?.content || "{}";
  const cleaned = safeJson(text, '{"summary":"","details":{},"about":"","purpose":"","services":[]}');
  return JSON.parse(cleaned) as SiteIntel;
}

function safeJson(input: string, fallback: string): string {
  try {
    const trimmed = input.trim();
    const cleaned = trimmed.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    return fallback;
  }
}
