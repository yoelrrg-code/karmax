import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import { db, siteSettings } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSiteSetting, getSeoSettings } from "@/lib/services/karmaxService";
import type { SeoSettings } from "@/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const [settings, seoSettings] = await Promise.all([
      getSiteSetting<{ notificationEmail?: string }>("general_settings", {}),
      getSeoSettings(),
    ]);

    const defaultEmail =
      process.env.KARMAX_NOTIFICATION_EMAIL || "dev.paco.lule@gmail.com";
    const notificationEmail = settings?.notificationEmail?.trim() || defaultEmail;

    return NextResponse.json({
      notificationEmail,
      defaultEnvEmail: defaultEmail,
      seoSettings,
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
    const { notificationEmail, seoSettings } = body;

    // 1. Si enviaron actualización de correo de notificaciones
    if (notificationEmail !== undefined) {
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
    }

    // 2. Si enviaron actualización de ajustes de SEO globales
    if (seoSettings && typeof seoSettings === "object") {
      const currentSeo = await getSeoSettings();
      const updatedSeo: SeoSettings = {
        siteUrl: String(seoSettings.siteUrl ?? currentSeo.siteUrl).trim(),
        metaTitleDefault: String(seoSettings.metaTitleDefault ?? currentSeo.metaTitleDefault).trim(),
        metaDescriptionDefault: String(seoSettings.metaDescriptionDefault ?? currentSeo.metaDescriptionDefault).trim(),
        metaKeywordsDefault: String(seoSettings.metaKeywordsDefault ?? currentSeo.metaKeywordsDefault).trim(),
        ogImageUrlDefault: String(seoSettings.ogImageUrlDefault ?? currentSeo.ogImageUrlDefault).trim(),
        companyName: String(seoSettings.companyName ?? currentSeo.companyName).trim(),
        telephone: String(seoSettings.telephone ?? currentSeo.telephone).trim(),
        address: String(seoSettings.address ?? currentSeo.address).trim(),
      };

      const [existingSeo] = await db
        .select({ id: siteSettings.id })
        .from(siteSettings)
        .where(eq(siteSettings.key, "seo_settings"))
        .limit(1);

      if (existingSeo) {
        await db
          .update(siteSettings)
          .set({
            value: JSON.stringify(updatedSeo),
            updatedAt: new Date(),
          })
          .where(eq(siteSettings.id, existingSeo.id));
      } else {
        await db.insert(siteSettings).values({
          key: "seo_settings",
          section: "seo",
          label: "Ajustes SEO Globales",
          value: JSON.stringify(updatedSeo),
        });
      }
    }

    const refreshedSeo = await getSeoSettings();
    return NextResponse.json({
      success: true,
      notificationEmail: notificationEmail ? String(notificationEmail).trim().toLowerCase() : undefined,
      seoSettings: refreshedSeo,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/general-settings:", error);
    return NextResponse.json(
      { error: "Error al guardar la configuración general y de SEO" },
      { status: 500 }
    );
  }
}
