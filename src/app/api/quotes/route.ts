import { NextResponse } from "next/server";
import { db, quoteRequests, quoteItems, users } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import { getNextQuoteNumber } from "@/lib/quotes/consecutive";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      notes,
      subtotal,
      tax,
      total,
      items,
      action = "send", // 'save' | 'send'
    } = body;

    // Verify session
    const session = await getSessionUser();
    let userId = session?.userId || null;
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
    } else if (body.userId) {
      // Fallback if client just registered and passed userId
      userId = Number(body.userId);
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

    // Determine consecutive quote number from database
    const finalQuoteNumber = await getNextQuoteNumber();

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
      status: action === "save" ? "saved" : "pending",
    });

    const quoteRequestId = Number(qrResult.insertId);

    // Insert items
    for (const item of items as QuoteItemPayload[]) {
      await db.insert(quoteItems).values({
        quoteRequestId,
        productId: item.productId ? Number(item.productId) : null,
        productName: item.productName || "Producto",
        presentation: item.presentation || null,
        sku: item.sku || null,
        imageUrl: item.imageUrl || null,
        quantity: item.quantity ? Number(item.quantity) : 1,
        unitPrice: item.unitPrice ? String(Number(item.unitPrice).toFixed(2)) : "0.00",
        totalPrice: item.totalPrice ? String(Number(item.totalPrice).toFixed(2)) : "0.00",
      });
    }

    return NextResponse.json({
      success: true,
      quoteId: quoteRequestId,
      quoteNumber: finalQuoteNumber,
      status: action === "save" ? "saved" : "pending",
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
