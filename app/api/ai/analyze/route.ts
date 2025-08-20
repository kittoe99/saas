import { NextResponse } from "next/server";
import { dsComplete, r1Complete } from "@/lib/deepseek";

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

    const res = await dsComplete(
      [
        { role: "system", content: sys },
        { role: "user", content: text },
      ],
      { temperature: 0.2, max_tokens: 1024, model, reasoning }
    );

    const content = res.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({
      ok: true,
      output: content,
      usage: res.usage,
    });
  } catch (err: any) {
    console.error("/api/ai/analyze error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
