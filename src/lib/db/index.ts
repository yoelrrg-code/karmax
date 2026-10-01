import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

interface GlobalWithDb {
  __karmax_mysql_pool?: mysql.Pool;
  __karmax_drizzle_db?: MySql2Database<typeof schema>;
}

const globalForDb = globalThis as unknown as GlobalWithDb;

function createConnectionPool(): mysql.Pool {
  const host = process.env.DB_HOST || "127.0.0.1";
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "karmax_catalog";
  const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT) || 20;

  return mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 100,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    // DreamHost MySQL a veces requiere SSL o certificados según configuración
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
}

export const pool = globalForDb.__karmax_mysql_pool ?? createConnectionPool();
globalForDb.__karmax_mysql_pool = pool;

export const db = globalForDb.__karmax_drizzle_db ?? drizzle(pool, { schema, mode: "default" });
globalForDb.__karmax_drizzle_db = db;

export * from "./schema";
