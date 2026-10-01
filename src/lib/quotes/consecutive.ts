import { db, quoteRequests } from "@/lib/db";
import { desc } from "drizzle-orm";

type DbOrTx = typeof db;

/**
 * Calculates the next consecutive quote number from the database.
 * If running inside a transaction, passes lock=true to perform a row lock (FOR UPDATE)
 * preventing concurrent race conditions between simultaneous quote creations.
 * Defaults to 7-digit zero-padded string starting from "0000001".
 */
export async function getNextQuoteNumber(
  runner: DbOrTx = db,
  lock: boolean = false
): Promise<string> {
  try {
    const baseQuery = runner
      .select({
        id: quoteRequests.id,
        quoteNumber: quoteRequests.quoteNumber,
      })
      .from(quoteRequests)
      .orderBy(desc(quoteRequests.id))
      .limit(1);

    const [lastQuote] = lock ? await baseQuery.for("update") : await baseQuery;

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
