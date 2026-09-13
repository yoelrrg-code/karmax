import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import { db, categories, products } from "@/lib/db";
import { asc, eq, sql } from "drizzle-orm";

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

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        imageUrl: categories.imageUrl,
        featured: categories.featured,
        orderIndex: categories.orderIndex,
        isActive: categories.isActive,
        createdAt: categories.createdAt,
      })
      .from(categories)
      .orderBy(asc(categories.orderIndex), asc(categories.name));

    // Get product count per category
    const countRows = await db
      .select({
        categoryId: products.categoryId,
        count: sql<number>`count(*)`,
      })
      .from(products)
      .groupBy(products.categoryId);

    const countMap: Record<number, number> = {};
    for (const c of countRows) {
      countMap[c.categoryId] = Number(c.count);
    }

    const categoriesWithCount = rows.map((cat) => ({
      ...cat,
      productsCount: countMap[cat.id] || 0,
    }));

    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error("Error in GET /api/admin/categories:", error);
    return NextResponse.json({ error: "Error al obtener categorías" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const { name, slug: customSlug, description, imageUrl, featured = false, orderIndex = 0, isActive = true } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "El nombre de la categoría es obligatorio" }, { status: 400 });
    }

    let finalSlug = slugify(customSlug?.trim() || name.trim());
    const [existing] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, finalSlug))
      .limit(1);

    if (existing) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    const [res] = await db.insert(categories).values({
      name: name.trim(),
      slug: finalSlug,
      description: description || null,
      imageUrl: imageUrl || null,
      featured: Boolean(featured),
      orderIndex: Number(orderIndex) || 0,
      isActive: Boolean(isActive),
    });

    return NextResponse.json({
      success: true,
      categoryId: Number(res.insertId),
      message: "Categoría creada con éxito",
    });
  } catch (error) {
    console.error("Error in POST /api/admin/categories:", error);
    return NextResponse.json({ error: "Error al crear la categoría" }, { status: 500 });
  }
}
