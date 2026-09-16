import {
  db,
  categories,
  industries,
  products,
  productCategories,
  productIndustries,
  productAttributes,
  productDocuments,
  productImages,
  siteSettings,
} from "@/lib/db";
import { CATEGORIES_DATA, INDUSTRIES_DATA } from "@/lib/data/mockData";
import type {
  CategoryItem,
  IndustryItem,
  CatalogProductItem,
  CatalogQueryOptions,
  CatalogResponse,
  ProductAttributeItem,
  ProductDocumentItem,
  ProductDetailItem,
  SeoSettings,
  TaxSettings,
  PriceSyncSettings,
} from "@/types";
import { asc, desc, eq, and, or, like, inArray, sql } from "drizzle-orm";

export async function getCategories(featured?: boolean): Promise<CategoryItem[]> {
  try {
    const conditions = [eq(categories.isActive, true)];
    if (featured !== undefined) {
      conditions.push(eq(categories.featured, featured));
    }

    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        imageUrl: categories.imageUrl,
        metaTitle: categories.metaTitle,
        metaDescription: categories.metaDescription,
        featured: categories.featured,
      })
      .from(categories)
      .where(and(...conditions))
      .orderBy(asc(categories.orderIndex));

    if (result && result.length > 0) {
      return result.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        imageUrl: r.imageUrl || "/images/categories/limpieza-general.jpg",
        metaTitle: r.metaTitle,
        metaDescription: r.metaDescription,
        featured: r.featured,
      }));
    }
    return featured !== undefined
      ? CATEGORIES_DATA.filter((c) => Boolean(c.featured) === featured)
      : CATEGORIES_DATA;
  } catch (error) {
    console.warn("Retornando datos de referencia para categorías (MySQL no conectado aún):", (error as Error).message);
    return featured !== undefined
      ? CATEGORIES_DATA.filter((c) => Boolean(c.featured) === featured)
      : CATEGORIES_DATA;
  }
}

export async function getIndustries(): Promise<IndustryItem[]> {
  try {
    const result = await db
      .select({
        id: industries.id,
        name: industries.name,
        slug: industries.slug,
        description: industries.description,
        iconName: industries.iconName,
        iconUrl: industries.iconUrl,
        metaTitle: industries.metaTitle,
        metaDescription: industries.metaDescription,
      })
      .from(industries)
      .where(eq(industries.isActive, true))
      .orderBy(asc(industries.orderIndex));

    if (result && result.length > 0) {
      return result.map((r) => {
        return {
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description,
          iconName: r.iconName,
          iconUrl: r.iconUrl || `/icons/ico-${r.slug}.svg`,
          catLink: `/category/${r.slug}`,
          metaTitle: r.metaTitle,
          metaDescription: r.metaDescription,
        };
      });
    }
    return INDUSTRIES_DATA;
  } catch (error) {
    console.warn("Retornando datos de referencia para industrias (MySQL no conectado aún):", (error as Error).message);
    return INDUSTRIES_DATA;
  }
}

export async function getProductsCatalog(
  options: CatalogQueryOptions = {}
): Promise<CatalogResponse> {
  const {
    categorySlug,
    industrySlug,
    search,
    sortBy = "name",
    page = 1,
    limit = 12,
  } = options;

  try {
    const conditions = [eq(products.isActive, true)];

    // Búsqueda de texto libre en nombre, descripción, marca o sku
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(
          like(products.name, term),
          like(products.description, term),
          like(products.shortDescription, term),
          like(products.sku, term),
          like(products.brand, term)
        )!
      );
    }

    // Filtro único por categoría
    if (categorySlug && categorySlug.trim()) {
      const matchingCat = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, categorySlug.trim()))
        .limit(1);

      if (matchingCat.length > 0) {
        const catId = matchingCat[0].id;
        const prodIdsQuery = db
          .select({ productId: productCategories.productId })
          .from(productCategories)
          .where(eq(productCategories.categoryId, catId));

        conditions.push(
          or(
            inArray(products.id, prodIdsQuery),
            eq(products.categoryId, catId)
          )!
        );
      } else {
        return { products: [], total: 0, page, totalPages: 0, limit };
      }
    }

    // Filtro único por industria
    if (industrySlug && industrySlug.trim()) {
      const matchingInd = await db
        .select({ id: industries.id })
        .from(industries)
        .where(eq(industries.slug, industrySlug.trim()))
        .limit(1);

      if (matchingInd.length > 0) {
        const indId = matchingInd[0].id;
        const prodIdsQuery = db
          .select({ productId: productIndustries.productId })
          .from(productIndustries)
          .where(eq(productIndustries.industryId, indId));

        conditions.push(inArray(products.id, prodIdsQuery));
      } else {
        return { products: [], total: 0, page, totalPages: 0, limit };
      }
    }

    // Ordenamiento por nombre (A-Z / Z-A) o precio (menor/mayor)
    let orderByClause;
    switch (sortBy) {
      case "name_desc":
        orderByClause = [desc(products.name)];
        break;
      case "price_asc":
        orderByClause = [
          asc(sql`COALESCE(NULLIF(${products.salePrice}, 0), ${products.regularPrice})`),
          asc(products.name),
        ];
        break;
      case "price_desc":
        orderByClause = [
          desc(sql`COALESCE(NULLIF(${products.salePrice}, 0), ${products.regularPrice})`),
          asc(products.name),
        ];
        break;
      case "name_asc":
      case "name":
      default:
        orderByClause = [asc(products.name)];
        break;
    }

    // Conteo total de productos coincidentes
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(...conditions));

    const total = Number(countResult?.count || 0);
    const totalPages = Math.ceil(total / limit);
    const offset = Math.max(0, (page - 1) * limit);

    // conditions.push(
    //   and(
    //     eq(products.isActive, true),
    //     isNotNull(products.regularPrice)
    //   )!
    // );

    // Consulta de productos paginados
    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        sku: products.sku,
        brand: products.brand,
        imageUrl: products.imageUrl,
        regularPrice: products.regularPrice,
        salePrice: products.salePrice,
        unit: products.unit,
        isFeatured: products.isFeatured,
      })
      .from(products)
      .where(and(...conditions))
      .orderBy(...orderByClause)
      .limit(limit)
      .offset(offset);

    const productIds = rows.map((r) => r.id);
    const multiVarMap = new Map<number, boolean>();

    if (productIds.length > 0) {
      const attrCounts = await db
        .select({
          productId: productAttributes.productId,
          count: sql<number>`count(*)`,
        })
        .from(productAttributes)
        .where(inArray(productAttributes.productId, productIds))
        .groupBy(productAttributes.productId);

      for (const a of attrCounts) {
        if (Number(a.count) > 1) {
          multiVarMap.set(a.productId, true);
        }
      }
    }

    const mappedProducts: CatalogProductItem[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      sku: r.sku,
      brand: r.brand,
      imageUrl: r.imageUrl || "/images/products/placeholder.jpg",
      regularPrice: r.regularPrice ? String(r.regularPrice) : null,
      salePrice: r.salePrice && Number(r.salePrice) > 0 ? String(r.salePrice) : null,
      unit: r.unit,
      isFeatured: r.isFeatured,
      hasMultipleVariations: multiVarMap.get(r.id) || false,
    }));

    return {
      products: mappedProducts,
      total,
      page,
      totalPages,
      limit,
    };
  } catch (error) {
    console.error("Error al obtener catálogo de productos:", error);
    return {
      products: [],
      total: 0,
      page: 1,
      totalPages: 0,
      limit,
    };
  }
}

/**
 * Obtiene los atributos asignados a un producto.
 */
export async function getProductAttributes(productId: number): Promise<ProductAttributeItem[]> {
  try {
    const rows = await db
      .select({
        id: productAttributes.id,
        productId: productAttributes.productId,
        name: productAttributes.name,
        value: productAttributes.value,
        sku: productAttributes.sku,
        attrPrice: productAttributes.attrPrice,
        orderIndex: productAttributes.orderIndex,
      })
      .from(productAttributes)
      .where(eq(productAttributes.productId, productId))
      .orderBy(asc(productAttributes.orderIndex), asc(productAttributes.id));

    return rows;
  } catch (error) {
    console.error(`Error al obtener atributos del producto ${productId}:`, error);
    return [];
  }
}

/**
 * Obtiene los documentos PDF (fichas técnicas, MSDS, etc.) asignados a un producto.
 */
export async function getProductDocuments(productId: number): Promise<ProductDocumentItem[]> {
  try {
    const rows = await db
      .select({
        id: productDocuments.id,
        productId: productDocuments.productId,
        title: productDocuments.title,
        fileUrl: productDocuments.fileUrl,
        fileType: productDocuments.fileType,
        fileSize: productDocuments.fileSize,
        orderIndex: productDocuments.orderIndex,
      })
      .from(productDocuments)
      .where(eq(productDocuments.productId, productId))
      .orderBy(asc(productDocuments.orderIndex), asc(productDocuments.id));

    return rows;
  } catch (error) {
    console.error(`Error al obtener documentos del producto ${productId}:`, error);
    return [];
  }
}

/**
 * Obtiene el detalle completo de un producto por su slug, incluyendo
 * información de entrega, atributos y documentos PDF asociados.
 */
export async function getProductBySlug(slug: string): Promise<ProductDetailItem | null> {
  try {
    const [row] = await db
      .select({
        id: products.id,
        categoryId: products.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        name: products.name,
        slug: products.slug,
        sku: products.sku,
        brand: products.brand,
        unit: products.unit,
        shortDescription: products.shortDescription,
        description: products.description,
        deliveryInfo: products.deliveryInfo,
        imageUrl: products.imageUrl,
        regularPrice: products.regularPrice,
        salePrice: products.salePrice,
        stockStatus: products.stockStatus,
        isFeatured: products.isFeatured,
        metaTitle: products.metaTitle,
        metaDescription: products.metaDescription,
        metaKeywords: products.metaKeywords,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.slug, slug), eq(products.isActive, true)))
      .limit(1);

    if (!row) return null;

    const [rawAttrs, docs, galleryRows] = await Promise.all([
      getProductAttributes(row.id),
      getProductDocuments(row.id),
      db
        .select({
          url: productImages.url,
        })
        .from(productImages)
        .where(eq(productImages.productId, row.id))
        .orderBy(desc(productImages.isPrimary), asc(productImages.orderIndex)),
    ]);

    // Agrupar atributos por nombre (ej. { "Presentación": ["1L", "5L"], "Color": ["Azul"] })
    const attributes: Record<string, string[]> = {};
    for (const attr of rawAttrs) {
      if (!attributes[attr.name]) {
        attributes[attr.name] = [];
      }
      attributes[attr.name].push(attr.value);
    }

    const galleryImages: string[] = galleryRows
      .map((g) => g.url)
      .filter((url): url is string => Boolean(url));

    return {
      id: row.id,
      categoryId: row.categoryId,
      categoryName: row.categoryName || "Limpieza general",
      categorySlug: row.categorySlug || "limpieza-general",
      name: row.name,
      slug: row.slug,
      sku: row.sku || `KMX-${row.id.toString().padStart(4, "0")}`,
      brand: row.brand || "KARMAX",
      imageUrl: row.imageUrl || "/images/products/placeholder.jpg",
      regularPrice: row.regularPrice ? String(row.regularPrice) : null,
      salePrice: row.salePrice && Number(row.salePrice) > 0 ? String(row.salePrice) : null,
      unit: row.unit,
      isFeatured: row.isFeatured,
      hasMultipleVariations: rawAttrs.length > 1,
      shortDescription: row.shortDescription,
      description: row.description,
      deliveryInfo: row.deliveryInfo,
      stockStatus: row.stockStatus,
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      metaKeywords: row.metaKeywords,
      galleryImages: galleryImages.length > 0 ? galleryImages : [row.imageUrl || "/images/products/placeholder.jpg"],
      attributes,
      rawAttributes: rawAttrs,
      documents: docs,
    };
  } catch (error) {
    console.error(`Error al obtener detalle del producto ${slug}:`, error);
    return null;
  }
}

/**
 * Obtiene productos relacionados (misma categoría o complementarios) para el slider.
 */
export async function getRelatedProducts(
  productId: number,
  categoryId?: number,
  limit: number = 8
): Promise<CatalogProductItem[]> {
  try {
    const conditions = [
      eq(products.isActive, true),
      sql`${products.id} != ${productId}`,
    ];

    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        sku: products.sku,
        brand: products.brand,
        imageUrl: products.imageUrl,
        regularPrice: products.regularPrice,
        salePrice: products.salePrice,
        unit: products.unit,
        isFeatured: products.isFeatured,
      })
      .from(products)
      .where(and(...conditions))
      .limit(limit);

    const productIds = rows.map((r) => r.id);
    const multiVarMap = new Map<number, boolean>();

    if (productIds.length > 0) {
      const attrCounts = await db
        .select({
          productId: productAttributes.productId,
          count: sql<number>`count(*)`,
        })
        .from(productAttributes)
        .where(inArray(productAttributes.productId, productIds))
        .groupBy(productAttributes.productId);

      for (const a of attrCounts) {
        if (Number(a.count) > 1) {
          multiVarMap.set(a.productId, true);
        }
      }
    }

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      sku: r.sku,
      brand: r.brand,
      imageUrl: r.imageUrl || "/images/products/placeholder.jpg",
      regularPrice: r.regularPrice ? String(r.regularPrice) : null,
      salePrice: r.salePrice && Number(r.salePrice) > 0 ? String(r.salePrice) : null,
      unit: r.unit,
      isFeatured: r.isFeatured,
      hasMultipleVariations: multiVarMap.get(r.id) || false,
    }));
  } catch (error) {
    console.error("Error al obtener productos relacionados:", error);
    return [];
  }
}

/**
 * Obtiene la configuración/contenido de una sección del sitio desde MySQL
 * con fallback a un valor por defecto.
 */
export async function getSiteSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const [row] = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, key))
      .limit(1);

    if (!row?.value) return defaultValue;

    try {
      return JSON.parse(row.value) as T;
    } catch {
      return row.value as unknown as T;
    }
  } catch (error) {
    console.warn(`Fallback para site_setting "${key}":`, (error as Error).message);
    return defaultValue;
  }
}

/**
 * Obtiene todas las configuraciones de secciones del sitio.
 */
export async function getAllSiteSettings(): Promise<Record<string, unknown>> {
  try {
    const rows = await db.select().from(siteSettings);
    const map: Record<string, unknown> = {};
    for (const r of rows) {
      try {
        map[r.key] = JSON.parse(r.value);
      } catch {
        map[r.key] = r.value;
      }
    }
    return map;
  } catch (error) {
    console.error("Error al obtener configuraciones del sitio:", error);
    return {};
  }
}

/**
 * Obtiene el correo electrónico de notificaciones configurado para Karmax.
 * Prioriza el valor guardado en site_settings ('general_settings.notificationEmail')
 * y tiene como fallback la variable de entorno KARMAX_NOTIFICATION_EMAIL.
 */
export async function getKarmaxNotificationEmail(): Promise<string> {
  try {
    const generalSettings = await getSiteSetting<{ notificationEmail?: string }>(
      "general_settings",
      {}
    );
    if (generalSettings?.notificationEmail && generalSettings.notificationEmail.trim()) {
      return generalSettings.notificationEmail.trim();
    }
  } catch (error) {
    console.warn("Fallback para getKarmaxNotificationEmail:", (error as Error).message);
  }
  return process.env.KARMAX_NOTIFICATION_EMAIL || "dev.paco.lule@gmail.com";
}

/**
 * Obtiene las configuraciones globales de SEO guardadas en site_settings ('seo_settings').
 * Si no existen o la base de datos está offline, provee valores predeterminados optimizados.
 */
export async function getSeoSettings(): Promise<SeoSettings> {
  const defaults: SeoSettings = {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://karmax.mx",
    metaTitleDefault: "KARMAX | Productos de Limpieza Industrial e Higiene Institucional",
    metaDescriptionDefault:
      "Venta y cotización de químicos de limpieza industrial, jarcería e higiene institucional por mayoreo para empresas, hoteles y restaurantes.",
    metaKeywordsDefault:
      "KARMAX, limpieza industrial, jarcería por mayoreo, químicos de limpieza, higiene institucional México, insumos hoteles",
    ogImageUrlDefault: "/images/hero-banner.jpg",
    companyName: "KARMAX de México",
    telephone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+529988436581",
    address: "Cadereyta Jiménez, Nuevo León, México",
  };

  try {
    const saved = await getSiteSetting<SeoSettings>("seo_settings", defaults);
    return {
      siteUrl: saved?.siteUrl?.trim() || defaults.siteUrl,
      metaTitleDefault: saved?.metaTitleDefault?.trim() || defaults.metaTitleDefault,
      metaDescriptionDefault: saved?.metaDescriptionDefault?.trim() || defaults.metaDescriptionDefault,
      metaKeywordsDefault: saved?.metaKeywordsDefault?.trim() || defaults.metaKeywordsDefault,
      ogImageUrlDefault: saved?.ogImageUrlDefault?.trim() || defaults.ogImageUrlDefault,
      companyName: saved?.companyName?.trim() || defaults.companyName,
      telephone: saved?.telephone?.trim() || defaults.telephone,
      address: saved?.address?.trim() || defaults.address,
    };
  } catch (error) {
    console.warn("Fallback para getSeoSettings:", (error as Error).message);
    return defaults;
  }
}

/**
 * Obtiene la configuración de impuestos (IVA) guardada en site_settings ('tax_settings').
 * Si no existe o la base de datos está offline, provee { enabled: true, rate: 16 } por defecto.
 */
export async function getTaxSettings(): Promise<TaxSettings> {
  const defaults: TaxSettings = {
    enabled: true,
    rate: 16,
  };

  try {
    const saved = await getSiteSetting<TaxSettings>("tax_settings", defaults);
    return {
      enabled: saved?.enabled !== undefined ? Boolean(saved.enabled) : defaults.enabled,
      rate: saved?.rate !== undefined && !isNaN(Number(saved.rate)) ? Number(saved.rate) : defaults.rate,
    };
  } catch (error) {
    console.warn("Fallback para getTaxSettings:", (error as Error).message);
    return defaults;
  }
}

export const DEFAULT_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-URR428Bn9U3PvAzOkCwwD__GGhwB3HBINmfNSyKM-VE9RO9FWw7NPQ7kXNJjnQ/pub?gid=986321110&single=true&output=csv";

/**
 * Obtiene la configuración de sincronización de precios desde Google Sheets ('price_sync_settings').
 */
export async function getPriceSyncSettings(): Promise<PriceSyncSettings> {
  const defaults: PriceSyncSettings = {
    enabled: true,
    sheetUrl: DEFAULT_SHEET_URL,
    syncHour: "03:00",
    lastSyncAt: null,
    lastSyncStatus: null,
    lastSyncReport: null,
  };

  try {
    const saved = await getSiteSetting<PriceSyncSettings>("price_sync_settings", defaults);
    return {
      enabled: saved?.enabled !== undefined ? Boolean(saved.enabled) : defaults.enabled,
      sheetUrl: saved?.sheetUrl?.trim() || defaults.sheetUrl,
      syncHour: saved?.syncHour?.trim() || defaults.syncHour,
      lastSyncAt: saved?.lastSyncAt || null,
      lastSyncStatus: saved?.lastSyncStatus || null,
      lastSyncReport: saved?.lastSyncReport || null,
    };
  } catch (error) {
    console.warn("Fallback para getPriceSyncSettings:", (error as Error).message);
    return defaults;
  }
}

/**
 * Guarda la configuración de sincronización de precios en site_settings ('price_sync_settings').
 */
export async function savePriceSyncSettings(
  settings: Partial<PriceSyncSettings>
): Promise<PriceSyncSettings> {
  const current = await getPriceSyncSettings();
  const updated: PriceSyncSettings = {
    enabled: settings.enabled !== undefined ? Boolean(settings.enabled) : current.enabled,
    sheetUrl: settings.sheetUrl !== undefined ? String(settings.sheetUrl).trim() : current.sheetUrl,
    syncHour: settings.syncHour !== undefined ? String(settings.syncHour).trim() : current.syncHour,
    lastSyncAt: settings.lastSyncAt !== undefined ? settings.lastSyncAt : current.lastSyncAt,
    lastSyncStatus: settings.lastSyncStatus !== undefined ? settings.lastSyncStatus : current.lastSyncStatus,
    lastSyncReport: settings.lastSyncReport !== undefined ? settings.lastSyncReport : current.lastSyncReport,
  };

  const [existing] = await db
    .select({ id: siteSettings.id })
    .from(siteSettings)
    .where(eq(siteSettings.key, "price_sync_settings"))
    .limit(1);

  if (existing) {
    await db
      .update(siteSettings)
      .set({
        value: JSON.stringify(updated),
        updatedAt: new Date(),
      })
      .where(eq(siteSettings.id, existing.id));
  } else {
    await db.insert(siteSettings).values({
      key: "price_sync_settings",
      section: "sync",
      label: "Configuración de Sincronización de Precios",
      value: JSON.stringify(updated),
    });
  }

  return updated;
}