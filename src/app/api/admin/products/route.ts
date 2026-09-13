import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import {
  db,
  products,
  categories,
  productCategories,
  productIndustries,
  productImages,
  productAttributes,
  productDocuments,
} from "@/lib/db";
import { desc, eq, like, or, and, sql, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const categoryId = searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined;
    const isActiveParam = searchParams.get("isActive");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (isActiveParam !== null && isActiveParam !== undefined && isActiveParam !== "all") {
      conditions.push(eq(products.isActive, isActiveParam === "true"));
    }

    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(
          like(products.name, term),
          like(products.sku, term),
          like(products.brand, term),
          like(products.description, term)
        )!
      );
    }

    const [countRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countRes?.count || 0);

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        sku: products.sku,
        brand: products.brand,
        unit: products.unit,
        regularPrice: products.regularPrice,
        salePrice: products.salePrice,
        imageUrl: products.imageUrl,
        stockStatus: products.stockStatus,
        isFeatured: products.isFeatured,
        isActive: products.isActive,
        categoryId: products.categoryId,
        categoryName: categories.name,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(products.id))
      .limit(limit)
      .offset(offset);

    // Variation counts for returned products
    const productIds = rows.map((r) => r.id);
    const attrCountMap: Record<number, number> = {};

    if (productIds.length > 0) {
      const attrCounts = await db
        .select({
          productId: productAttributes.productId,
          count: sql<number>`count(*)`,
        })
        .from(productAttributes)
        .where(inArray(productAttributes.productId, productIds))
        .groupBy(productAttributes.productId);

      for (const a of attrCounts) {
        attrCountMap[a.productId] = Number(a.count);
      }
    }

    const productsWithStats = rows.map((r) => ({
      ...r,
      variationCount: attrCountMap[r.id] || 0,
    }));

    return NextResponse.json({
      products: productsWithStats,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/products:", error);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const {
      name,
      slug: customSlug,
      sku,
      brand = "KARMAX",
      unit = "Pieza",
      categoryId,
      regularPrice,
      salePrice,
      stockStatus = "instock",
      isFeatured = false,
      isActive = true,
      shortDescription,
      description,
      deliveryInfo,
      imageUrl,
      categoryIds = [],
      industryIds = [],
      images = [],
      attributes = [],
      documents = [],
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "El nombre del producto es obligatorio" }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ error: "Debe seleccionar una categoría principal" }, { status: 400 });
    }

    // Generate unique slug
    let finalSlug = slugify(customSlug?.trim() || name.trim());
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, finalSlug))
      .limit(1);

    if (existing) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    // Insert base product
    const [insertResult] = await db.insert(products).values({
      name: name.trim(),
      slug: finalSlug,
      sku: sku?.trim() || null,
      brand: brand?.trim() || "KARMAX",
      unit: unit?.trim() || "Pieza",
      categoryId: Number(categoryId),
      regularPrice: regularPrice ? String(regularPrice) : null,
      salePrice: salePrice && Number(salePrice) > 0 ? String(salePrice) : null,
      stockStatus,
      isFeatured: Boolean(isFeatured),
      isActive: Boolean(isActive),
      shortDescription: shortDescription || null,
      description: description || null,
      deliveryInfo: deliveryInfo || null,
      imageUrl:
        Array.isArray(images) && images.length > 0
          ? (images as Array<{ isPrimary?: boolean; url: string }>).find((img) => Boolean(img.isPrimary))?.url || images[0]?.url || imageUrl || "/images/products/placeholder.jpg"
          : imageUrl || "/images/products/placeholder.jpg",
    });

    const productId = Number(insertResult.insertId);

    // Sync categories (product_categories)
    const allCatIds = Array.from(new Set([Number(categoryId), ...categoryIds.map(Number)])).filter(Boolean);
    for (const cId of allCatIds) {
      await db.insert(productCategories).values({
        productId,
        categoryId: cId,
      });
    }

    // Sync industries (product_industries)
    if (Array.isArray(industryIds) && industryIds.length > 0) {
      for (const indId of industryIds.map(Number).filter(Boolean)) {
        await db.insert(productIndustries).values({
          productId,
          industryId: indId,
        });
      }
    }

    // Sync images (product_images)
    if (Array.isArray(images) && images.length > 0) {
      const explicitPrimaryIndex = (images as Array<{ isPrimary?: boolean }>).findIndex((img) => Boolean(img.isPrimary));
      const targetPrimaryIndex = explicitPrimaryIndex >= 0 ? explicitPrimaryIndex : 0;

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await db.insert(productImages).values({
          productId,
          url: img.url,
          alt: img.alt || name,
          title: img.title || name,
          isPrimary: i === targetPrimaryIndex,
          orderIndex: i,
        });
      }
    }

    // Sync attributes (product_attributes)
    if (Array.isArray(attributes) && attributes.length > 0) {
      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        await db.insert(productAttributes).values({
          productId,
          name: attr.name?.trim() || "Presentaciones",
          value: attr.value?.trim() || "",
          sku: attr.sku?.trim() || null,
          attrPrice: attr.attrPrice ? String(attr.attrPrice) : null,
          orderIndex: i,
        });
      }
    }

    // Sync documents (product_documents)
    if (Array.isArray(documents) && documents.length > 0) {
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        await db.insert(productDocuments).values({
          productId,
          title: doc.title || "Ficha Técnica",
          fileUrl: doc.fileUrl,
          fileType: doc.fileType || "pdf",
          fileSize: doc.fileSize || "PDF",
          orderIndex: i,
        });
      }
    }

    return NextResponse.json({
      success: true,
      productId,
      slug: finalSlug,
      message: "Producto creado exitosamente",
    });
  } catch (error) {
    console.error("Error in POST /api/admin/products:", error);
    return NextResponse.json({ error: "Error al crear el producto" }, { status: 500 });
  }
}
