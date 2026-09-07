import { db, categories, industries } from "@/lib/db";
import {
  CATEGORIES_DATA,
  INDUSTRIES_DATA,
  CategoryItem,
  IndustryItem,
} from "@/lib/data/mockData";
import { asc, eq } from "drizzle-orm";

export async function getCategories(): Promise<CategoryItem[]> {
  try {
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        imageUrl: categories.imageUrl,
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.orderIndex));

    if (result && result.length > 0) {
      return result.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        imageUrl: r.imageUrl || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
      }));
    }
    return CATEGORIES_DATA;
  } catch (error) {
    // Si la base de datos no está disponible o las tablas no están creadas todavía, retorna datos de referencia
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
