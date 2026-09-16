import { config } from "dotenv";
config({ path: ".env.local" });

import {
  syncPricesFromSheet,
  getMexicoCityTime,
} from "@/lib/services/sheetSyncService";
import { getPriceSyncSettings } from "@/lib/services/karmaxService";

async function main() {
  const isForce = process.argv.includes("--force");
  const mexicoTime = getMexicoCityTime();
  console.log(`[KARMAX Price Sync] Hora actual en Ciudad de México: ${mexicoTime.hourString}`);

  const settings = await getPriceSyncSettings();
  console.log(
    `[KARMAX Price Sync] Configuración: Sincronización ${settings.enabled ? "ACTIVADA" : "DESACTIVADA"}, Hora programada: ${settings.syncHour}`
  );

  if (!isForce) {
    if (!settings.enabled) {
      console.log("[KARMAX Price Sync] Sincronización desactivada en los ajustes generales. Saliendo...");
      process.exit(0);
    }

    const configuredHour = parseInt(settings.syncHour.split(":")[0], 10);
    if (isNaN(configuredHour) || mexicoTime.hour !== configuredHour) {
      console.log(
        `[KARMAX Price Sync] La hora actual (${mexicoTime.hourString}) no coincide con la hora programada (${settings.syncHour}). No se requiere ejecución en este ciclo.`
      );
      process.exit(0);
    }
  }

  console.log("[KARMAX Price Sync] Iniciando descarga y actualización de precios desde Google Sheets...");
  const result = await syncPricesFromSheet({ force: isForce });

  if (result.success) {
    console.log(`[KARMAX Price Sync] ✅ ÉXITO: ${result.message}`);
    if (result.report) {
      console.log(`- Filas leídas: ${result.report.totalRows}`);
      console.log(`- Productos actualizados: ${result.report.updatedProducts}`);
      console.log(`- Presentaciones actualizadas: ${result.report.updatedAttributes}`);
      console.log(`- SKUs no hallados: ${result.report.notFoundCount}`);
      if (result.report.sampleNotFound && result.report.sampleNotFound.length > 0) {
        console.log(`- Muestra SKUs no hallados:`, result.report.sampleNotFound.join(", "));
      }
    }
    process.exit(0);
  } else {
    console.error(`[KARMAX Price Sync] ❌ ERROR: ${result.message || result.error}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[KARMAX Price Sync] Error fatal en ejecución:", err);
  process.exit(1);
});
