import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import { db, siteSettings } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const rows = await db.select().from(siteSettings);
    const settingsMap: Record<string, unknown> = {};

    for (const r of rows) {
      try {
        settingsMap[r.key] = {
          id: r.id,
          key: r.key,
          section: r.section,
          label: r.label,
          value: JSON.parse(r.value),
          updatedAt: r.updatedAt,
        };
      } catch {
        settingsMap[r.key] = {
          id: r.id,
          key: r.key,
          section: r.section,
          label: r.label,
          value: r.value,
          updatedAt: r.updatedAt,
        };
      }
    }

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error("Error in GET /api/admin/sections:", error);
    return NextResponse.json({ error: "Error al obtener secciones del sitio" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const { key, section, label, value } = body;

    if (!key) {
      return NextResponse.json({ error: "La clave (key) de la sección es obligatoria" }, { status: 400 });
    }

    const valueStr = typeof value === "string" ? value : JSON.stringify(value);

    const [existing] = await db
      .select({ id: siteSettings.id })
      .from(siteSettings)
      .where(eq(siteSettings.key, key))
      .limit(1);

    if (existing) {
      await db
        .update(siteSettings)
        .set({
          value: valueStr,
          label: label || undefined,
          section: section || undefined,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.key, key));
    } else {
      await db.insert(siteSettings).values({
        key,
        section: section || "general",
        label: label || key,
        value: valueStr,
      });
    }

    return NextResponse.json({ success: true, message: `Sección "${key}" guardada correctamente` });
  } catch (error) {
    console.error("Error in POST /api/admin/sections:", error);
    return NextResponse.json({ error: "Error al guardar sección" }, { status: 500 });
  }
}
