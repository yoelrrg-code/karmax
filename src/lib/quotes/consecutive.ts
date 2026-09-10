import { db, quoteRequests } from "@/lib/db";
import { desc } from "drizzle-orm";

/**
 * Calculates the next consecutive quote number from the database.
 * Defaults to 7-digit zero-padded string starting from "0000001".
 */
export async function getNextQuoteNumber(): Promise<string> {
  try {
    const [lastQuote] = await db
      .select({
        id: quoteRequests.id,
        quoteNumber: quoteRequests.quoteNumber,
      })
      .from(quoteRequests)
      .orderBy(desc(quoteRequests.id))
      .limit(1);

    if (!lastQuote) {
      return "0000001";
    }

    let nextSeq = 1;
    const match = lastQuote.quoteNumber?.match(/\d+/);
    if (match) {
      nextSeq = parseInt(match[0], 10) + 1;
    } else if (lastQuote.id) {
      nextSeq = Number(lastQuote.id) + 1;
    }

    return String(nextSeq).padStart(7, "0");
  } catch (error) {
    console.error("Error computing next quote number:", error);
    return "0000001";
  }
}
