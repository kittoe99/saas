import { NextResponse } from "next/server";
import { dsComplete, type DSMessage } from "@/lib/deepseek";

export const runtime = "edge";

function json(data: unknown, init?: number | ResponseInit) {
  return NextResponse.json(data, init as any);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action: string = body?.action;
    const name: string | undefined = body?.name;
    const description: string | undefined = body?.description;
    const purposes: string[] | undefined = body?.purposes;

    if (!process.env.DEEPSEEK_API_KEY) {
      return json({ error: "Missing DEEPSEEK_API_KEY. Add it to .env.local" }, { status: 400 });
    }

    if (!action) {
      return json({ error: "Missing action" }, { status: 400 });
    }

    const baseContext = `You are helping a user create a website. Today is ${new Date().toISOString().slice(0,10)}. Purposes allowed: Small business, Ecommerce, Portfolio, Blog, SaaS, Community, Education, Nonprofit, Personal brand, Landing page, Documentation, Event.`;

    let messages: DSMessage[] = [
      { role: "system", content: `${baseContext} Respond in compact JSON only.` },
    ];

    if (action === "suggest_purposes") {
      messages.push({
        role: "user",
        content: `Website name: ${name ?? ""}\nDescription: ${description ?? ""}\nTask: Suggest the top 3-6 relevant purposes (from the allowed set). Return {"suggestedPurposes": string[]}.`
      });
      const res = await dsComplete(messages, { temperature: 0.3, max_tokens: 300 });
      const text = res.choices?.[0]?.message?.content || "{}";
      return json(JSON.parse(safeJson(text, '{"suggestedPurposes": []}')));
    }

    if (action === "generate_description") {
      messages.push({
        role: "user",
        content: `Website name: ${name ?? ""}\nSelected purposes: ${(purposes ?? []).join(", ")}\nExisting description: ${description ?? ""}\nTask: Write a clear, engaging 2-3 sentence website description. Return {"description": string}.`
      });
      const res = await dsComplete(messages, { temperature: 0.6, max_tokens: 280 });
      const text = res.choices?.[0]?.message?.content || "{}";
      return json(JSON.parse(safeJson(text, '{"description": ""}')));
    }

    if (action === "expand_purposes") {
      messages.push({
        role: "user",
        content: `Website name: ${name ?? ""}\nPurposes: ${(purposes ?? []).join(", ")}\nTask: For each purpose, provide 2-4 bullet points describing focus, target audience, and key features. Return {"details": Record<string,string[]>}.`
      });
      const res = await dsComplete(messages, { temperature: 0.5, max_tokens: 500 });
      const text = res.choices?.[0]?.message?.content || "{}";
      return json(JSON.parse(safeJson(text, '{"details": {}}')));
    }

    return json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (e: any) {
    console.error("/api/onboarding/ai error", e);
    return json({ error: e?.message ?? "Unexpected error" }, { status: 500 });
  }
}

function safeJson(input: string, fallback: string): string {
  try {
    const trimmed = input.trim();
    // Some models wrap JSON in code fences; strip them.
    const cleaned = trimmed.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    return fallback;
  }
}
