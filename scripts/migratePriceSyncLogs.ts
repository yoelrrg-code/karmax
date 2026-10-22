import path from "node:path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  console.log("🚀 Starting database migration for price_sync_logs table...");

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "u162902148_karmax",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });

  try {
    console.log("Creating table price_sync_logs if not exists...");
    await conn.query(`
      CREATE TABLE IF NOT EXISTS price_sync_logs (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        status VARCHAR(50) NOT NULL,
        trigger_type VARCHAR(50) NOT NULL DEFAULT 'cron',
        sheet_url TEXT NULL,
        total_rows INT NOT NULL DEFAULT 0,
        updated_products INT NOT NULL DEFAULT 0,
        updated_attributes INT NOT NULL DEFAULT 0,
        updated_variants INT NOT NULL DEFAULT 0,
        not_found_count INT NOT NULL DEFAULT 0,
        duration_ms INT NOT NULL DEFAULT 0,
        message TEXT NULL,
        error_details TEXT NULL,
        details JSON NULL,
        executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_price_sync_status (status),
        INDEX idx_price_sync_trigger (trigger_type),
        INDEX idx_price_sync_executed_at (executed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ Table price_sync_logs ready.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();
