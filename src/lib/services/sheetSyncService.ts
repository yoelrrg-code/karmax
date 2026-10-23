import {
  db,
  products,
  productAttributes,
  productVariants,
  priceSyncLogs,
} from "@/lib/db";
import { eq } from "drizzle-orm";
import {
  getPriceSyncSettings,
  savePriceSyncSettings,
  DEFAULT_SHEET_URL,
} from "./karmaxService";
import type { PriceSyncReport, PriceSyncUpdatedSkuItem } from "@/types";

/**
 * Parsea una línea de CSV respetando valores entre comillas dobles.
 */
export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Convierte cadenas de precio con formato monetario latino/internacional a float.
 * Ejemplos soportados:
 * - "$26,00" -> 26.00
 * - "$82,86" -> 82.86
 * - "$1.065,00" -> 1065.00
 * - "$1,454.60" -> 1454.60
 * - "319.00" -> 319.00
 */
export function parseSheetPrice(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  let str = String(val).trim();
  str = str.replace(/[$€MXN\s"']/gi, "");
  if (!str) return null;

  if (str.includes(".") && str.includes(",")) {
    if (str.lastIndexOf(",") > str.lastIndexOf(".")) {
      // Formato latino: 1.065,00
      str = str.replace(/\./g, "").replace(",", ".");
    } else {
      // Formato anglosajón: 1,065.00
      str = str.replace(/,/g, "");
    }
  } else if (str.includes(",")) {
    // Únicamente coma decimal: 26,00 -> 26.00
    str = str.replace(",", ".");
  }

  const num = parseFloat(str);
  return isNaN(num) || num < 0 ? null : Math.round(num * 100) / 100;
}

/**
 * Obtiene la hora actual formateada en la zona horaria de la Ciudad de México.
 */
export function getMexicoCityTime(): {
  hourString: string; // "HH:mm"
  hour: number;
  minute: number;
  isoDateString: string;
} {
  const now = new Date();
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const hourStr = timeFormatter.format(now); // "14:30"
  const [h, m] = hourStr.split(":").map(Number);

  return {
    hourString: hourStr,
    hour: h || 0,
    minute: m || 0,
    isoDateString: now.toISOString(),
  };
}

export interface SyncPricesOptions {
  customUrl?: string;
  force?: boolean;
  triggerType?: "manual" | "cron";
}

export interface SyncPricesResult {
  success: boolean;
  message: string;
  report?: PriceSyncReport;
  logId?: number;
  error?: string;
}

let isSyncInProgress = false;

/**
 * Descarga y sincroniza los precios desde la hoja de cálculo de Google Sheets.
 */
export async function syncPricesFromSheet(
  options: SyncPricesOptions = {}
): Promise<SyncPricesResult> {
  if (isSyncInProgress) {
    return {
      success: false,
      message: "Ya hay una sincronización de precios en curso. Por favor espera a que termine.",
      error: "SYNC_IN_PROGRESS",
    };
  }

  isSyncInProgress = true;
  const startTime = Date.now();

  try {
    const settings = await getPriceSyncSettings();

    if (!options.force && !settings.enabled) {
      return {
        success: false,
        message: "La sincronización automática de precios está deshabilitada en los ajustes.",
      };
    }

    const targetUrl = (options.customUrl || settings.sheetUrl || DEFAULT_SHEET_URL).trim();

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      const errorMsg = "La URL proporcionada no es una URL válida.";
      return { success: false, message: errorMsg, error: errorMsg };
    }

    if (parsedUrl.protocol !== "https:" || parsedUrl.hostname.toLowerCase() !== "docs.google.com") {
      const errorMsg = "Acceso denegado (SSRF): Solo se permiten hojas de cálculo alojadas en https://docs.google.com.";
      await savePriceSyncSettings({
        lastSyncAt: new Date().toISOString(),
        lastSyncStatus: "error",
        lastSyncReport: {
          totalRows: 0,
          updatedProducts: 0,
          updatedAttributes: 0,
          notFoundCount: 0,
          message: errorMsg,
          durationMs: Date.now() - startTime,
        },
      });
      return {
        success: false,
        message: errorMsg,
        error: errorMsg,
      };
    }

    // 1. Descargar el contenido CSV desde la URL pública
    const response = await fetch(targetUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "text/csv, text/plain, */*",
        "User-Agent": "Karmax-PriceSync/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error HTTP al descargar el Google Sheet (${response.status} ${response.statusText}). Verifica que el documento esté publicado o accesible.`
      );
    }

    const csvText = await response.text();
    if (!csvText || csvText.trim().length === 0) {
      throw new Error("El archivo CSV descargado desde Google Sheets está vacío.");
    }

    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      throw new Error("No se encontraron líneas de datos en el CSV.");
    }

    // 2. Localizar la fila de encabezados
    let headerIndex = -1;
    let skuCol = -1;
    let priceCol = -1;
    let nameCol = -1;
    let presentationCol = -1;

    for (let i = 0; i < Math.min(lines.length, 15); i++) {
      const cols = parseCsvLine(lines[i]);
      const sIdx = cols.findIndex((c) => c.toLowerCase() === "sku");
      const pIdx = cols.findIndex((c) => {
        const lower = c.toLowerCase();
        return lower.includes("precio lista") || lower.includes("precio") || lower === "precio lista web (sin iva)";
      });

      if (sIdx !== -1 && pIdx !== -1) {
        headerIndex = i;
        skuCol = sIdx;
        priceCol = pIdx;
        nameCol = cols.findIndex((c) => c.toLowerCase().includes("nombre"));
        presentationCol = cols.findIndex((c) =>
          c.toLowerCase().includes("presentación") || c.toLowerCase().includes("presentacion")
        );
        break;
      }
    }

    if (headerIndex === -1 || skuCol === -1 || priceCol === -1) {
      throw new Error(
        "No se encontraron los encabezados obligatorios ('sku' y 'Precio Lista Web (sin IVA)') en las primeras filas del archivo CSV."
      );
    }

    // 3. Consultar productos, atributos y variantes existentes en la base de datos
    const [existingProducts, existingAttributes, existingVariants] = await Promise.all([
      db
        .select({
          id: products.id,
          sku: products.sku,
          name: products.name,
          regularPrice: products.regularPrice,
        })
        .from(products),
      db
        .select({
          id: productAttributes.id,
          productId: productAttributes.productId,
          sku: productAttributes.sku,
          attrPrice: productAttributes.attrPrice,
        })
        .from(productAttributes),
      db
        .select({
          id: productVariants.id,
          productId: productVariants.productId,
          sku: productVariants.sku,
          price: productVariants.price,
        })
        .from(productVariants),
    ]);

    // Mapeos indexados por SKU en mayúsculas
    const productBySku = new Map<string, typeof existingProducts[0]>();
    const productById = new Map<number, string>();
    for (const p of existingProducts) {
      if (p.sku?.trim()) {
        productBySku.set(p.sku.trim().toUpperCase(), p);
      }
      productById.set(p.id, p.name);
    }

    const attributeBySku = new Map<string, typeof existingAttributes[0]>();
    for (const a of existingAttributes) {
      if (a.sku?.trim()) {
        attributeBySku.set(a.sku.trim().toUpperCase(), a);
      }
    }

    const variantBySku = new Map<string, typeof existingVariants[0]>();
    for (const v of existingVariants) {
      if (v.sku?.trim()) {
        variantBySku.set(v.sku.trim().toUpperCase(), v);
      }
    }

    // 4. Procesar filas del CSV y recopilar actualizaciones para batch execution
    let totalRows = 0;
    const notFoundSkus: string[] = [];
    const updatedSkusList: PriceSyncUpdatedSkuItem[] = [];
    const pendingProductUpdates: { id: number; price: string }[] = [];
    const pendingAttrUpdates: { id: number; price: string }[] = [];
    const pendingVariantUpdates: { id: number; price: string }[] = [];

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      const rawSku = cols[skuCol]?.trim();
      if (!rawSku) continue;

      totalRows++;
      const price = parseSheetPrice(cols[priceCol]);
      if (price === null) continue;

      const upperSku = rawSku.toUpperCase();
      let matchedAny = false;
      const csvProductName = nameCol !== -1 ? cols[nameCol]?.trim() : undefined;
      const csvPresentation = presentationCol !== -1 ? cols[presentationCol]?.trim() : undefined;

      // Actualizar en productos principales si coincide el SKU
      const matchedProd = productBySku.get(upperSku);
      if (matchedProd) {
        matchedAny = true;
        const formattedPrice = price.toFixed(2);
        const oldPrice = matchedProd.regularPrice;
        if (oldPrice !== formattedPrice) {
          pendingProductUpdates.push({ id: matchedProd.id, price: formattedPrice });
          updatedSkusList.push({
            sku: rawSku,
            name: matchedProd.name || csvProductName,
            target: "product",
            oldPrice,
            newPrice: formattedPrice,
          });
          matchedProd.regularPrice = formattedPrice;
        }
      }

      // Actualizar en presentaciones/atributos si coincide el SKU
      const matchedAttr = attributeBySku.get(upperSku);
      if (matchedAttr) {
        matchedAny = true;
        const formattedPrice = price.toFixed(2);
        const oldPrice = matchedAttr.attrPrice;
        if (oldPrice !== formattedPrice) {
          pendingAttrUpdates.push({ id: matchedAttr.id, price: formattedPrice });
          const prodName = productById.get(matchedAttr.productId) || csvProductName;
          const fullName = [prodName, csvPresentation].filter(Boolean).join(" - ");
          updatedSkusList.push({
            sku: rawSku,
            name: fullName || undefined,
            target: "attribute",
            oldPrice,
            newPrice: formattedPrice,
          });
          matchedAttr.attrPrice = formattedPrice;
        }
      }

      // Actualizar en variantes multidimensionales si coincide el SKU
      const matchedVariant = variantBySku.get(upperSku);
      if (matchedVariant) {
        matchedAny = true;
        const formattedPrice = price.toFixed(2);
        const oldPrice = matchedVariant.price;
        if (oldPrice !== formattedPrice) {
          pendingVariantUpdates.push({ id: matchedVariant.id, price: formattedPrice });
          const prodName = productById.get(matchedVariant.productId) || csvProductName;
          updatedSkusList.push({
            sku: rawSku,
            name: prodName || undefined,
            target: "variant",
            oldPrice,
            newPrice: formattedPrice,
          });
          matchedVariant.price = formattedPrice;
        }
      }

      if (!matchedAny) {
        notFoundSkus.push(rawSku);
      }
    }

    // Ejecutar actualizaciones en micro-lotes (chunks) para no saturar el pool ni bloquear tablas
    const BATCH_SIZE = 50;
    const chunkArray = <T>(arr: T[], size: number): T[][] => {
      const chunks: T[][] = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    };

    if (pendingProductUpdates.length > 0) {
      for (const chunk of chunkArray(pendingProductUpdates, BATCH_SIZE)) {
        await db.transaction(async (tx) => {
          await Promise.all(
            chunk.map((p) =>
              tx
                .update(products)
                .set({ regularPrice: p.price })
                .where(eq(products.id, p.id))
            )
          );
        });
      }
    }

    if (pendingAttrUpdates.length > 0) {
      for (const chunk of chunkArray(pendingAttrUpdates, BATCH_SIZE)) {
        await db.transaction(async (tx) => {
          await Promise.all(
            chunk.map((a) =>
              tx
                .update(productAttributes)
                .set({ attrPrice: a.price })
                .where(eq(productAttributes.id, a.id))
            )
          );
        });
      }
    }

    if (pendingVariantUpdates.length > 0) {
      for (const chunk of chunkArray(pendingVariantUpdates, BATCH_SIZE)) {
        await db.transaction(async (tx) => {
          await Promise.all(
            chunk.map((v) =>
              tx
                .update(productVariants)
                .set({ price: v.price })
                .where(eq(productVariants.id, v.id))
            )
          );
        });
      }
    }

    const updatedProducts = pendingProductUpdates.length;
    const updatedAttributes = pendingAttrUpdates.length;
    const updatedVariants = pendingVariantUpdates.length;

    const durationMs = Date.now() - startTime;
    const report: PriceSyncReport = {
      totalRows,
      updatedProducts,
      updatedAttributes,
      notFoundCount: notFoundSkus.length,
      sampleNotFound: notFoundSkus.slice(0, 10),
      durationMs,
      message: `Sincronización completada en ${durationMs}ms. Se leyeron ${totalRows} filas. ${updatedProducts} productos, ${updatedAttributes} presentaciones y ${updatedVariants} variantes actualizadas.`,
    };

    // Guardar el reporte en site_settings
    await savePriceSyncSettings({
      lastSyncAt: new Date().toISOString(),
      lastSyncStatus: "success",
      lastSyncReport: report,
    });

    // Guardar registro de auditoría en price_sync_logs
    let logId: number | undefined;
    try {
      const [insertResult] = await db.insert(priceSyncLogs).values({
        status: "success",
        triggerType: options.triggerType || "cron",
        sheetUrl: targetUrl,
        totalRows,
        updatedProducts,
        updatedAttributes,
        updatedVariants,
        notFoundCount: notFoundSkus.length,
        durationMs,
        message: report.message,
        errorDetails: null,
        details: {
          updatedSkus: updatedSkusList,
          notFoundSkus,
          totalUpdated: updatedProducts + updatedAttributes + updatedVariants,
        },
        executedAt: new Date(),
      });
      logId = Number(insertResult.insertId);
    } catch (logErr) {
      console.error("No se pudo registrar log de sincronización exitosa en price_sync_logs:", logErr);
    }

    return {
      success: true,
      message: report.message || "Sincronización completada exitosamente.",
      report,
      logId,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Error desconocido al sincronizar precios.";
    console.error("Error en syncPricesFromSheet:", error);

    await savePriceSyncSettings({
      lastSyncAt: new Date().toISOString(),
      lastSyncStatus: "error",
      lastSyncReport: {
        totalRows: 0,
        updatedProducts: 0,
        updatedAttributes: 0,
        notFoundCount: 0,
        message: errorMsg,
        durationMs: Date.now() - startTime,
      },
    });

    let logId: number | undefined;
    try {
      const [insertResult] = await db.insert(priceSyncLogs).values({
        status: "error",
        triggerType: options.triggerType || "cron",
        sheetUrl: options.customUrl || null,
        totalRows: 0,
        updatedProducts: 0,
        updatedAttributes: 0,
        updatedVariants: 0,
        notFoundCount: 0,
        durationMs: Date.now() - startTime,
        message: errorMsg,
        errorDetails: error instanceof Error ? error.stack || error.message : String(error),
        details: null,
        executedAt: new Date(),
      });
      logId = Number(insertResult.insertId);
    } catch (logErr) {
      console.error("No se pudo registrar log de error de sincronización en price_sync_logs:", logErr);
    }

    return {
      success: false,
      message: errorMsg,
      error: errorMsg,
      logId,
    };
  } finally {
    isSyncInProgress = false;
  }
}
