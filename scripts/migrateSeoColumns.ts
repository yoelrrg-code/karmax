import path from "node:path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function addColumnIfNotExists(
  conn: mysql.Connection,
  table: string,
  column: string,
  definition: string
) {
  try {
    const [rows] = await conn.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [process.env.DB_NAME || "karmax_catalog", table, column]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      console.log(`  - Column ${table}.${column} already exists.`);
      return;
    }

    console.log(`  + Adding column ${table}.${column}...`);
    await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    console.log(`  ✓ Added ${table}.${column}`);
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error.code === "ER_DUP_FIELDNAME") {
      console.log(`  - Column ${table}.${column} already exists (duplicate detected).`);
    } else {
      console.error(`  ✕ Error adding ${table}.${column}:`, error.message);
    }
  }
}

async function main() {
  console.log("🚀 Starting database migration for SEO columns...");

  let conn: mysql.Connection | null = null;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "karmax_catalog",
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });

    console.log("Checking categories table...");
    await addColumnIfNotExists(conn, "categories", "meta_title", "VARCHAR(255) NULL");
    await addColumnIfNotExists(conn, "categories", "meta_description", "TEXT NULL");

    console.log("Checking products table...");
    await addColumnIfNotExists(conn, "products", "meta_title", "VARCHAR(255) NULL");
    await addColumnIfNotExists(conn, "products", "meta_description", "TEXT NULL");
    await addColumnIfNotExists(conn, "products", "meta_keywords", "VARCHAR(500) NULL");

    console.log("Checking industries table...");
    await addColumnIfNotExists(conn, "industries", "meta_title", "VARCHAR(255) NULL");
    await addColumnIfNotExists(conn, "industries", "meta_description", "TEXT NULL");

    console.log("✓ Migration for SEO columns completed successfully.");
  } catch (error) {
    console.warn("⚠️ Warning during migration (database may be unreachable or offline):", error);
  } finally {
    if (conn) {
      await conn.end();
    }
  }
}

main();
