import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import { db, industries, productIndustries } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const indId = Number(id);

    if (isNaN(indId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const { name, slug: customSlug, description, iconName, iconUrl, orderIndex, isActive } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const finalSlug = customSlug?.trim() ? slugify(customSlug.trim()) : slugify(name.trim());

    await db
      .update(industries)
      .set({
        name: name.trim(),
        slug: finalSlug,
        description: description !== undefined ? description : undefined,
        iconName: iconName !== undefined ? iconName : undefined,
        iconUrl: iconUrl !== undefined ? iconUrl : undefined,
        orderIndex: orderIndex !== undefined ? Number(orderIndex) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      })
      .where(eq(industries.id, indId));

    return NextResponse.json({ success: true, message: "Industria actualizada con éxito" });
  } catch (error) {
    console.error("Error in PUT /api/admin/industries/[id]:", error);
    return NextResponse.json({ error: "Error al actualizar industria" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const indId = Number(id);

    if (isNaN(indId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Check if industry has products
    const [countRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(productIndustries)
      .where(eq(productIndustries.industryId, indId));

    const prodCount = Number(countRes?.count || 0);
    if (prodCount > 0) {
      await db
        .update(industries)
        .set({ isActive: false })
        .where(eq(industries.id, indId));
      return NextResponse.json({
        success: true,
        message: `Industria desactivada porque tiene ${prodCount} productos asociados.`,
      });
    }

    await db.delete(industries).where(eq(industries.id, indId));
    return NextResponse.json({ success: true, message: "Industria eliminada con éxito" });
  } catch (error) {
    console.error("Error in DELETE /api/admin/industries/[id]:", error);
    return NextResponse.json({ error: "Error al eliminar industria" }, { status: 500 });
  }
}
