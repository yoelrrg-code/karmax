import { NextResponse } from "next/server";
import {
  db,
  quoteRequests,
  quoteItems,
  users,
  products,
  productVariants,
  productAttributes,
} from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { eq, and, desc, inArray } from "drizzle-orm";
import { getNextQuoteNumber } from "@/lib/quotes/consecutive";
import { sendQuoteEmails } from "@/lib/email/mailer";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { verifyAntiBot } from "@/lib/security/antiBot";
import { getTaxSettings } from "@/lib/services/karmaxService";

export const dynamic = "force-dynamic";

interface QuoteItemPayload {
  productId?: number;
  productName: string;
  presentation?: string;
  sku?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// GET /api/quotes - Devuelve el historial de cotizaciones del usuario autenticado
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "No autenticado", quotes: [] },
        { status: 401 }
      );
    }

    const quotes = await db
      .select()
      .from(quoteRequests)
      .where(eq(quoteRequests.userId, session.userId))
      .orderBy(desc(quoteRequests.id));

    const quoteIds = quotes.map((q) => q.id);
    const itemsMap: Record<number, typeof quoteItems.$inferSelect[]> = {};

    if (quoteIds.length > 0) {
      const items = await db
        .select()
        .from(quoteItems)
        .where(inArray(quoteItems.quoteRequestId, quoteIds));

      for (const it of items) {
        if (!itemsMap[it.quoteRequestId]) {
          itemsMap[it.quoteRequestId] = [];
        }
        itemsMap[it.quoteRequestId].push(it);
      }
    }

    const quotesWithItems = quotes.map((q) => ({
      ...q,
      items: itemsMap[q.id] || [],
    }));

    return NextResponse.json({ quotes: quotesWithItems });
  } catch (error) {
    console.error("Error fetching user quotes:", error);
    return NextResponse.json(
      { error: "Error al obtener cotizaciones", quotes: [] },
      { status: 500 }
    );
  }
}

// POST /api/quotes - Guarda o envía una cotización
export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // 1. Rate Limiting: máximo 10 cotizaciones por 10 minutos por IP
    const rateCheck = checkRateLimit(clientIp, "quotes_post", {
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Demasiadas solicitudes. Por favor intenta de nuevo en ${rateCheck.resetInSec} segundos.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      savedQuoteId,
      notes,
      subtotal,
      tax,
      total,
      items,
      action = "send", // 'save' | 'send'
      antiBotToken,
      honeypot,
      turnstileToken,
    } = body;

    // 2. Verificación Anti-Bot / Captcha Invisible
    const botCheck = await verifyAntiBot({
      token: antiBotToken,
      honeypot,
      turnstileToken,
      clientIp,
    });
    if (!botCheck.valid) {
      return NextResponse.json(
        { error: botCheck.reason || "Verificación de seguridad requerida." },
        { status: 400 }
      );
    }

    // 3. Verificación de sesión (nunca confiar en body.userId no autenticado)
    const session = await getSessionUser();
    const userId = session?.userId || null;
    let customerName = "Cliente";
    let companyName = "";
    let email = "cliente@karmax.com";
    let phone = "N/A";
    let userDiscountPercentage = 0;

    if (userId) {
      const [userRecord] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userRecord) {
        customerName = userRecord.name;
        companyName = userRecord.companyName || "";
        email = userRecord.email;
        phone = userRecord.phone || "";
        userDiscountPercentage = Number(userRecord.discountPercentage || 0);
      }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "La cotización no contiene productos." },
        { status: 400 }
      );
    }

    // 4. Verificación y validación de precios en Base de Datos (prevención de manipulación en cliente)
    const productIds = items
      .map((it: any) => Number(it?.productId))
      .filter((id: number) => !isNaN(id) && id > 0);

    const [dbProducts, dbVariants, dbAttrs, taxSettings] = await Promise.all([
      productIds.length > 0
        ? db
            .select({
              id: products.id,
              name: products.name,
              regularPrice: products.regularPrice,
              salePrice: products.salePrice,
            })
            .from(products)
            .where(inArray(products.id, productIds))
        : [],
      productIds.length > 0
        ? db
            .select({
              id: productVariants.id,
              productId: productVariants.productId,
              sku: productVariants.sku,
              price: productVariants.price,
            })
            .from(productVariants)
            .where(inArray(productVariants.productId, productIds))
        : [],
      productIds.length > 0
        ? db
            .select({
              id: productAttributes.id,
              productId: productAttributes.productId,
              sku: productAttributes.sku,
              attrPrice: productAttributes.attrPrice,
            })
            .from(productAttributes)
            .where(inArray(productAttributes.productId, productIds))
        : [],
      getTaxSettings(),
    ]);

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    const variantMap = new Map(
      dbVariants.map((v) => [`${v.productId}:${v.sku?.trim().toUpperCase()}`, v])
    );
    const attrMap = new Map(
      dbAttrs.map((a) => [`${a.productId}:${a.sku?.trim().toUpperCase()}`, a])
    );

    const sanitizedItems: QuoteItemPayload[] = [];
    for (const rawItem of items) {
      if (!rawItem || typeof rawItem !== "object") continue;
      const rawQty = Number(rawItem.quantity);
      const quantity = isNaN(rawQty) || rawQty < 1 ? 1 : Math.min(Math.floor(rawQty), 9999);
      const prodId = rawItem.productId ? Number(rawItem.productId) : undefined;
      const sku = rawItem.sku ? String(rawItem.sku).trim() : undefined;
      const upperSku = sku?.toUpperCase();

      let unitPrice = 0;
      let name = String(rawItem.productName || "Producto").trim().slice(0, 255);
      let isDiscountAlreadyApplied = false;

      if (prodId && productMap.has(prodId)) {
        const prod = productMap.get(prodId)!;
        name = prod.name;
        const variant = upperSku ? variantMap.get(`${prodId}:${upperSku}`) : undefined;
        if (variant && variant.price !== null && Number(variant.price) > 0) {
          unitPrice = Number(variant.price);
        } else {
          const attr = upperSku ? attrMap.get(`${prodId}:${upperSku}`) : undefined;
          if (attr && attr.attrPrice !== null && Number(attr.attrPrice) > 0) {
            unitPrice = Number(attr.attrPrice);
          } else if (prod.salePrice && Number(prod.salePrice) > 0) {
            unitPrice = Number(prod.salePrice);
          } else if (prod.regularPrice && Number(prod.regularPrice) > 0) {
            unitPrice = Number(prod.regularPrice);
          } else if (rawItem.regularPrice && Number(rawItem.regularPrice) > 0) {
            unitPrice = Number(rawItem.regularPrice);
          } else {
            const clientPrice = Number(rawItem.unitPrice);
            unitPrice = isNaN(clientPrice) || clientPrice < 0 ? 0 : Number(clientPrice.toFixed(2));
            isDiscountAlreadyApplied = true;
          }
        }
      } else if (rawItem.regularPrice && Number(rawItem.regularPrice) > 0) {
        unitPrice = Number(rawItem.regularPrice);
      } else {
        const clientPrice = Number(rawItem.unitPrice);
        unitPrice = isNaN(clientPrice) || clientPrice < 0 ? 0 : Number(clientPrice.toFixed(2));
        isDiscountAlreadyApplied = true;
      }

      if (!isDiscountAlreadyApplied && userDiscountPercentage > 0 && unitPrice > 0) {
        unitPrice = Number((unitPrice * (1 - userDiscountPercentage / 100)).toFixed(2));
      }

      const totalPrice = Number((quantity * unitPrice).toFixed(2));

      sanitizedItems.push({
        productId: prodId,
        productName: name,
        presentation: rawItem.presentation ? String(rawItem.presentation).trim().slice(0, 100) : undefined,
        sku,
        imageUrl: rawItem.imageUrl ? String(rawItem.imageUrl).trim().slice(0, 500) : undefined,
        quantity,
        unitPrice,
        totalPrice,
      });
    }

    if (sanitizedItems.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron productos válidos en la cotización." },
        { status: 400 }
      );
    }

    // Recalcular subtotales e impuestos del lado del servidor de forma confiable
    const computedSubtotal = Number(
      sanitizedItems.reduce((acc, it) => acc + it.totalPrice, 0).toFixed(2)
    );
    const taxRate = taxSettings?.enabled ? (Number(taxSettings.rate) || 16) / 100 : 0;
    const computedTax = Number((computedSubtotal * taxRate).toFixed(2));
    const computedTotal = Number((computedSubtotal + computedTax).toFixed(2));

    // Validar acción 'save': solo usuarios autenticados pueden guardar borradores
    if (action === "save" && !userId) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para guardar un borrador de cotización." },
        { status: 401 }
      );
    }

    // Check if we are updating an existing saved quote
    let existingSavedQuote: typeof quoteRequests.$inferSelect | undefined;

    if (savedQuoteId) {
      if (!userId) {
        return NextResponse.json(
          { error: "Debes iniciar sesión para modificar una cotización guardada." },
          { status: 401 }
        );
      }

      const [found] = await db
        .select()
        .from(quoteRequests)
        .where(
          and(
            eq(quoteRequests.id, Number(savedQuoteId)),
            eq(quoteRequests.userId, userId)
          )
        )
        .limit(1);

      if (!found || found.status !== "saved") {
        return NextResponse.json(
          { error: "La cotización guardada no existe o no tienes permisos para modificarla." },
          { status: 404 }
        );
      }
      existingSavedQuote = found;
    } else if (userId) {
      // Find latest saved quote for user
      const [found] = await db
        .select()
        .from(quoteRequests)
        .where(
          and(
            eq(quoteRequests.userId, userId),
            eq(quoteRequests.status, "saved")
          )
        )
        .orderBy(desc(quoteRequests.id))
        .limit(1);
      if (found) {
        existingSavedQuote = found;
      }
    }

    const finalStatus = action === "save" ? "saved" : "pending";

    // 5. Inserción atómica mediante Transacción de BD y bloqueo seguro de fila para el consecutivo
    const { quoteRequestId, finalQuoteNumber } = await db.transaction(async (tx) => {
      let qId: number;
      let qNum: string;

      if (existingSavedQuote) {
        qId = existingSavedQuote.id;
        qNum =
          existingSavedQuote.quoteNumber ||
          (await getNextQuoteNumber(tx as unknown as typeof db, true));

        await tx
          .update(quoteRequests)
          .set({
            notes: notes || null,
            subtotal: String(computedSubtotal.toFixed(2)),
            tax: String(computedTax.toFixed(2)),
            total: String(computedTotal.toFixed(2)),
            status: finalStatus,
          })
          .where(eq(quoteRequests.id, qId));

        await tx.delete(quoteItems).where(eq(quoteItems.quoteRequestId, qId));
      } else {
        qNum = await getNextQuoteNumber(tx as unknown as typeof db, true);

        const [qrResult] = await tx.insert(quoteRequests).values({
          quoteNumber: qNum,
          userId: userId ? Number(userId) : null,
          customerName,
          companyName: companyName || null,
          email,
          phone: phone || "No especificado",
          notes: notes || null,
          subtotal: String(computedSubtotal.toFixed(2)),
          tax: String(computedTax.toFixed(2)),
          total: String(computedTotal.toFixed(2)),
          status: finalStatus,
        });

        qId = Number(qrResult.insertId);
      }

      // Inserción en bloque (bulk insert) en 1 solo round-trip
      await tx.insert(quoteItems).values(
        sanitizedItems.map((item) => ({
          quoteRequestId: qId,
          productId: item.productId ? Number(item.productId) : null,
          productName: item.productName || "Producto",
          presentation: item.presentation || null,
          sku: item.sku || null,
          imageUrl: item.imageUrl || null,
          quantity: item.quantity,
          unitPrice: String(item.unitPrice.toFixed(2)),
          totalPrice: String(item.totalPrice.toFixed(2)),
        }))
      );

      return { quoteRequestId: qId, finalQuoteNumber: qNum };
    });

    // Si la acción es 'send', enviar correos de notificación vía Gmail SMTP
    let emailStatus = { clientSent: false, adminSent: false };
    if (action === "send") {
      try {
        emailStatus = await sendQuoteEmails({
          quoteNumber: finalQuoteNumber,
          customerName,
          companyName,
          email,
          phone,
          notes,
          subtotal: computedSubtotal,
          tax: computedTax,
          total: computedTotal,
          items: sanitizedItems.map((it) => ({
            productName: it.productName,
            presentation: it.presentation,
            sku: it.sku,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            totalPrice: it.totalPrice,
          })),
          discountPercentage: userDiscountPercentage,
        });
      } catch (err) {
        console.error("Error dispatching quote emails:", err);
      }
    }

    return NextResponse.json({
      success: true,
      quoteId: quoteRequestId,
      quoteNumber: finalQuoteNumber,
      status: finalStatus,
      emailStatus,
      message:
        action === "save"
          ? `Cotización #${finalQuoteNumber} guardada exitosamente.`
          : `Cotización #${finalQuoteNumber} enviada a Karmax con éxito.`,
    });
  } catch (error) {
    console.error("Error saving quote request:", error);
    return NextResponse.json(
      { error: "Error al procesar y guardar la cotización." },
      { status: 500 }
    );
  }
}
