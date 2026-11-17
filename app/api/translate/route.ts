import { NextResponse } from "next/server";
import OpenAI from "openai";
import { LANGUAGES, MAX_PERSONALITY_LENGTH, MAX_TEXT_LENGTH } from "@/lib/constants";
import { rejectIfRateLimited } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = rejectIfRateLimited(req);
  if (limited) return limited;

  try {
    const { text = "", targetLanguage = "", personality = "" } = await req.json();
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY ausente" }, { status: 500 });
    }
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Texto vazio" }, { status: 400 });
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json({ error: `O texto deve ter no máximo ${MAX_TEXT_LENGTH} caracteres` }, { status: 400 });
    }
    if (!LANGUAGES.includes(targetLanguage)) {
      return NextResponse.json({ error: "Idioma de destino não suportado" }, { status: 400 });
    }
    if (typeof personality !== "string" || personality.length > MAX_PERSONALITY_LENGTH) {
      return NextResponse.json(
        { error: `A personalidade deve ter no máximo ${MAX_PERSONALITY_LENGTH} caracteres` },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const style = personality.trim()
      ? `\nAdapte o tom e o estilo da tradução a esta personalidade: "${personality.trim()}", sem alterar o sentido do texto.`
      : "";
    const sys = `Você é um tradutor profissional. Traduza o texto do usuário para ${targetLanguage}.${style}
Responda APENAS com o texto traduzido, sem aspas nem explicações.`;

    const tr = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 1200,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: text }
      ]
    });

    const translated = tr.choices?.[0]?.message?.content?.trim() || text;
    return NextResponse.json({ translated });
  } catch (e: any) {
    console.error("Translate error:", e?.message);
    return NextResponse.json({ error: "Falha na tradução" }, { status: 500 });
  }
}
