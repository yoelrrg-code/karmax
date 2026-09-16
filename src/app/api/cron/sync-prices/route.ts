import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminGuard";
import {
  syncPricesFromSheet,
  getMexicoCityTime,
} from "@/lib/services/sheetSyncService";
import { getPriceSyncSettings } from "@/lib/services/karmaxService";

export const dynamic = "force-dynamic";

/**
 * Verifica si la solicitud tiene autorización válida para ejecutar el cron.
 * Acepta:
 * 1. Token secreto vía Header 'Authorization: Bearer <TOKEN>' o Query '?token=<TOKEN>'.
 * 2. Sesión activa de usuario administrador de KARMAX.
 */
async function isAuthorized(request: NextRequest): Promise<boolean> {
  const secretKey =
    process.env.CRON_SECRET ||
    process.env.INTERNAL_CRON_KEY ||
    "karmax_secure_cron_price_sync_key";

  const url = new URL(request.url);
  const queryToken = url.searchParams.get("token") || url.searchParams.get("key");

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (
    (queryToken && queryToken === secretKey) ||
    (bearerToken && bearerToken === secretKey)
  ) {
    return true;
  }

  // Verificar sesión de administrador
  const admin = await getAdminSession();
  if (admin && admin.roleName === "admin") {
    return true;
  }

  return false;
}

async function handleSync(request: NextRequest) {
  try {
    const authorized = await isAuthorized(request);
    if (!authorized) {
      return NextResponse.json(
        {
          error: "No autorizado. Proporciona un token válido de cron o inicia sesión como administrador.",
        },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const force = url.searchParams.get("force") === "true";
    const customUrl = url.searchParams.get("sheetUrl") || undefined;

    const mexicoTime = getMexicoCityTime();
    const settings = await getPriceSyncSettings();

    // Si no se fuerza la ejecución, validar que la hora actual de México coincida con la configurada
    if (!force) {
      if (!settings.enabled) {
        return NextResponse.json({
          success: false,
          skipped: true,
          message: "La sincronización automática de precios está deshabilitada en los ajustes generales.",
          mexicoTime: mexicoTime.hourString,
        });
      }

      // Comparar componente de hora (HH)
      const configuredHour = parseInt(settings.syncHour.split(":")[0], 10);
      if (isNaN(configuredHour) || mexicoTime.hour !== configuredHour) {
        return NextResponse.json({
          success: false,
          skipped: true,
          message: `Hora actual en CDMX (${mexicoTime.hourString}) no coincide con la hora programada (${settings.syncHour} CDMX).`,
          mexicoTime: mexicoTime.hourString,
          scheduledHour: settings.syncHour,
        });
      }
    }

    const result = await syncPricesFromSheet({
      force,
      customUrl,
    });

    return NextResponse.json({
      ...result,
      mexicoTime: mexicoTime.hourString,
    });
  } catch (error) {
    console.error("Error en /api/cron/sync-prices:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error interno en sincronización de precios",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleSync(request);
}

export async function POST(request: NextRequest) {
  return handleSync(request);
}
