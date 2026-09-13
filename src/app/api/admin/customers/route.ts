import { NextRequest, NextResponse } from "next/server";
import { db, users, roles } from "@/lib/db";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import { eq, desc, sql, like, or } from "drizzle-orm";
import type { AdminCustomerItem } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() || "";

    // Traer todos los usuarios registrados con su rol y conteo de cotizaciones
    const whereConditions = query
      ? or(
          like(users.name, `%${query}%`),
          like(users.email, `%${query}%`),
          like(users.companyName, `%${query}%`),
          like(users.phone, `%${query}%`)
        )
      : undefined;

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        companyName: users.companyName,
        roleId: users.roleId,
        roleName: roles.name,
        isActive: users.isActive,
        discountPercentage: users.discountPercentage,
        createdAt: users.createdAt,
        quotesCount: sql<number>`(SELECT COUNT(*) FROM quote_requests WHERE quote_requests.user_id = users.id)`,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(whereConditions)
      .orderBy(desc(users.createdAt));

    const customers: AdminCustomerItem[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone || null,
      companyName: r.companyName || null,
      roleId: r.roleId,
      roleName: r.roleName || "cliente",
      isActive: Boolean(r.isActive),
      discountPercentage: Number(r.discountPercentage || 0),
      quotesCount: Number(r.quotesCount || 0),
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({
      customers,
      total: customers.length,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/customers:", error);
    return NextResponse.json(
      { error: "Error al consultar los clientes" },
      { status: 500 }
    );
  }
}
