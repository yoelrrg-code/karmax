import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import { db, siteSettings } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSiteSetting } from "@/lib/services/karmaxService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const settings = await getSiteSetting<{ notificationEmail?: string }>(
      "general_settings",
      {}
    );

    const defaultEmail =
      process.env.KARMAX_NOTIFICATION_EMAIL || "dev.paco.lule@gmail.com";
    const notificationEmail = settings?.notificationEmail?.trim() || defaultEmail;

    return NextResponse.json({
      notificationEmail,
      defaultEnvEmail: defaultEmail,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/general-settings:", error);
    return NextResponse.json(
      { error: "Error al obtener la configuración general" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const body = await request.json().catch(() => ({}));
    const { notificationEmail } = body;

    const cleanEmail = String(notificationEmail || "").trim().toLowerCase();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Por favor ingresa un correo electrónico válido." },
        { status: 400 }
      );
    }

    const payload = {
      notificationEmail: cleanEmail,
    };

    const [existing] = await db
      .select({ id: siteSettings.id })
      .from(siteSettings)
      .where(eq(siteSettings.key, "general_settings"))
      .limit(1);

    if (existing) {
      await db
        .update(siteSettings)
        .set({
          value: JSON.stringify(payload),
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.id, existing.id));
    } else {
      await db.insert(siteSettings).values({
        key: "general_settings",
        section: "general",
        label: "Ajustes Generales",
        value: JSON.stringify(payload),
      });
    }

    return NextResponse.json({
      success: true,
      notificationEmail: cleanEmail,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/general-settings:", error);
    return NextResponse.json(
      { error: "Error al guardar la configuración general" },
      { status: 500 }
    );
  }
}
