import { NextRequest, NextResponse } from "next/server";
import { db, contactMessages } from "@/lib/db";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import { desc, eq, and, or, like, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "15", 10)));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (status && status !== "all") {
      conditions.push(eq(contactMessages.status, status));
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(
          like(contactMessages.fullName, term),
          like(contactMessages.company, term),
          like(contactMessages.email, term),
          like(contactMessages.phone, term),
          like(contactMessages.message, term)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Total filtered count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contactMessages)
      .where(whereClause);

    const total = Number(countResult?.count || 0);
    const totalPages = Math.ceil(total / limit);

    // Unread count (global)
    const [unreadResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contactMessages)
      .where(eq(contactMessages.status, "unread"));

    const unreadCount = Number(unreadResult?.count || 0);

    // List messages
    const rows = await db
      .select()
      .from(contactMessages)
      .where(whereClause)
      .orderBy(desc(contactMessages.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      messages: rows.map((m) => ({
        id: m.id,
        fullName: m.fullName,
        company: m.company,
        phone: m.phone,
        email: m.email,
        message: m.message,
        status: m.status,
        ipAddress: m.ipAddress,
        createdAt: m.createdAt.toISOString(),
      })),
      total,
      page,
      totalPages,
      unreadCount,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/contact-messages:", error);
    return NextResponse.json(
      { error: "Error al obtener mensajes de contacto" },
      { status: 500 }
    );
  }
}
