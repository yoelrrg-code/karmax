import { db, products, productAttributes } from "@/lib/db";
import { eq } from "drizzle-orm";
import {
  getPriceSyncSettings,
  savePriceSyncSettings,
  DEFAULT_SHEET_URL,
} from "./karmaxService";
import type { PriceSyncReport } from "@/types";

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
}

export interface SyncPricesResult {
  success: boolean;
  message: string;
  report?: PriceSyncReport;
  error?: string;
}

/**
 * Descarga y sincroniza los precios desde la hoja de cálculo de Google Sheets.
 */
export async function syncPricesFromSheet(
  options: SyncPricesOptions = {}
): Promise<SyncPricesResult> {
  const startTime = Date.now();
  const settings = await getPriceSyncSettings();

  if (!options.force && !settings.enabled) {
    return {
      success: false,
      message: "La sincronización automática de precios está deshabilitada en los ajustes.",
    };
  }

  const targetUrl = (options.customUrl || settings.sheetUrl || DEFAULT_SHEET_URL).trim();

  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    const errorMsg = "La URL de Google Sheets no tiene un formato web válido (debe iniciar con https://).";
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

  try {
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
        break;
      }
    }

    if (headerIndex === -1 || skuCol === -1 || priceCol === -1) {
      throw new Error(
        "No se encontraron los encabezados obligatorios ('sku' y 'Precio Lista Web (sin IVA)') en las primeras filas del archivo CSV."
      );
    }

    // 3. Consultar productos y atributos existentes en la base de datos
    const [existingProducts, existingAttributes] = await Promise.all([
      db
        .select({
          id: products.id,
          sku: products.sku,
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
    ]);

    // Mapeos indexados por SKU en mayúsculas
    const productBySku = new Map<string, typeof existingProducts[0]>();
    for (const p of existingProducts) {
      if (p.sku?.trim()) {
        productBySku.set(p.sku.trim().toUpperCase(), p);
      }
    }

    const attributeBySku = new Map<string, typeof existingAttributes[0]>();
    for (const a of existingAttributes) {
      if (a.sku?.trim()) {
        attributeBySku.set(a.sku.trim().toUpperCase(), a);
      }
    }

    // 4. Procesar filas del CSV y actualizar precios
    let totalRows = 0;
    let updatedProducts = 0;
    let updatedAttributes = 0;
    const notFoundSkus: string[] = [];

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      const rawSku = cols[skuCol]?.trim();
      if (!rawSku) continue;

      totalRows++;
      const price = parseSheetPrice(cols[priceCol]);
      if (price === null) continue;

      const upperSku = rawSku.toUpperCase();
      let matchedAny = false;

      // Actualizar en productos principales si coincide el SKU
      const matchedProd = productBySku.get(upperSku);
      if (matchedProd) {
        matchedAny = true;
        const formattedPrice = price.toFixed(2);
        if (matchedProd.regularPrice !== formattedPrice) {
          await db
            .update(products)
            .set({ regularPrice: formattedPrice })
            .where(eq(products.id, matchedProd.id));
          matchedProd.regularPrice = formattedPrice;
          updatedProducts++;
        }
      }

      // Actualizar en presentaciones/atributos si coincide el SKU
      const matchedAttr = attributeBySku.get(upperSku);
      if (matchedAttr) {
        matchedAny = true;
        const formattedPrice = price.toFixed(2);
        if (matchedAttr.attrPrice !== formattedPrice) {
          await db
            .update(productAttributes)
            .set({ attrPrice: formattedPrice })
            .where(eq(productAttributes.id, matchedAttr.id));
          matchedAttr.attrPrice = formattedPrice;
          updatedAttributes++;
        }
      }

      if (!matchedAny) {
        notFoundSkus.push(rawSku);
      }
    }

    const durationMs = Date.now() - startTime;
    const report: PriceSyncReport = {
      totalRows,
      updatedProducts,
      updatedAttributes,
      notFoundCount: notFoundSkus.length,
      sampleNotFound: notFoundSkus.slice(0, 10),
      durationMs,
      message: `Sincronización completada en ${durationMs}ms. Se leyeron ${totalRows} filas. ${updatedProducts} productos y ${updatedAttributes} presentaciones actualizadas.`,
    };

    // Guardar el reporte en site_settings
    await savePriceSyncSettings({
      lastSyncAt: new Date().toISOString(),
      lastSyncStatus: "success",
      lastSyncReport: report,
    });

    return {
      success: true,
      message: report.message || "Sincronización completada exitosamente.",
      report,
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

    return {
      success: false,
      message: errorMsg,
      error: errorMsg,
    };
  }
}
