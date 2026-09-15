import { NextResponse } from "next/server";
import { db, quoteRequests, quoteItems, users } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { eq, and, desc, inArray } from "drizzle-orm";
import { getNextQuoteNumber } from "@/lib/quotes/consecutive";
import { sendQuoteEmails } from "@/lib/email/mailer";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { verifyAntiBot } from "@/lib/security/antiBot";

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
      }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "La cotización no contiene productos." },
        { status: 400 }
      );
    }

    // 4. Sanitización y validación de items
    const sanitizedItems: QuoteItemPayload[] = [];
    for (const rawItem of items) {
      if (!rawItem || typeof rawItem !== "object") continue;
      const rawQty = Number(rawItem.quantity);
      const quantity = isNaN(rawQty) || rawQty < 1 ? 1 : Math.min(Math.floor(rawQty), 9999);
      const rawUnitPrice = Number(rawItem.unitPrice);
      const unitPrice = isNaN(rawUnitPrice) || rawUnitPrice < 0 ? 0 : Number(rawUnitPrice.toFixed(2));
      const totalPrice = Number((quantity * unitPrice).toFixed(2));

      sanitizedItems.push({
        productId: rawItem.productId ? Number(rawItem.productId) : undefined,
        productName: String(rawItem.productName || "Producto").trim().slice(0, 255),
        presentation: rawItem.presentation ? String(rawItem.presentation).trim().slice(0, 100) : undefined,
        sku: rawItem.sku ? String(rawItem.sku).trim().slice(0, 100) : undefined,
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

    let quoteRequestId: number;
    let finalQuoteNumber: string;
    const finalStatus = action === "save" ? "saved" : "pending";

    if (existingSavedQuote) {
      quoteRequestId = existingSavedQuote.id;
      finalQuoteNumber = existingSavedQuote.quoteNumber || (await getNextQuoteNumber());

      // Update existing record
      await db
        .update(quoteRequests)
        .set({
          notes: notes || null,
          subtotal: subtotal ? String(Number(subtotal).toFixed(2)) : "0.00",
          tax: tax ? String(Number(tax).toFixed(2)) : "0.00",
          total: total ? String(Number(total).toFixed(2)) : "0.00",
          status: finalStatus,
        })
        .where(eq(quoteRequests.id, quoteRequestId));

      // Remove previous items and reinsert current ones
      await db.delete(quoteItems).where(eq(quoteItems.quoteRequestId, quoteRequestId));
    } else {
      // Determine consecutive quote number from database
      finalQuoteNumber = await getNextQuoteNumber();

      // Insert into quote_requests
      const [qrResult] = await db.insert(quoteRequests).values({
        quoteNumber: finalQuoteNumber,
        userId: userId ? Number(userId) : null,
        customerName,
        companyName: companyName || null,
        email,
        phone: phone || "No especificado",
        notes: notes || null,
        subtotal: subtotal ? String(Number(subtotal).toFixed(2)) : "0.00",
        tax: tax ? String(Number(tax).toFixed(2)) : "0.00",
        total: total ? String(Number(total).toFixed(2)) : "0.00",
        status: finalStatus,
      });

      quoteRequestId = Number(qrResult.insertId);
    }

    // Insert items
    for (const item of sanitizedItems) {
      await db.insert(quoteItems).values({
        quoteRequestId,
        productId: item.productId ? Number(item.productId) : null,
        productName: item.productName || "Producto",
        presentation: item.presentation || null,
        sku: item.sku || null,
        imageUrl: item.imageUrl || null,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice.toFixed(2)),
        totalPrice: String(item.totalPrice.toFixed(2)),
      });
    }

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
          subtotal: subtotal || 0,
          tax: tax || 0,
          total: total || 0,
          items: sanitizedItems.map((it) => ({
            productName: it.productName,
            presentation: it.presentation,
            sku: it.sku,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            totalPrice: it.totalPrice,
          })),
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
