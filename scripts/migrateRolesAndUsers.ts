import path from "node:path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  console.log("🚀 Starting database migration for roles, users, and quote extensions...");

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "karmax_catalog",
  });

  try {
    // 1. Create roles table
    console.log("1. Creating roles table if not exists...");
    await conn.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ Table roles ready.");

    // Seed default roles
    console.log("Seeding default roles (admin, cliente)...");
    await conn.query(`
      INSERT INTO roles (id, name, description)
      VALUES 
        (1, 'admin', 'Administrador del sistema Karmax'),
        (2, 'cliente', 'Cliente comercial / cotizante')
      ON DUPLICATE KEY UPDATE description = VALUES(description);
    `);
    console.log("✓ Default roles seeded.");

    // 2. Create users table
    console.log("2. Creating users table if not exists...");
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        role_id BIGINT UNSIGNED NOT NULL DEFAULT 2,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50) NULL,
        company_name VARCHAR(255) NULL,
        password_hash VARCHAR(255) NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_role (role_id),
        INDEX idx_users_email (email),
        CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ Table users ready.");

    // 3. Update quote_requests columns
    console.log("3. Checking and extending quote_requests table...");
    const [qrCols] = await conn.query<mysql.RowDataPacket[]>("SHOW COLUMNS FROM quote_requests");
    const qrColNames = qrCols.map((c) => c.Field);

    if (!qrColNames.includes("user_id")) {
      await conn.query(`
        ALTER TABLE quote_requests 
        ADD COLUMN user_id BIGINT UNSIGNED NULL AFTER id,
        ADD INDEX idx_quote_requests_user (user_id)
      `);
      console.log("✓ Added user_id to quote_requests.");
    }

    if (!qrColNames.includes("quote_number")) {
      await conn.query("ALTER TABLE quote_requests ADD COLUMN quote_number VARCHAR(50) NULL AFTER id");
      console.log("✓ Added quote_number to quote_requests.");
    }

    if (!qrColNames.includes("subtotal")) {
      await conn.query("ALTER TABLE quote_requests ADD COLUMN subtotal DECIMAL(10,2) NULL AFTER notes");
      console.log("✓ Added subtotal to quote_requests.");
    }

    if (!qrColNames.includes("tax")) {
      await conn.query("ALTER TABLE quote_requests ADD COLUMN tax DECIMAL(10,2) NULL AFTER subtotal");
      console.log("✓ Added tax to quote_requests.");
    }

    if (!qrColNames.includes("total")) {
      await conn.query("ALTER TABLE quote_requests ADD COLUMN total DECIMAL(10,2) NULL AFTER tax");
      console.log("✓ Added total to quote_requests.");
    }

    // 4. Update quote_items columns
    console.log("4. Checking and extending quote_items table...");
    const [qiCols] = await conn.query<mysql.RowDataPacket[]>("SHOW COLUMNS FROM quote_items");
    const qiColNames = qiCols.map((c) => c.Field);

    if (!qiColNames.includes("presentation")) {
      await conn.query("ALTER TABLE quote_items ADD COLUMN presentation VARCHAR(100) NULL AFTER product_name");
      console.log("✓ Added presentation to quote_items.");
    }

    if (!qiColNames.includes("sku")) {
      await conn.query("ALTER TABLE quote_items ADD COLUMN sku VARCHAR(100) NULL AFTER presentation");
      console.log("✓ Added sku to quote_items.");
    }

    if (!qiColNames.includes("image_url")) {
      await conn.query("ALTER TABLE quote_items ADD COLUMN image_url VARCHAR(1024) NULL AFTER sku");
      console.log("✓ Added image_url to quote_items.");
    }

    if (!qiColNames.includes("unit_price")) {
      await conn.query("ALTER TABLE quote_items ADD COLUMN unit_price DECIMAL(10,2) NULL AFTER quantity");
      console.log("✓ Added unit_price to quote_items.");
    }

    if (!qiColNames.includes("total_price")) {
      await conn.query("ALTER TABLE quote_items ADD COLUMN total_price DECIMAL(10,2) NULL AFTER unit_price");
      console.log("✓ Added total_price to quote_items.");
    }

    console.log("\n🎉 Database migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();
