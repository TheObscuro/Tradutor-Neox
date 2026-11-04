import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function GET() {
  const hasKey = typeof process.env.OPENAI_API_KEY === "string" && process.env.OPENAI_API_KEY.startsWith("sk-");
  let modelsOk = false;
  let error: any = null;

  if (hasKey) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      // chamada bem leve só pra validar a key (lista de modelos)
      const list = await openai.models.list();
      modelsOk = Array.isArray(list.data) && list.data.length > 0;
    } catch (e: any) {
      error = { name: e?.name, message: e?.message, status: e?.status };
    }
  }

  return NextResponse.json({ hasKey, modelsOk, error }, { status: 200 });
}
    