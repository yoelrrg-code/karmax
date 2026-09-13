import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import { db, quoteRequests, quoteItems, users } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const quoteId = Number(id);

    if (isNaN(quoteId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const [quote] = await db
      .select()
      .from(quoteRequests)
      .where(eq(quoteRequests.id, quoteId))
      .limit(1);

    if (!quote) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
    }

    const items = await db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteRequestId, quoteId));

    let userDetails = null;
    if (quote.userId) {
      const [u] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          companyName: users.companyName,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, quote.userId))
        .limit(1);
      userDetails = u || null;
    }

    return NextResponse.json({
      quote,
      items,
      user: userDetails,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/quotes/[id]:", error);
    return NextResponse.json({ error: "Error al obtener la cotización" }, { status: 500 });
  }
}
