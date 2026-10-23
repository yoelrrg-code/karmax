import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import {
  db,
  products,
  productCategories,
  productIndustries,
  productImages,
  productAttributes,
  productVariants,
  productDocuments,
  quoteItems,
} from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { recordAuditLog } from "@/lib/services/auditService";

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

    const [catRows, indRows, images, attributes, variants, documents] = await Promise.all([
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
        .from(productVariants)
        .where(eq(productVariants.productId, productId))
        .orderBy(asc(productVariants.orderIndex), asc(productVariants.id)),
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
      variants: variants.map((v) => ({
        ...v,
        attributes: typeof v.attributes === "string" ? JSON.parse(v.attributes) : v.attributes,
      })),
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
      metaTitle,
      metaDescription,
      metaKeywords,
      categoryIds = [],
      industryIds = [],
      images = [],
      attributes = [],
      variants,
      documents = [],
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "El nombre del producto es obligatorio" }, { status: 400 });
    }

    const finalSlug = customSlug?.trim() ? slugify(customSlug.trim()) : slugify(name.trim());

    // 1. Ejecución atómica en Transacción para evitar pérdida de datos y estados inconsistentes
    await db.transaction(async (tx) => {
      // 1. Update base product
      await tx
        .update(products)
        .set({
          name: name.trim(),
          slug: finalSlug,
          sku: sku?.trim() || null,
          brand: brand !== undefined ? (brand?.trim() || null) : undefined,
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
          metaTitle: metaTitle !== undefined ? (metaTitle?.trim() || null) : undefined,
          metaDescription: metaDescription !== undefined ? (metaDescription?.trim() || null) : undefined,
          metaKeywords: metaKeywords !== undefined ? (metaKeywords?.trim() || null) : undefined,
          imageUrl:
            Array.isArray(images) && images.length > 0
              ? (images as Array<{ isPrimary?: boolean; url: string }>).find((img) => Boolean(img.isPrimary))?.url || images[0]?.url || imageUrl || "/images/products/placeholder.jpg"
              : imageUrl || "/images/products/placeholder.jpg",
        })
        .where(eq(products.id, productId));

      // 2. Sync product_categories (Bulk Insert)
      await tx.delete(productCategories).where(eq(productCategories.productId, productId));
      const allCatIds = Array.from(new Set([Number(categoryId), ...categoryIds.map(Number)])).filter(Boolean);
      if (allCatIds.length > 0) {
        await tx.insert(productCategories).values(
          allCatIds.map((cId) => ({
            productId,
            categoryId: cId,
          }))
        );
      }

      // 3. Sync product_industries (Bulk Insert)
      await tx.delete(productIndustries).where(eq(productIndustries.productId, productId));
      if (Array.isArray(industryIds) && industryIds.length > 0) {
        const validIndIds = industryIds.map(Number).filter(Boolean);
        if (validIndIds.length > 0) {
          await tx.insert(productIndustries).values(
            validIndIds.map((indId) => ({
              productId,
              industryId: indId,
            }))
          );
        }
      }

      // 4. Sync product_images (Bulk Insert)
      await tx.delete(productImages).where(eq(productImages.productId, productId));
      if (Array.isArray(images) && images.length > 0) {
        const explicitPrimaryIndex = (images as Array<{ isPrimary?: boolean }>).findIndex((img) => Boolean(img.isPrimary));
        const targetPrimaryIndex = explicitPrimaryIndex >= 0 ? explicitPrimaryIndex : 0;

        await tx.insert(productImages).values(
          images.map((img, i) => ({
            productId,
            url: img.url,
            alt: img.alt || name,
            title: img.title || name,
            isPrimary: i === targetPrimaryIndex,
            orderIndex: i,
          }))
        );
      }

      // 5. Sync product_attributes (Bulk Insert)
      await tx.delete(productAttributes).where(eq(productAttributes.productId, productId));
      if (Array.isArray(attributes) && attributes.length > 0) {
        await tx.insert(productAttributes).values(
          attributes.map((attr, i) => ({
            productId,
            name: attr.name?.trim() || "Presentaciones",
            value: attr.value?.trim() || "",
            sku: attr.sku?.trim() || null,
            attrPrice: attr.attrPrice ? String(attr.attrPrice) : null,
            orderIndex: i,
          }))
        );
      }

      // 5b. Sync product_variants (Bulk Insert con parsing seguro de JSON)
      if (Array.isArray(variants)) {
        await tx.delete(productVariants).where(eq(productVariants.productId, productId));
        const validVariants = variants.filter((v) => v && v.sku?.trim());
        if (validVariants.length > 0) {
          await tx.insert(productVariants).values(
            validVariants.map((v, i) => {
              let parsedAttrs = {};
              if (typeof v.attributes === "string") {
                try {
                  parsedAttrs = JSON.parse(v.attributes);
                } catch {
                  parsedAttrs = {};
                }
              } else if (v.attributes && typeof v.attributes === "object") {
                parsedAttrs = v.attributes;
              }

              return {
                productId,
                sku: v.sku.trim(),
                price: v.price ? String(v.price) : null,
                stockStatus: v.stockStatus || "instock",
                attributes: parsedAttrs,
                orderIndex: i,
              };
            })
          );
        }
      }

      // 6. Sync product_documents (Bulk Insert)
      await tx.delete(productDocuments).where(eq(productDocuments.productId, productId));
      if (Array.isArray(documents) && documents.length > 0) {
        await tx.insert(productDocuments).values(
          documents.map((doc, i) => ({
            productId,
            title: doc.title || "Ficha Técnica",
            fileUrl: doc.fileUrl,
            fileType: doc.fileType || "pdf",
            fileSize: doc.fileSize || "PDF",
            orderIndex: i,
          }))
        );
      }
    });

    // Auditoría de actualización de producto
    await recordAuditLog({
      userId: auth.user?.id,
      userName: auth.user?.name || "Admin",
      userEmail: auth.user?.email || "admin@karmax.mx",
      action: "ACTUALIZAR",
      module: "Productos",
      targetId: productId,
      targetName: name?.trim() || `Producto #${productId}`,
      details: { categoryId, regularPrice, salePrice, stockStatus, isFeatured, isActive },
      request,
    });

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

    const searchParams = request.nextUrl.searchParams;
    const isDeactivateOnly = searchParams.get("deactivate") === "true";

    if (isDeactivateOnly) {
      await db
        .update(products)
        .set({ isActive: false })
        .where(eq(products.id, productId));
      return NextResponse.json({ success: true, message: "Producto desactivado con éxito" });
    }

    // 1. Validar si el producto está vinculado a alguna cotización
    const [existingQuoteItem] = await db
      .select({ id: quoteItems.id })
      .from(quoteItems)
      .where(eq(quoteItems.productId, productId))
      .limit(1);

    if (existingQuoteItem) {
      return NextResponse.json(
        {
          error: "El producto está en una cotización y no puede ser eliminado",
          inQuote: true,
        },
        { status: 409 }
      );
    }

    // 2. Eliminación atómica en Transacción de relaciones y producto
    await db.transaction(async (tx) => {
      await tx.delete(productCategories).where(eq(productCategories.productId, productId));
      await tx.delete(productIndustries).where(eq(productIndustries.productId, productId));
      await tx.delete(productImages).where(eq(productImages.productId, productId));
      await tx.delete(productAttributes).where(eq(productAttributes.productId, productId));
      await tx.delete(productVariants).where(eq(productVariants.productId, productId));
      await tx.delete(productDocuments).where(eq(productDocuments.productId, productId));
      await tx.delete(products).where(eq(products.id, productId));
    });

    // Auditoría de eliminación de producto
    await recordAuditLog({
      userId: auth.user?.id,
      userName: auth.user?.name || "Admin",
      userEmail: auth.user?.email || "admin@karmax.mx",
      action: "ELIMINAR",
      module: "Productos",
      targetId: productId,
      request,
    });

    return NextResponse.json({ success: true, message: "Producto eliminado permanentemente" });
  } catch (error) {
    console.error("Error in DELETE /api/admin/products/[id]:", error);
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 });
  }
}

export async function PATCH(
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
    const updateData: Record<string, unknown> = {};

    if ("brand" in body) {
      updateData.brand = body.brand && String(body.brand).trim() ? String(body.brand).trim() : null;
    }
    if ("isActive" in body) {
      updateData.isActive = Boolean(body.isActive);
    }
    if ("isFeatured" in body) {
      updateData.isFeatured = Boolean(body.isFeatured);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron campos válidos para actualizar" },
        { status: 400 }
      );
    }

    await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, productId));

    // Auditoría de actualización rápida (PATCH)
    await recordAuditLog({
      userId: auth.user?.id,
      userName: auth.user?.name || "Admin",
      userEmail: auth.user?.email || "admin@karmax.mx",
      action: "ACTUALIZAR",
      module: "Productos",
      targetId: productId,
      details: updateData,
      request,
    });

    return NextResponse.json({
      success: true,
      message: "Producto actualizado con éxito",
      data: updateData,
    });
  } catch (error) {
    console.error("Error in PATCH /api/admin/products/[id]:", error);
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 });
  }
}

