import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { text = "", voice = "alloy" } = await req.json();
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY ausente" }, { status: 500 });
    }
    if (!text.trim()) {
      return NextResponse.json({ error: "Texto vazio" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const speech = await openai.audio.speech.create(
      {
        model: "tts-1",
        voice,        // alloy | echo | fable | onyx | nova | shimmer
        input: text,  // <-- já vem traduzido do frontend
        format: "mp3"
      } as any
    );

    const buff = Buffer.from(await speech.arrayBuffer());
    return new NextResponse(buff, {
      status: 200,
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" }
    });
  } catch (err: any) {
    console.error("TTS error:", err?.message);
    return NextResponse.json({ error: "Falha ao gerar áudio" }, { status: 500 });
  }
}
