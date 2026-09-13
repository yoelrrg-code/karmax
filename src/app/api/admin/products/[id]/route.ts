import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import {
  db,
  products,
  productCategories,
  productIndustries,
  productImages,
  productAttributes,
  productDocuments,
} from "@/lib/db";
import { eq, asc } from "drizzle-orm";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const [catRows, indRows, images, attributes, documents] = await Promise.all([
      db
        .select({ categoryId: productCategories.categoryId })
        .from(productCategories)
        .where(eq(productCategories.productId, productId)),
      db
        .select({ industryId: productIndustries.industryId })
        .from(productIndustries)
        .where(eq(productIndustries.productId, productId)),
      db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, productId))
        .orderBy(asc(productImages.orderIndex)),
      db
        .select()
        .from(productAttributes)
        .where(eq(productAttributes.productId, productId))
        .orderBy(asc(productAttributes.orderIndex), asc(productAttributes.id)),
      db
        .select()
        .from(productDocuments)
        .where(eq(productDocuments.productId, productId))
        .orderBy(asc(productDocuments.orderIndex)),
    ]);

    return NextResponse.json({
      product,
      categoryIds: Array.from(new Set([product.categoryId, ...catRows.map((c) => c.categoryId)])),
      industryIds: indRows.map((i) => i.industryId),
      images,
      attributes,
      documents,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/products/[id]:", error);
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const {
      name,
      slug: customSlug,
      sku,
      brand,
      unit,
      categoryId,
      regularPrice,
      salePrice,
      stockStatus,
      isFeatured,
      isActive,
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

    const finalSlug = customSlug?.trim() ? slugify(customSlug.trim()) : slugify(name.trim());

    // 1. Update base product
    await db
      .update(products)
      .set({
        name: name.trim(),
        slug: finalSlug,
        sku: sku?.trim() || null,
        brand: brand?.trim() || "KARMAX",
        unit: unit?.trim() || "Pieza",
        categoryId: categoryId ? Number(categoryId) : undefined,
        regularPrice: regularPrice !== undefined ? (regularPrice ? String(regularPrice) : null) : undefined,
        salePrice: salePrice !== undefined ? (salePrice && Number(salePrice) > 0 ? String(salePrice) : null) : undefined,
        stockStatus: stockStatus || "instock",
        isFeatured: Boolean(isFeatured),
        isActive: Boolean(isActive),
        shortDescription: shortDescription || null,
        description: description || null,
        deliveryInfo: deliveryInfo || null,
        imageUrl:
          Array.isArray(images) && images.length > 0
            ? (images as Array<{ isPrimary?: boolean; url: string }>).find((img) => Boolean(img.isPrimary))?.url || images[0]?.url || imageUrl || "/images/products/placeholder.jpg"
            : imageUrl || "/images/products/placeholder.jpg",
      })
      .where(eq(products.id, productId));

    // 2. Sync product_categories
    await db.delete(productCategories).where(eq(productCategories.productId, productId));
    const allCatIds = Array.from(new Set([Number(categoryId), ...categoryIds.map(Number)])).filter(Boolean);
    for (const cId of allCatIds) {
      await db.insert(productCategories).values({
        productId,
        categoryId: cId,
      });
    }

    // 3. Sync product_industries
    await db.delete(productIndustries).where(eq(productIndustries.productId, productId));
    if (Array.isArray(industryIds) && industryIds.length > 0) {
      for (const indId of industryIds.map(Number).filter(Boolean)) {
        await db.insert(productIndustries).values({
          productId,
          industryId: indId,
        });
      }
    }

    // 4. Sync product_images
    await db.delete(productImages).where(eq(productImages.productId, productId));
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

    // 5. Sync product_attributes
    await db.delete(productAttributes).where(eq(productAttributes.productId, productId));
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

    // 6. Sync product_documents
    await db.delete(productDocuments).where(eq(productDocuments.productId, productId));
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
      message: "Producto actualizado correctamente",
    });
  } catch (error) {
    console.error("Error in PUT /api/admin/products/[id]:", error);
    return NextResponse.json({ error: "Error al actualizar el producto" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Soft delete / deactivate by default or complete delete
    const searchParams = request.nextUrl.searchParams;
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      await db.delete(productCategories).where(eq(productCategories.productId, productId));
      await db.delete(productIndustries).where(eq(productIndustries.productId, productId));
      await db.delete(productImages).where(eq(productImages.productId, productId));
      await db.delete(productAttributes).where(eq(productAttributes.productId, productId));
      await db.delete(productDocuments).where(eq(productDocuments.productId, productId));
      await db.delete(products).where(eq(products.id, productId));
      return NextResponse.json({ success: true, message: "Producto eliminado permanentemente" });
    } else {
      await db
        .update(products)
        .set({ isActive: false })
        .where(eq(products.id, productId));
      return NextResponse.json({ success: true, message: "Producto desactivado con éxito" });
    }
  } catch (error) {
    console.error("Error in DELETE /api/admin/products/[id]:", error);
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 });
  }
}
