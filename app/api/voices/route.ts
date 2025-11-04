import { NextResponse } from "next/server";
export const runtime = "nodejs";
const AVAILABLE_VOICES = [
  { id: "alloy", label: "Alloy", note: "Clara e natural" },
  { id: "echo", label: "Echo", note: "Quente, conversacional" },
  { id: "fable", label: "Fable", note: "Narrativa, leve" },
  { id: "onyx", label: "Onyx", note: "Grave, marcante" },
  { id: "nova", label: "Nova", note: "Brilhante, expressiva" },
  { id: "shimmer", label: "Shimmer", note: "Suave, moderna" }
];
export async function GET() {
  return NextResponse.json({ voices: AVAILABLE_VOICES });
}
