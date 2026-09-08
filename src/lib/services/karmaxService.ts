import { db, categories, industries } from "@/lib/db";
import { CATEGORIES_DATA, INDUSTRIES_DATA } from "@/lib/data/mockData";
import type { CategoryItem, IndustryItem } from "@/types";
import { asc, eq, and } from "drizzle-orm";

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
      })
      .from(industries)
      .where(eq(industries.isActive, true))
      .orderBy(asc(industries.orderIndex));

    if (result && result.length > 0) {
      return result.map((r) => {
        const fallback = INDUSTRIES_DATA.find(
          (item) => item.slug === r.slug || item.id === r.id
        );
        return {
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description,
          iconName: r.iconName,
          iconUrl: fallback?.iconUrl || `/icons/ico-${r.slug}.svg`,
          catLink: fallback?.catLink || `/category/${r.slug}`,
        };
      });
    }
    return INDUSTRIES_DATA;
  } catch (error) {
    console.warn("Retornando datos de referencia para industrias (MySQL no conectado aún):", (error as Error).message);
    return INDUSTRIES_DATA;
  }
}
