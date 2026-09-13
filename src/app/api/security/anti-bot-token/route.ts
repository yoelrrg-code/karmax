import { NextResponse } from "next/server";
import { generateAntiBotToken } from "@/lib/security/antiBot";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = generateAntiBotToken();
  return NextResponse.json(
    { token },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
