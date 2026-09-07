import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  console.log("🔧 Updating categories image_url and featured status...");

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "karmax_catalog",
  });

  // 1. Clean up category name formatting and image filenames
  await conn.query(`
    UPDATE categories 
    SET name = 'Bolsas y manejo de residuos' 
    WHERE id = 6
  `);

  await conn.query(`
    UPDATE categories 
    SET image_url = '/images/categories/lavanderia.jpg' 
    WHERE id = 10
  `);

  interface CategoryRow extends mysql.RowDataPacket {
    id: number;
    name: string;
    slug: string;
    image_url: string | null;
  }

  // 2. Set featured = 1 for categories with a defined, non-empty image_url that exists in public
  const [categories] = await conn.query<CategoryRow[]>("SELECT id, name, slug, image_url FROM categories");

  let featuredCount = 0;
  let unfeaturedCount = 0;

  for (const cat of categories) {
    let hasValidImage = false;

    if (cat.image_url && cat.image_url.trim()) {
      // Check if file exists in public/
      const relPath = cat.image_url.startsWith("/") ? cat.image_url.slice(1) : cat.image_url;
      const fullPath = path.resolve(process.cwd(), "public", relPath);
      if (fs.existsSync(fullPath)) {
        hasValidImage = true;
      } else {
        console.warn(`⚠️ Image file not found on disk for category ${cat.name}: ${fullPath}`);
      }
    }

    const featuredValue = hasValidImage ? 1 : 0;

    await conn.query(
      "UPDATE categories SET featured = ? WHERE id = ?",
      [featuredValue, cat.id]
    );

    if (hasValidImage) {
      featuredCount++;
      console.log(`⭐ Category [${cat.id}] "${cat.name}" -> featured = 1 (image: ${cat.image_url})`);
    } else {
      unfeaturedCount++;
      console.log(`⚪ Category [${cat.id}] "${cat.name}" -> featured = 0 (no image)`);
    }
  }

  console.log(`\n✅ Summary:`);
  console.log(`   - Featured categories (with image): ${featuredCount}`);
  console.log(`   - Non-featured categories (without image): ${unfeaturedCount}`);

  // Fetch and log final state
  const [finalRows] = await conn.query(
    "SELECT id, name, slug, image_url, featured FROM categories ORDER BY order_index ASC"
  );
  console.log("\n📊 Final Categories in MySQL:\n", finalRows);

  await conn.end();
}

main().catch((err) => {
  console.error("❌ Error running updateCategories:", err);
  process.exit(1);
});
