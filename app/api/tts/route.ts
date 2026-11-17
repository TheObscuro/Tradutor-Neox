import { NextResponse } from "next/server";
import OpenAI from "openai";
import { MAX_TTS_LENGTH, VOICES } from "@/lib/constants";
import { rejectIfRateLimited } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = rejectIfRateLimited(req);
  if (limited) return limited;

  try {
    const { text = "", voice = "alloy" } = await req.json();
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY ausente" }, { status: 500 });
    }
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Texto vazio" }, { status: 400 });
    }
    if (text.length > MAX_TTS_LENGTH) {
      return NextResponse.json({ error: `O texto deve ter no máximo ${MAX_TTS_LENGTH} caracteres` }, { status: 400 });
    }
    if (!VOICES.some((v) => v.id === voice)) {
      return NextResponse.json({ error: "Voz inválida" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const speech = await openai.audio.speech.create({
      model: "tts-1",
      voice,
      input: text,
      response_format: "mp3"
    } as any);

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
