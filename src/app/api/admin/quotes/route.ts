import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import { db, quoteRequests, quoteItems } from "@/lib/db";
import { desc, eq, like, or, and, sql, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (status && status !== "all") {
      conditions.push(eq(quoteRequests.status, status));
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(
          like(quoteRequests.quoteNumber, term),
          like(quoteRequests.customerName, term),
          like(quoteRequests.companyName, term),
          like(quoteRequests.email, term),
          like(quoteRequests.phone, term)
        )!
      );
    }

    const [countRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(quoteRequests)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countRes?.count || 0);

    const rows = await db
      .select()
      .from(quoteRequests)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(quoteRequests.id))
      .limit(limit)
      .offset(offset);

    // Fetch items count and sample items for each quote
    const quoteIds = rows.map((q) => q.id);
    const itemsMap: Record<number, typeof quoteItems.$inferSelect[]> = {};

    if (quoteIds.length > 0) {
      const items = await db
        .select()
        .from(quoteItems)
        .where(inArray(quoteItems.quoteRequestId, quoteIds));

      for (const item of items) {
        if (!itemsMap[item.quoteRequestId]) {
          itemsMap[item.quoteRequestId] = [];
        }
        itemsMap[item.quoteRequestId].push(item);
      }
    }

    const quotesWithItems = rows.map((q) => ({
      ...q,
      items: itemsMap[q.id] || [],
      itemsCount: (itemsMap[q.id] || []).reduce((acc, it) => acc + it.quantity, 0),
    }));

    return NextResponse.json({
      quotes: quotesWithItems,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/quotes:", error);
    return NextResponse.json({ error: "Error al obtener cotizaciones" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "ID de cotización requerido" }, { status: 400 });
    }

    const updateData: { status?: string; notes?: string } = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    await db
      .update(quoteRequests)
      .set(updateData)
      .where(eq(quoteRequests.id, Number(id)));

    return NextResponse.json({ success: true, message: "Cotización actualizada con éxito" });
  } catch (error) {
    console.error("Error in PATCH /api/admin/quotes:", error);
    return NextResponse.json({ error: "Error al actualizar cotización" }, { status: 500 });
  }
}
