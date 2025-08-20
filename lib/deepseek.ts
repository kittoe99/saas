import OpenAI from "openai";

// Lazy DeepSeek OpenAI-compatible client to avoid build-time env requirement
let _deepseek: OpenAI | null = null;
export function getDeepseek(): OpenAI {
  if (_deepseek) return _deepseek;
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    // Do not construct the client without a key; callers should gate usage by checking env
    throw new Error("Missing DEEPSEEK_API_KEY env var");
  }
  _deepseek = new OpenAI({ apiKey: key, baseURL: "https://api.deepseek.com" });
  return _deepseek;
}

export type DSMessage = { role: "system"|"user"|"assistant"; content: string };

const DEFAULT_MODEL: string = process.env.DEEPSEEK_MODEL || "deepseek-chat";

export async function r1Complete(messages: Array<DSMessage>, options?: { temperature?: number; max_tokens?: number }) {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("Missing DEEPSEEK_API_KEY env var");
  }
  const client = getDeepseek();
  const res = await client.chat.completions.create({
    model: "deepseek-reasoner",
    messages,
    temperature: options?.temperature ?? 0.2,
    max_tokens: options?.max_tokens ?? 1024,
  });
  return res;
}

// Generic completion that allows selecting the model (e.g., deepseek-chat or deepseek-reasoner)
export async function dsComplete(
  messages: Array<DSMessage>,
  options?: { temperature?: number; max_tokens?: number; model?: string; reasoning?: boolean }
) {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("Missing DEEPSEEK_API_KEY env var");
  }
  const model: string = (options?.model as string | undefined)
    || (options?.reasoning ? "deepseek-reasoner" : undefined)
    || DEFAULT_MODEL;
  const client = getDeepseek();
  const res = await client.chat.completions.create({
    model,
    messages,
    temperature: options?.temperature ?? 0.2,
    max_tokens: options?.max_tokens ?? 1024,
  });
  return res;
}
