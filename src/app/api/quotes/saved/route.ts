import { NextResponse } from "next/server";
import { db, quoteRequests, quoteItems } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session?.userId) {
      return NextResponse.json(
        { savedQuote: null },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // Find the latest saved quote for this user
    const [savedQuote] = await db
      .select()
      .from(quoteRequests)
      .where(
        and(
          eq(quoteRequests.userId, session.userId),
          eq(quoteRequests.status, "saved")
        )
      )
      .orderBy(desc(quoteRequests.id))
      .limit(1);

    if (!savedQuote) {
      return NextResponse.json(
        { savedQuote: null },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // Get items for this saved quote
    const items = await db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteRequestId, savedQuote.id));

    return NextResponse.json(
      {
        savedQuote: {
          ...savedQuote,
          items,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error fetching active saved quote:", error);
    return NextResponse.json({ savedQuote: null }, { status: 500 });
  }
}
