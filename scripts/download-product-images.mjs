import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const TARGET_DIR = path.resolve("public/images/products");

function getSafeFilename(rawUrl, urlToFilename, filenameToUrl) {
  if (urlToFilename.has(rawUrl)) {
    return urlToFilename.get(rawUrl);
  }

  const parsed = new URL(rawUrl);
  let base = decodeURIComponent(path.basename(parsed.pathname));
  base = base.replace(/[^a-zA-Z0-9.\-_]/g, "-").toLowerCase();
  if (!base || !base.includes(".")) {
    base = `img-${Date.now()}.png`;
  }

  const ext = path.extname(base);
  const nameWithoutExt = path.basename(base, ext);

  let finalName = base;
  let counter = 1;
  while (filenameToUrl.has(finalName) && filenameToUrl.get(finalName) !== rawUrl) {
    finalName = `${nameWithoutExt}-${counter++}${ext}`;
  }

  urlToFilename.set(rawUrl, finalName);
  filenameToUrl.set(finalName, rawUrl);
  return finalName;
}

async function downloadFile(url, destPath) {
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
    return true; // Ya descargado
  }

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; KarmaxDownloader/1.0)",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} al descargar ${url}`);
  }

  const fileStream = fs.createWriteStream(destPath);
  await pipeline(res.body, fileStream);
  return true;
}

async function main() {
  console.log("=== INICIANDO DESCARGA Y VINCULACIÓN DE IMÁGENES ===");

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });

  try {
    // 1. Obtener todas las URLs HTTP de `products` y `product_images`
    const [pRows] = await conn.query(
      "SELECT DISTINCT image_url FROM products WHERE image_url LIKE 'http%'"
    );
    const [piRows] = await conn.query(
      "SELECT DISTINCT url FROM product_images WHERE url LIKE 'http%'"
    );

    const allUrls = Array.from(
      new Set([...pRows.map((r) => r.image_url), ...piRows.map((r) => r.url)])
    );

    console.log(`Encontradas ${allUrls.length} URLs de imágenes remotas para descargar.`);

    const urlToFilename = new Map();
    const filenameToUrl = new Map();

    for (const url of allUrls) {
      getSafeFilename(url, urlToFilename, filenameToUrl);
    }

    // 2. Descargar con concurrencia controlada (5 descargas simultáneas)
    const concurrency = 6;
    let downloadedCount = 0;
    let failedCount = 0;
    const failedUrls = [];

    const queue = [...allUrls];
    async function worker() {
      while (queue.length > 0) {
        const url = queue.shift();
        if (!url) break;
        const filename = urlToFilename.get(url);
        const destPath = path.join(TARGET_DIR, filename);

        try {
          await downloadFile(url, destPath);
          downloadedCount++;
          if (downloadedCount % 20 === 0 || downloadedCount === allUrls.length) {
            console.log(`Descargadas: ${downloadedCount}/${allUrls.length}...`);
          }
        } catch (err) {
          failedCount++;
          failedUrls.push({ url, error: err.message });
          console.warn(`[WARN] Error al descargar ${url}: ${err.message}`);
        }
      }
    }

    await Promise.all(Array.from({ length: concurrency }, () => worker()));

    console.log(`\nDescarga finalizada. Éxitos: ${downloadedCount}, Fallos: ${failedCount}`);

    // 3. Actualizar rutas en la base de datos para todas las URLs que se descargaron
    console.log("\nActualizando rutas en la base de datos...");
    let updatedProducts = 0;
    let updatedProductImages = 0;

    for (const [url, filename] of urlToFilename.entries()) {
      const localPath = `/images/products/${filename}`;
      const destPath = path.join(TARGET_DIR, filename);

      if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
        // Actualizar en `products`
        const [pRes] = await conn.query(
          "UPDATE products SET image_url = ? WHERE image_url = ?",
          [localPath, url]
        );
        updatedProducts += pRes.affectedRows;

        // Actualizar en `product_images`
        const [piRes] = await conn.query(
          "UPDATE product_images SET url = ? WHERE url = ?",
          [localPath, url]
        );
        updatedProductImages += piRes.affectedRows;
      }
    }

    console.log(`✓ Registros actualizados en 'products': ${updatedProducts}`);
    console.log(`✓ Registros actualizados en 'product_images': ${updatedProductImages}`);

    if (failedUrls.length > 0) {
      console.log(`\nURLs que no se pudieron descargar (${failedUrls.length}):`);
      failedUrls.forEach((f) => console.log(` - ${f.url}: ${f.error}`));
    }

    console.log("\n=== PROCESO COMPLETADO EXITOSAMENTE ===");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("Error general:", err);
  process.exit(1);
});
