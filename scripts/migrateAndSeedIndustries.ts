import path from "node:path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { INDUSTRIES_DATA } from "../src/lib/data/mockData";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  console.log("🚀 Starting database migration and seeding for industries & products...");

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "karmax_catalog",
  });

  try {
    // 1. Ensure icon_url column exists in industries table
    console.log("1. Checking column icon_url in industries table...");
    const [cols] = await conn.query<mysql.RowDataPacket[]>("SHOW COLUMNS FROM industries LIKE 'icon_url'");
    if (cols.length === 0) {
      console.log("Adding column icon_url to industries table...");
      await conn.query("ALTER TABLE industries ADD COLUMN icon_url VARCHAR(1024) NULL AFTER icon_name");
      console.log("✓ Column icon_url added successfully.");
    } else {
      console.log("✓ Column icon_url already exists.");
    }

    // 2. Create product_categories junction table
    console.log("2. Creating product_categories table if not exists...");
    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_categories (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        product_id BIGINT UNSIGNED NOT NULL,
        category_id INT NOT NULL,
        INDEX idx_prod_cat_product (product_id),
        INDEX idx_prod_cat_category (category_id),
        UNIQUE KEY uq_product_category (product_id, category_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ Table product_categories ready.");

    // 3. Create product_industries junction table
    console.log("3. Creating product_industries table if not exists...");
    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_industries (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        product_id BIGINT UNSIGNED NOT NULL,
        industry_id BIGINT UNSIGNED NOT NULL,
        INDEX idx_prod_ind_product (product_id),
        INDEX idx_prod_ind_industry (industry_id),
        UNIQUE KEY uq_product_industry (product_id, industry_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ Table product_industries ready.");

    // 4. Seed industries table with INDUSTRIES_DATA from mockData
    console.log(`4. Seeding ${INDUSTRIES_DATA.length} industries from mockData...`);
    for (const ind of INDUSTRIES_DATA) {
      await conn.query(`
        INSERT INTO industries (id, name, slug, description, icon_name, icon_url, order_index, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          slug = VALUES(slug),
          description = VALUES(description),
          icon_name = VALUES(icon_name),
          icon_url = VALUES(icon_url),
          order_index = VALUES(order_index),
          is_active = VALUES(is_active)
      `, [
        ind.id,
        ind.name,
        ind.slug,
        ind.description,
        ind.iconName,
        ind.iconUrl,
        ind.id,
      ]);
    }
    console.log("✓ Industries table seeded successfully.");

    // 5. Populate product_categories with existing products' category_id
    console.log("5. Populating product_categories from products.category_id...");
    const [catInsertResult] = await conn.query<mysql.ResultSetHeader>(`
      INSERT IGNORE INTO product_categories (product_id, category_id)
      SELECT id, category_id FROM products WHERE category_id IS NOT NULL;
    `);
    console.log(`✓ Synchronized ${catInsertResult.affectedRows} product-category associations.`);

    // 6. Assign a random industry to each product
    console.log("6. Assigning a random industry to each product...");
    const [industryRows] = await conn.query<mysql.RowDataPacket[]>("SELECT id FROM industries WHERE is_active = 1");
    const industryIds = industryRows.map((r) => Number(r.id));

    if (industryIds.length === 0) {
      throw new Error("No active industries found to assign to products.");
    }

    const [productRows] = await conn.query<mysql.RowDataPacket[]>("SELECT id FROM products");
    let assignedCount = 0;

    for (const prod of productRows) {
      // Pick a random industry from existing active industries
      const randomIndex = Math.floor(Math.random() * industryIds.length);
      const randomIndustryId = industryIds[randomIndex];

      const [res] = await conn.query<mysql.ResultSetHeader>(`
        INSERT IGNORE INTO product_industries (product_id, industry_id)
        VALUES (?, ?)
      `, [prod.id, randomIndustryId]);

      if (res.affectedRows > 0) {
        assignedCount++;
      }
    }
    console.log(`✓ Assigned random industry to ${assignedCount} products (Total products: ${productRows.length}).`);

    console.log("\n🎉 Migration and seed completed successfully!");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
