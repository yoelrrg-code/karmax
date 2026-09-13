import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import { db, categories, products } from "@/lib/db";
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
    const catId = Number(id);

    if (isNaN(catId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const { name, slug: customSlug, description, imageUrl, featured, orderIndex, isActive } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const finalSlug = customSlug?.trim() ? slugify(customSlug.trim()) : slugify(name.trim());

    await db
      .update(categories)
      .set({
        name: name.trim(),
        slug: finalSlug,
        description: description !== undefined ? description : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        featured: featured !== undefined ? Boolean(featured) : undefined,
        orderIndex: orderIndex !== undefined ? Number(orderIndex) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      })
      .where(eq(categories.id, catId));

    return NextResponse.json({ success: true, message: "Categoría actualizada con éxito" });
  } catch (error) {
    console.error("Error in PUT /api/admin/categories/[id]:", error);
    return NextResponse.json({ error: "Error al actualizar categoría" }, { status: 500 });
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
    const catId = Number(id);

    if (isNaN(catId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Check if category has products
    const [countRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.categoryId, catId));

    const prodCount = Number(countRes?.count || 0);
    if (prodCount > 0) {
      // Soft deactivate instead of hard delete
      await db
        .update(categories)
        .set({ isActive: false })
        .where(eq(categories.id, catId));
      return NextResponse.json({
        success: true,
        message: `Categoría desactivada porque contiene ${prodCount} productos asociados.`,
      });
    }

    await db.delete(categories).where(eq(categories.id, catId));
    return NextResponse.json({ success: true, message: "Categoría eliminada con éxito" });
  } catch (error) {
    console.error("Error in DELETE /api/admin/categories/[id]:", error);
    return NextResponse.json({ error: "Error al eliminar categoría" }, { status: 500 });
  }
}
