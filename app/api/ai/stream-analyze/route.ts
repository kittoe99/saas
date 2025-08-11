import { NextResponse } from "next/server";
import { dsComplete } from "@/lib/deepseek";
import { deepseek, DSMessage } from "@/lib/deepseek";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text: string = body.text;
    const instructions: string | undefined = body.instructions;
    const model: string | undefined = typeof body.model === "string" ? body.model : undefined;
    const reasoning: boolean = Boolean(body.reasoning);

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Field 'text' is required" }, { status: 400 });
    }

    const sys = instructions
      ? `You are an expert analyst. Follow these instructions strictly to analyze the provided text. Instructions: ${instructions}`
      : "You are an expert analyst. Provide a concise, accurate analysis of the provided text.";

    const stream = await deepseek.chat.completions.create({
      model: (model as any) || (reasoning ? "deepseek-reasoner" : "deepseek-chat"),
      messages: [
        { role: "system", content: sys },
        { role: "user", content: text },
      ] as DSMessage[],
      temperature: 0.2,
      max_tokens: 1024,
      stream: true,
    } as any);

    const encoder = new TextEncoder();
    const rs = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
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
    console.error("/api/ai/stream-analyze error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
