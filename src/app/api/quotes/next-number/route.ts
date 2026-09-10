import { NextResponse } from "next/server";
import { getNextQuoteNumber } from "@/lib/quotes/consecutive";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const nextQuoteNumber = await getNextQuoteNumber();
    return NextResponse.json(
      { nextQuoteNumber },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching next quote number:", error);
    return NextResponse.json(
      { nextQuoteNumber: "0000001" },
      { status: 500 }
    );
  }
}
