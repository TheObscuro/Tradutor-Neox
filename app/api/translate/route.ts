import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { text = "", targetLanguage = "" } = await req.json();
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY ausente" }, { status: 500 });
    }
    if (!text.trim() || !targetLanguage.trim()) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const sys = `Você é um tradutor profissional. Traduza o texto do usuário para ${targetLanguage}.
Responda APENAS com o texto traduzido, sem aspas nem explicações.`;
    const tr = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 400,
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
