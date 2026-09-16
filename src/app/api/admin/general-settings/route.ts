import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import { db, siteSettings } from "@/lib/db";
import { eq } from "drizzle-orm";
import {
  getSiteSetting,
  getSeoSettings,
  getTaxSettings,
  getPriceSyncSettings,
  savePriceSyncSettings,
} from "@/lib/services/karmaxService";
import { syncPricesFromSheet } from "@/lib/services/sheetSyncService";
import type { SeoSettings, TaxSettings, PriceSyncSettings } from "@/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const [settings, seoSettings, taxSettings, priceSyncSettings] = await Promise.all([
      getSiteSetting<{ notificationEmail?: string }>("general_settings", {}),
      getSeoSettings(),
      getTaxSettings(),
      getPriceSyncSettings(),
    ]);

    const defaultEmail =
      process.env.KARMAX_NOTIFICATION_EMAIL || "dev.paco.lule@gmail.com";
    const notificationEmail = settings?.notificationEmail?.trim() || defaultEmail;

    return NextResponse.json({
      notificationEmail,
      defaultEnvEmail: defaultEmail,
      seoSettings,
      taxSettings,
      priceSyncSettings,
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
    const { notificationEmail, seoSettings, taxSettings } = body;
    const priceSyncSettings = body.priceSyncSettings as Partial<PriceSyncSettings> | undefined;

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

    // 3. Si enviaron actualización de ajustes de IVA (taxSettings)
    if (taxSettings && typeof taxSettings === "object") {
      const enabled = Boolean(taxSettings.enabled);
      const rawRate = Number(taxSettings.rate);
      const rate = isNaN(rawRate) ? 16 : Math.max(0, Math.min(100, Number(rawRate.toFixed(2))));

      const updatedTax: TaxSettings = {
        enabled,
        rate,
      };

      const [existingTax] = await db
        .select({ id: siteSettings.id })
        .from(siteSettings)
        .where(eq(siteSettings.key, "tax_settings"))
        .limit(1);

      if (existingTax) {
        await db
          .update(siteSettings)
          .set({
            value: JSON.stringify(updatedTax),
            updatedAt: new Date(),
          })
          .where(eq(siteSettings.id, existingTax.id));
      } else {
        await db.insert(siteSettings).values({
          key: "tax_settings",
          section: "tax",
          label: "Configuración de IVA del Cotizador",
          value: JSON.stringify(updatedTax),
        });
      }
    }

    // 4. Si enviaron actualización de ajustes de sincronización de precios (priceSyncSettings)
    if (priceSyncSettings && typeof priceSyncSettings === "object") {
      await savePriceSyncSettings(priceSyncSettings);
    }

    // 5. Si solicitaron disparo inmediato de sincronización de precios
    const { action } = body;
    if (action === "sync_prices_now") {
      const syncResult = await syncPricesFromSheet({
        force: true,
        customUrl: priceSyncSettings?.sheetUrl,
      });

      const refreshedSync = await getPriceSyncSettings();
      return NextResponse.json({
        success: syncResult.success,
        message: syncResult.message,
        report: syncResult.report,
        priceSyncSettings: refreshedSync,
      });
    }

    const [refreshedSeo, refreshedTax, refreshedPriceSync] = await Promise.all([
      getSeoSettings(),
      getTaxSettings(),
      getPriceSyncSettings(),
    ]);

    return NextResponse.json({
      success: true,
      notificationEmail: notificationEmail ? String(notificationEmail).trim().toLowerCase() : undefined,
      seoSettings: refreshedSeo,
      taxSettings: refreshedTax,
      priceSyncSettings: refreshedPriceSync,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/general-settings:", error);
    return NextResponse.json(
      { error: "Error al guardar la configuración general, IVA o sincronización de precios" },
      { status: 500 }
    );
  }
}
