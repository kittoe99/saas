import OpenAI from "openai";

// DeepSeek OpenAI-compatible client
export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export type DSMessage = { role: "system"|"user"|"assistant"; content: string };

const DEFAULT_MODEL: string = process.env.DEEPSEEK_MODEL || "deepseek-chat";

export async function r1Complete(messages: Array<DSMessage>, options?: { temperature?: number; max_tokens?: number }) {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("Missing DEEPSEEK_API_KEY env var");
  }
  const res = await deepseek.chat.completions.create({
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
  const res = await deepseek.chat.completions.create({
    model,
    messages,
    temperature: options?.temperature ?? 0.2,
    max_tokens: options?.max_tokens ?? 1024,
  });
  return res;
}
