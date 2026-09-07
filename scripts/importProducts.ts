import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { parse } from "csv-parse/sync";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

interface ParsedImage {
  url: string;
  alt: string;
  title: string;
  caption: string | null;
  isPrimary: boolean;
  orderIndex: number;
}

const CATEGORIES_SEED = [
  { name: "Químicos de Limpieza", slug: "quimicos-de-limpieza", description: "Detergentes, desengrasantes y soluciones químicas industriales.", orderIndex: 1 },
  { name: "Higiene y Desinfección", slug: "higiene-y-desinfeccion", description: "Sanitizantes, cloro, alcohol y bactericidas.", orderIndex: 2 },
  { name: "Automotriz", slug: "automotriz", description: "Cuidado exterior e interior para vehículos y flotas.", orderIndex: 3 },
  { name: "Utensilios de Limpieza", slug: "utensilios-de-limpieza", description: "Escobas, jaladores, cepillos, mopas y microfibras.", orderIndex: 4 },
  { name: "Papelería e Higiene Institucional", slug: "papeleria-e-higiene-institucional", description: "Toallas interdobladas, papel higiénico institucional y servilletas.", orderIndex: 5 },
  { name: "Bolsas y Manejo de Residuos", slug: "bolsas-y-manejo-de-residuos", description: "Bolsas de alta y baja densidad para recolección y reciclaje.", orderIndex: 6 },
  { name: "Control de plagas", slug: "control-de-plagas", description: "Productos y repelentes para el control de plagas institucional.", orderIndex: 7 },
  { name: "Mascotas", slug: "mascotas", description: "Productos especializados para higiene y cuidado de mascotas.", orderIndex: 8 },
  { name: "Hospitales & Clínicas", slug: "hospitales-y-clinicas", description: "Insumos grado hospitalario para clínicas y laboratorios.", orderIndex: 9 },
  { name: "Hoteles & Hospitalidad", slug: "hoteles-y-hospitalidad", description: "Insumos premium para hotelería y resorts.", orderIndex: 10 },
  { name: "Industria & Manufactura", slug: "industria-y-manufactura", description: "Soluciones de alta potencia para plantas industriales.", orderIndex: 11 },
  { name: "Oficinas & Corporativos", slug: "oficinas-y-corporativos", description: "Suministros continuos para edificios corporativos.", orderIndex: 12 },
  { name: "Restaurantes & Cocinas", slug: "restaurantes-y-cocinas", description: "Lavatrastes, desengrasantes y desinfectantes para cocinas profesionales.", orderIndex: 13 },
];

const CATEGORY_PRIORITY = [
  "Químicos de Limpieza",
  "Higiene y Desinfección",
  "Automotriz",
  "Utensilios de Limpieza",
  "Papelería e Higiene Institucional",
  "Bolsas y Manejo de Residuos",
  "Control de plagas",
  "Mascotas",
  "Hospitales & Clínicas",
  "Hoteles & Hospitalidad",
  "Industria & Manufactura",
  "Oficinas & Corporativos",
  "Restaurantes & Cocinas"
];

function parseImages(str: string, defaultTitle: string): ParsedImage[] {
  if (!str || !str.trim()) return [];
  const parts = str.split(/\s+\|\s+/);
  return parts.map((part, idx) => {
    const tokens = part.split(/\s+!\s+/);
    const rawUrl = tokens[0]?.trim() || "";
    const basename = path.basename(rawUrl);
    const localUrl = basename ? `/images/products/${basename}` : "";
    let alt = "";
    let title = "";
    let desc = "";
    let caption = "";

    for (let k = 1; k < tokens.length; k++) {
      const t = tokens[k].trim();
      if (t.startsWith("alt :")) alt = t.replace("alt :", "").trim();
      else if (t.startsWith("title :")) title = t.replace("title :", "").trim();
      else if (t.startsWith("desc :")) desc = t.replace("desc :", "").trim();
      else if (t.startsWith("caption :")) caption = t.replace("caption :", "").trim();
    }

    return {
      url: localUrl,
      alt: alt || defaultTitle || "",
      title: title || defaultTitle || "",
      caption: caption || desc || null,
      isPrimary: idx === 0,
      orderIndex: idx,
    };
  }).filter((img) => img.url.length > 0);
}

function resolvePrimaryCategoryName(catStr: string): string {
  if (!catStr) return "Químicos de Limpieza";
  const list = catStr.split("|").map((s) => s.trim());
  for (const prio of CATEGORY_PRIORITY) {
    if (list.includes(prio)) return prio;
  }
  return list[0] || "Químicos de Limpieza";
}

async function main() {
  console.log("🚀 Starting Karmax CSV import...");

  const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "karmax_catalog",
    waitForConnections: true,
    connectionLimit: 5,
  });

  const db = drizzle(pool, { schema, mode: "default" });

  // 1. Seed / Upsert Categories
  console.log("📂 Seeding / verifying categories...");
  const categoryMap = new Map<string, number>();

  for (const cat of CATEGORIES_SEED) {
    const existing = await db.query.categories.findFirst({
      where: eq(schema.categories.slug, cat.slug),
    });

    if (existing) {
      categoryMap.set(cat.name, existing.id);
    } else {
      const [insertResult] = await db.insert(schema.categories).values({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        orderIndex: cat.orderIndex,
        isActive: true,
      });
      categoryMap.set(cat.name, Number(insertResult.insertId));
    }
  }

  console.log(`✅ Loaded ${categoryMap.size} categories into memory.`);

  // 2. Read and Parse CSV
  const csvPath = path.resolve(process.cwd(), "karmax-products.csv");
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at ${csvPath}`);
  }

  const rawCsv = fs.readFileSync(csvPath);
  const records = parse(rawCsv, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    bom: true,
  }) as Record<string, string>[];

  console.log(`📦 Found ${records.length} product rows in CSV.`);

  let importedProducts = 0;
  let importedImages = 0;

  for (const r of records) {
    const name = r.post_title?.trim();
    const slug = r.post_name?.trim();
    if (!name || !slug) continue;

    const catName = resolvePrimaryCategoryName(r["tax:product_cat"]);
    const categoryId = categoryMap.get(catName) ?? categoryMap.get("Químicos de Limpieza")!;

    const images = parseImages(r.images, name);
    const primaryImageUrl = images.length > 0 ? images[0].url : null;

    const sku = r.sku?.trim() || null;
    const brand = r["tax:product_brand"]?.trim() || "KARMAX";
    const unit = "Pieza";
    const shortDescription = r.post_excerpt?.trim() || null;
    const description = r.post_content?.trim() || null;
    const regularPrice = r.regular_price?.trim() ? String(r.regular_price.trim()) : null;
    const salePrice = r.sale_price?.trim() ? String(r.sale_price.trim()) : null;
    const stockStatus = r.stock_status?.trim() || "instock";
    const postStatus = r.post_status?.trim() || "publish";
    const postDate = r.post_date?.trim() ? new Date(r.post_date.trim()) : new Date();

    // Check if product exists by slug
    const existingProduct = await db.query.products.findFirst({
      where: eq(schema.products.slug, slug),
    });

    let productId: number;

    if (existingProduct) {
      productId = existingProduct.id;
      await db.update(schema.products).set({
        categoryId,
        name,
        sku,
        brand,
        unit,
        shortDescription,
        description,
        imageUrl: primaryImageUrl,
        regularPrice,
        salePrice,
        stockStatus,
        postStatus,
        postDate,
        isActive: true,
      }).where(eq(schema.products.id, productId));
    } else {
      const [insertProductResult] = await db.insert(schema.products).values({
        categoryId,
        name,
        slug,
        sku,
        brand,
        unit,
        shortDescription,
        description,
        imageUrl: primaryImageUrl,
        regularPrice,
        salePrice,
        stockStatus,
        postStatus,
        postDate,
        isFeatured: false,
        isActive: true,
      });
      productId = Number(insertProductResult.insertId);
    }

    // Replace product images
    await db.delete(schema.productImages).where(eq(schema.productImages.productId, productId));

    if (images.length > 0) {
      await db.insert(schema.productImages).values(
        images.map((img) => ({
          productId,
          url: img.url,
          alt: img.alt,
          title: img.title,
          caption: img.caption,
          isPrimary: img.isPrimary,
          orderIndex: img.orderIndex,
        }))
      );
      importedImages += images.length;
    }

    importedProducts++;
  }

  console.log(`🎉 Import completed successfully!`);
  console.log(`   - Products imported/updated: ${importedProducts}`);
  console.log(`   - Product images mapped: ${importedImages}`);

  await pool.end();
}

main().catch((err) => {
  console.error("❌ Fatal error during import:", err);
  process.exit(1);
});
