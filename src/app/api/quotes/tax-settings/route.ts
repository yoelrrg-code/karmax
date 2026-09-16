import { NextResponse } from "next/server";
import { getTaxSettings } from "@/lib/services/karmaxService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const taxSettings = await getTaxSettings();
    return NextResponse.json(taxSettings, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/quotes/tax-settings:", error);
    return NextResponse.json(
      { enabled: true, rate: 16 },
      { status: 500 }
    );
  }
}
