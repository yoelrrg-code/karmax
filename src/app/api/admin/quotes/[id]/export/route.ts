import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import { db, quoteRequests, quoteItems } from "@/lib/db";
import { eq } from "drizzle-orm";
import { generateQuoteExcelBuffer } from "@/lib/email/mailer";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const quoteId = Number(id);

    if (isNaN(quoteId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const [quote] = await db
      .select()
      .from(quoteRequests)
      .where(eq(quoteRequests.id, quoteId))
      .limit(1);

    if (!quote) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
    }

    const items = await db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteRequestId, quoteId));

    const finalQuoteNumber = quote.quoteNumber || `#${quote.id.toString().padStart(6, "0")}`;

    const excelBuffer = await generateQuoteExcelBuffer({
      quoteNumber: finalQuoteNumber,
      customerName: quote.customerName,
      companyName: quote.companyName,
      email: quote.email,
      phone: quote.phone,
      notes: quote.notes,
      subtotal: quote.subtotal || 0,
      tax: quote.tax || 0,
      total: quote.total || 0,
      items: items.map((it) => ({
        productName: it.productName,
        presentation: it.presentation,
        sku: it.sku,
        quantity: it.quantity,
        unitPrice: it.unitPrice || 0,
        totalPrice: it.totalPrice || (Number(it.unitPrice || 0) * it.quantity),
      })),
    });

    const cleanQuoteNumber = finalQuoteNumber.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `Cotizacion-${cleanQuoteNumber}.xlsx`;

    return new NextResponse(excelBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting quote to Excel:", error);
    return NextResponse.json({ error: "Error al exportar la cotización" }, { status: 500 });
  }
}
