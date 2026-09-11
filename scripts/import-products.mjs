import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function runImport() {
  console.log("=== INICIANDO IMPORTACIÓN DE PRODUCTOS ===");
  
  const jsonPath = path.resolve("scripts/products_parsed.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`No se encontró el archivo ${jsonPath}`);
  }

  const rawData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  console.log(`Leídas ${rawData.length} filas del archivo.`);

  // Agrupar filas por nombre de producto
  const productsGrouped = new Map();
  for (const row of rawData) {
    const name = row.name.trim();
    if (!name) continue;
    if (!productsGrouped.has(name)) {
      productsGrouped.set(name, []);
    }
    productsGrouped.get(name).push(row);
  }

  console.log(`Total de productos únicos a insertar: ${productsGrouped.size}`);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });

  try {
    let insertedProductsCount = 0;
    let insertedAttributesCount = 0;
    let insertedImagesCount = 0;

    const usedSlugs = new Set();

    for (const [name, rows] of productsGrouped.entries()) {
      const baseRow = rows[0];

      // Generar slug único
      let baseSlug = slugify(name);
      let uniqueSlug = baseSlug;
      let counter = 2;
      while (usedSlugs.has(uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${counter++}`;
      }
      usedSlugs.add(uniqueSlug);

      // Imagen principal
      const primaryImage =
        baseRow.gallery && baseRow.gallery.length > 0
          ? baseRow.gallery[0]
          : "/images/products/placeholder.jpg";

      // 1. Insertar producto base en `products`
      const [pRes] = await conn.query(
        `INSERT INTO products (
          category_id, name, slug, sku, brand, unit,
          short_description, description, image_url, regular_price,
          stock_status, post_status, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'instock', 'publish', 1)`,
        [
          baseRow.category_id,
          name,
          uniqueSlug,
          baseRow.sku,
          baseRow.brand || "KARMAX",
          "Pieza",
          baseRow.short_description || null,
          baseRow.description || null,
          primaryImage,
          baseRow.regular_price > 0 ? baseRow.regular_price : null,
        ]
      );

      const productId = pRes.insertId;
      insertedProductsCount++;

      // 2. Asociar producto con categoría en `product_categories`
      await conn.query(
        `INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)`,
        [productId, baseRow.category_id]
      );

      // 3. Insertar imágenes de la galería en `product_images`
      if (baseRow.gallery && baseRow.gallery.length > 0) {
        for (let idx = 0; idx < baseRow.gallery.length; idx++) {
          const imgUrl = baseRow.gallery[idx];
          await conn.query(
            `INSERT INTO product_images (product_id, url, alt, title, is_primary, order_index)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              productId,
              imgUrl,
              `${name} imagen ${idx + 1}`,
              name,
              idx === 0 ? 1 : 0,
              idx,
            ]
          );
          insertedImagesCount++;
        }
      }

      // 4. Insertar atributos dinámicos en `product_attributes`
      const seenAttrs = new Set();
      let attrOrder = 0;

      for (const r of rows) {
        // Atributo Aroma (Columna E)
        if (r.aroma) {
          const aromaKey = `Aroma:${r.aroma}`;
          if (!seenAttrs.has(aromaKey)) {
            seenAttrs.add(aromaKey);
            await conn.query(
              `INSERT INTO product_attributes (product_id, name, value, sku, attr_price, order_index)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                productId,
                "Aroma",
                r.aroma,
                r.sku || null,
                r.regular_price > 0 ? r.regular_price : null,
                attrOrder++,
              ]
            );
            insertedAttributesCount++;
          }
        }

        // Atributo Presentación (Columna F)
        if (r.presentation) {
          const presKey = `Presentaciones:${r.presentation}`;
          if (!seenAttrs.has(presKey)) {
            seenAttrs.add(presKey);
            await conn.query(
              `INSERT INTO product_attributes (product_id, name, value, sku, attr_price, order_index)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                productId,
                "Presentaciones",
                r.presentation,
                r.sku || null,
                r.regular_price > 0 ? r.regular_price : null,
                attrOrder++,
              ]
            );
            insertedAttributesCount++;
          }
        }
      }

      if (insertedProductsCount % 20 === 0 || insertedProductsCount === productsGrouped.size) {
        console.log(`Progreso: ${insertedProductsCount}/${productsGrouped.size} productos importados...`);
      }
    }

    console.log("\n=== IMPORTACIÓN COMPLETADA EXITOSAMENTE ===");
    console.log(`✓ Productos insertados: ${insertedProductsCount}`);
    console.log(`✓ Imágenes vinculadas: ${insertedImagesCount}`);
    console.log(`✓ Atributos/variaciones insertados: ${insertedAttributesCount}`);

  } finally {
    await conn.end();
  }
}

runImport().catch((err) => {
  console.error("Error durante la importación:", err);
  process.exit(1);
});
