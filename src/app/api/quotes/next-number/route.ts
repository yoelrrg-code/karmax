import { NextResponse } from "next/server";
import { getNextQuoteNumber } from "@/lib/quotes/consecutive";
import { getTaxSettings } from "@/lib/services/karmaxService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [nextQuoteNumber, taxSettings] = await Promise.all([
      getNextQuoteNumber(),
      getTaxSettings(),
    ]);

    return NextResponse.json(
      { nextQuoteNumber, taxSettings },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching next quote number or tax settings:", error);
    return NextResponse.json(
      { nextQuoteNumber: "0000001", taxSettings: { enabled: true, rate: 16 } },
      { status: 500 }
    );
  }
}
