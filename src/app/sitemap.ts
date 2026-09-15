import { MetadataRoute } from "next";
import { db, products, categories } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSeoSettings } from "@/lib/services/karmaxService";

export const revalidate = 86400; // 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await getSeoSettings();
  const baseUrl = (seo.siteUrl || "https://karmax.mx").replace(/\/$/, "");

  // Static public routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/productos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/quienes-somos`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    // Active products
    const activeProducts = await db
      .select({
        slug: products.slug,
        createdAt: products.createdAt,
      })
      .from(products)
      .where(eq(products.isActive, true));

    const productRoutes: MetadataRoute.Sitemap = activeProducts.map((p) => ({
      url: `${baseUrl}/productos/${p.slug}`,
      lastModified: p.createdAt ? new Date(p.createdAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // Active categories
    const activeCategories = await db
      .select({
        slug: categories.slug,
        createdAt: categories.createdAt,
      })
      .from(categories)
      .where(eq(categories.isActive, true));

    const categoryRoutes: MetadataRoute.Sitemap = activeCategories.map((c) => ({
      url: `${baseUrl}/productos?linea=${c.slug}`,
      lastModified: c.createdAt ? new Date(c.createdAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticRoutes;
  }
}
