import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/lib/db";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  try {
    const { id } = await params;
    const userId = Number(id);
    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: "ID de cliente inválido" }, { status: 400 });
    }

    const body = await request.json();
    const { discountPercentage, isActive } = body;

    const updateData: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (discountPercentage !== undefined) {
      const pct = Number(discountPercentage);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        return NextResponse.json(
          { error: "El porcentaje de descuento debe ser un valor entre 0 y 100" },
          { status: 400 }
        );
      }
      updateData.discountPercentage = pct.toFixed(2);
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    await db.update(users).set(updateData).where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: "Cliente actualizado exitosamente",
      userId,
      discountPercentage: updateData.discountPercentage !== undefined ? Number(updateData.discountPercentage) : undefined,
    });
  } catch (error) {
    console.error("Error in PUT /api/admin/customers/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar los datos del cliente" },
      { status: 500 }
    );
  }
}
