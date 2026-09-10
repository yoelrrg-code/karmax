import path from "node:path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  console.log("🚀 Starting database migration for product attributes, delivery info, and documents...");

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "karmax_catalog",
  });

  try {
    // 1. Check and add delivery_info column to products
    console.log("1. Checking column delivery_info in products table...");
    const [prodCols] = await conn.query<mysql.RowDataPacket[]>(
      "SHOW COLUMNS FROM products LIKE 'delivery_info'"
    );
    if (prodCols.length === 0) {
      console.log("Adding column delivery_info to products table...");
      await conn.query("ALTER TABLE products ADD COLUMN delivery_info TEXT NULL AFTER post_date");
      console.log("✓ Column delivery_info added successfully.");
    } else {
      console.log("✓ Column delivery_info already exists.");
    }

    // 2. Create product_attributes table
    console.log("2. Creating product_attributes table if not exists...");
    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_attributes (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        product_id BIGINT UNSIGNED NOT NULL,
        name VARCHAR(150) NOT NULL,
        value VARCHAR(255) NOT NULL,
        order_index INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_prod_attr_product (product_id),
        INDEX idx_prod_attr_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ Table product_attributes ready.");

    // 3. Create product_documents table
    console.log("3. Creating product_documents table if not exists...");
    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_documents (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        product_id BIGINT UNSIGNED NOT NULL,
        title VARCHAR(255) NOT NULL,
        file_url VARCHAR(1024) NOT NULL,
        file_type VARCHAR(50) NOT NULL DEFAULT 'pdf',
        file_size VARCHAR(50) NULL,
        order_index INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_prod_doc_product (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ Table product_documents ready.");

    console.log("\n🎉 Database migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();
