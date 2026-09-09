import {
  db,
  categories,
  industries,
  products,
  productCategories,
  productIndustries,
} from "@/lib/db";
import { CATEGORIES_DATA, INDUSTRIES_DATA } from "@/lib/data/mockData";
import type {
  CategoryItem,
  IndustryItem,
  CatalogProductItem,
  CatalogQueryOptions,
  CatalogResponse,
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

    const mappedProducts: CatalogProductItem[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      sku: r.sku,
      brand: r.brand,
      imageUrl: r.imageUrl || "/images/products/placeholder.png",
      regularPrice: r.regularPrice ? String(r.regularPrice) : null,
      salePrice: r.salePrice && Number(r.salePrice) > 0 ? String(r.salePrice) : null,
      unit: r.unit,
      isFeatured: r.isFeatured,
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