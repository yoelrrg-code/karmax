import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

interface ParsedProduct {
  sku: string;
  category_id: number;
  name: string;
  brand: string;
  aroma?: string;
  presentation?: string;
  net_price?: number;
  regular_price?: number;
}

async function main() {
  console.log("🚀 Starting database migration for product variants...");

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "karmax_catalog",
  });

  try {
    // 1. Create product_variants table
    console.log("1. Creating product_variants table if not exists...");
    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        product_id BIGINT UNSIGNED NOT NULL,
        sku VARCHAR(100) NOT NULL UNIQUE,
        price DECIMAL(10, 2) NULL,
        stock_status VARCHAR(50) NOT NULL DEFAULT 'instock',
        attributes JSON NOT NULL,
        order_index INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_variant_product (product_id),
        INDEX idx_variant_sku (sku)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ Table product_variants ready.");

    // 2. Load products_parsed.json for multidimensional products (Limpiador multiusos & Jabón líquido)
    const jsonPath = path.resolve(process.cwd(), "scripts/products_parsed.json");
    let parsedProducts: ParsedProduct[] = [];
    if (fs.existsSync(jsonPath)) {
      parsedProducts = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    }

    // Map multidimensional items grouped by product name
    const multiDimProducts = ["Limpiador multiusos", "Jabón líquido para manos"];
    const multiDimMap = new Map<string, ParsedProduct[]>();

    for (const p of parsedProducts) {
      if (multiDimProducts.includes(p.name) && p.sku) {
        if (!multiDimMap.has(p.name)) {
          multiDimMap.set(p.name, []);
        }
        multiDimMap.get(p.name)!.push(p);
      }
    }

    // 3. Migrate multidimensional products
    let multiCount = 0;
    for (const [prodName, items] of multiDimMap.entries()) {
      const [pRows] = await conn.query<mysql.RowDataPacket[]>(
        "SELECT id, name FROM products WHERE name = ? LIMIT 1",
        [prodName]
      );
      if (pRows.length === 0) continue;
      const productId = pRows[0].id;
      console.log(`Migrating ${items.length} variants for multidimensional product "${prodName}" (id: ${productId})...`);

      let orderIdx = 0;
      for (const it of items) {
        const attrObj: Record<string, string> = {};
        if (it.aroma) attrObj["Aroma"] = it.aroma;
        if (it.presentation) attrObj["Presentación"] = it.presentation;

        const price = it.regular_price && it.regular_price > 0 ? it.regular_price.toFixed(2) : null;

        await conn.query(
          `INSERT INTO product_variants (product_id, sku, price, stock_status, attributes, order_index)
           VALUES (?, ?, ?, 'instock', ?, ?)
           ON DUPLICATE KEY UPDATE
             product_id = VALUES(product_id),
             price = VALUES(price),
             attributes = VALUES(attributes),
             order_index = VALUES(order_index)`,
          [productId, it.sku.trim(), price, JSON.stringify(attrObj), orderIdx++]
        );
        multiCount++;
      }
    }
    console.log(`✓ Inserted/Updated ${multiCount} multidimensional variants.`);

    // 4. Backfill single-dimension products from product_attributes
    console.log("4. Backfilling standard single-dimension products from product_attributes...");
    const [allAttrs] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT pa.*, p.name as product_name
       FROM product_attributes pa
       JOIN products p ON p.id = pa.product_id
       ORDER BY pa.product_id, pa.order_index, pa.id`
    );

    // Group attributes by product_id
    const attrsByProduct = new Map<number, mysql.RowDataPacket[]>();
    for (const a of allAttrs) {
      if (!attrsByProduct.has(a.product_id)) {
        attrsByProduct.set(a.product_id, []);
      }
      attrsByProduct.get(a.product_id)!.push(a);
    }

    let standardCount = 0;
    for (const [productId, attrs] of attrsByProduct.entries()) {
      const productName = attrs[0].product_name;
      // Skip the multidimensional ones we already handled
      if (multiDimProducts.includes(productName)) continue;

      let orderIdx = 0;
      for (const attr of attrs) {
        if (!attr.sku) continue;

        const attrObj: Record<string, string> = {
          [attr.name || "Presentación"]: attr.value,
        };
        const price = attr.attr_price && Number(attr.attr_price) > 0 ? Number(attr.attr_price).toFixed(2) : null;

        await conn.query(
          `INSERT INTO product_variants (product_id, sku, price, stock_status, attributes, order_index)
           VALUES (?, ?, ?, 'instock', ?, ?)
           ON DUPLICATE KEY UPDATE
             product_id = VALUES(product_id),
             price = VALUES(price),
             attributes = VALUES(attributes),
             order_index = VALUES(order_index)`,
          [productId, attr.sku.trim(), price, JSON.stringify(attrObj), orderIdx++]
        );
        standardCount++;
      }
    }
    console.log(`✓ Backfilled ${standardCount} standard variants.`);

    const [totalVariants] = await conn.query<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as c FROM product_variants"
    );
    console.log(`\n🎉 Migration finished! Total variants in database: ${totalVariants[0].c}`);

  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();
