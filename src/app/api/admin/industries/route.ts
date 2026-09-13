import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import { db, industries, productIndustries } from "@/lib/db";
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
        id: industries.id,
        name: industries.name,
        slug: industries.slug,
        description: industries.description,
        iconName: industries.iconName,
        iconUrl: industries.iconUrl,
        orderIndex: industries.orderIndex,
        isActive: industries.isActive,
      })
      .from(industries)
      .orderBy(asc(industries.orderIndex), asc(industries.name));

    // Get products count per industry
    const countRows = await db
      .select({
        industryId: productIndustries.industryId,
        count: sql<number>`count(*)`,
      })
      .from(productIndustries)
      .groupBy(productIndustries.industryId);

    const countMap: Record<number, number> = {};
    for (const c of countRows) {
      countMap[c.industryId] = Number(c.count);
    }

    const industriesWithCount = rows.map((ind) => ({
      ...ind,
      productsCount: countMap[ind.id] || 0,
    }));

    return NextResponse.json({ industries: industriesWithCount });
  } catch (error) {
    console.error("Error in GET /api/admin/industries:", error);
    return NextResponse.json({ error: "Error al obtener industrias" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const { name, slug: customSlug, description, iconName = "Building2", iconUrl, orderIndex = 0, isActive = true } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "El nombre de la industria es obligatorio" }, { status: 400 });
    }

    let finalSlug = slugify(customSlug?.trim() || name.trim());
    const [existing] = await db
      .select({ id: industries.id })
      .from(industries)
      .where(eq(industries.slug, finalSlug))
      .limit(1);

    if (existing) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    const [res] = await db.insert(industries).values({
      name: name.trim(),
      slug: finalSlug,
      description: description || "Soluciones para el sector",
      iconName: iconName || "Building2",
      iconUrl: iconUrl || null,
      orderIndex: Number(orderIndex) || 0,
      isActive: Boolean(isActive),
    });

    return NextResponse.json({
      success: true,
      industryId: Number(res.insertId),
      message: "Industria creada con éxito",
    });
  } catch (error) {
    console.error("Error in POST /api/admin/industries:", error);
    return NextResponse.json({ error: "Error al crear industria" }, { status: 500 });
  }
}
