import { NextResponse } from "next/server";
import { VOICES } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ voices: VOICES });
}
