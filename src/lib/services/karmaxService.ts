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

    // Ordenamiento por nombre, precio asc o precio desc
    let orderByClause;
    switch (sortBy) {
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