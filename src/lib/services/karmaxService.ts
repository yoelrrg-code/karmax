import { db, categories, industries } from "@/lib/db";
import {
  CATEGORIES_DATA,
  INDUSTRIES_DATA,
  CategoryItem,
  IndustryItem,
} from "@/lib/data/mockData";
import { asc, eq, and } from "drizzle-orm";

export async function getCategories(onlyFeatured: boolean = true): Promise<CategoryItem[]> {
  try {
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        imageUrl: categories.imageUrl,
        featured: categories.featured,
      })
      .from(categories)
      .where(
        onlyFeatured
          ? and(eq(categories.isActive, true), eq(categories.featured, true))
          : eq(categories.isActive, true)
      )
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
    return CATEGORIES_DATA;
  } catch (error) {
    console.warn("Retornando datos de referencia para categorías (MySQL no conectado aún):", (error as Error).message);
    return CATEGORIES_DATA;
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
      })
      .from(industries)
      .where(eq(industries.isActive, true))
      .orderBy(asc(industries.orderIndex));

    if (result && result.length > 0) {
      return result.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        iconName: r.iconName,
      }));
    }
    return INDUSTRIES_DATA;
  } catch (error) {
    console.warn("Retornando datos de referencia para industrias (MySQL no conectado aún):", (error as Error).message);
    return INDUSTRIES_DATA;
  }
}
