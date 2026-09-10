import nodemailer from "nodemailer";

export interface EmailQuoteItem {
  productName: string;
  presentation?: string | null;
  sku?: string | null;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
}

export interface QuoteEmailData {
  quoteNumber: string;
  customerName: string;
  companyName?: string | null;
  email: string;
  phone: string;
  notes?: string | null;
  subtotal: number | string;
  tax: number | string;
  total: number | string;
  items: EmailQuoteItem[];
}

function formatCurrency(val: number | string): string {
  const num = typeof val === "number" ? val : parseFloat(String(val)) || 0;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(num);
}

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn(
      "[Mailer] Advertencia: GMAIL_USER o GMAIL_APP_PASSWORD no están configurados en .env.local. El correo no se enviará."
    );
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user.trim(),
      pass: pass.trim().replace(/\s+/g, ""), // Elimina espacios si copiaron "xxxx xxxx xxxx xxxx"
    },
  });
}

function buildItemsHtml(items: EmailQuoteItem[]): string {
  return items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 8px; font-size: 14px; color: #1e293b;">
          <strong>${item.productName}</strong>
          ${item.sku ? `<br><span style="font-size: 12px; color: #64748b;">SKU: ${item.sku}</span>` : ""}
        </td>
        <td style="padding: 12px 8px; font-size: 14px; color: #475569; text-align: center;">
          ${item.presentation || "Estándar"}
        </td>
        <td style="padding: 12px 8px; font-size: 14px; color: #475569; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 8px; font-size: 14px; color: #475569; text-align: right;">
          ${formatCurrency(item.unitPrice)}
        </td>
        <td style="padding: 12px 8px; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">
          ${formatCurrency(item.totalPrice)}
        </td>
      </tr>
    `
    )
    .join("");
}

export async function sendQuoteEmails(data: QuoteEmailData): Promise<{ clientSent: boolean; adminSent: boolean }> {
  const transporter = getTransporter();
  if (!transporter) {
    return { clientSent: false, adminSent: false };
  }

  const karmaxAdminEmail =
    process.env.KARMAX_NOTIFICATION_EMAIL || "dev.paco.lule@gmail.com";
  const fromAddress = `"Karmax México" <${process.env.GMAIL_USER}>`;
  const itemsHtml = buildItemsHtml(data.items);

  // 1. Email para el Cliente
  const clientHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="background-color: #1A2B49; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 1px;">KARMAX</h1>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Comprobante de Cotización</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #00A859; font-size: 18px; margin-top: 0;">¡Hola ${data.customerName}!</h2>
          <p style="font-size: 14px; line-height: 1.5; color: #475569;">
            Hemos recibido tu solicitud de cotización <strong>#${data.quoteNumber}</strong>. Uno de nuestros asesores comerciales revisará la disponibilidad y se comunicará contigo a la brevedad.
          </p>

          <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px;">
            <p style="margin: 4px 0;"><strong>Cotización:</strong> #${data.quoteNumber}</p>
            <p style="margin: 4px 0;"><strong>Empresa:</strong> ${data.companyName || "No especificada"}</p>
            <p style="margin: 4px 0;"><strong>Teléfono:</strong> ${data.phone}</p>
            <p style="margin: 4px 0;"><strong>Correo:</strong> ${data.email}</p>
            ${data.notes ? `<p style="margin: 4px 0;"><strong>Notas adicionales:</strong> ${data.notes}</p>` : ""}
          </div>

          <h3 style="font-size: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">Productos Solicitados</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1; font-size: 12px; color: #64748b; text-transform: uppercase;">
                <th style="padding: 8px; text-align: left;">Producto</th>
                <th style="padding: 8px; text-align: center;">Pres.</th>
                <th style="padding: 8px; text-align: center;">Cant.</th>
                <th style="padding: 8px; text-align: right;">Unitario</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="text-align: right; font-size: 14px; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            <p style="margin: 4px 0; color: #64748b;">Subtotal: <strong>${formatCurrency(data.subtotal)}</strong></p>
            <p style="margin: 4px 0; color: #64748b;">I.V.A. (16%): <strong>${formatCurrency(data.tax)}</strong></p>
            <p style="margin: 6px 0; font-size: 18px; color: #00A859;">Total: <strong>${formatCurrency(data.total)}</strong></p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
            <p style="margin: 4px 0;">Karmax México • Soluciones Químicas y de Limpieza Institucional</p>
            <p style="margin: 4px 0;">¿Dudas? Contáctanos a través de WhatsApp o respondiendo a este correo.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // 2. Email para Karmax (Admin)
  const adminHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
      <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="background-color: #00A859; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">NUEVA COTIZACIÓN ENTRANTE #${data.quoteNumber}</h1>
        </div>
        <div style="padding: 24px;">
          <h3 style="font-size: 15px; margin-top: 0; color: #1e293b;">Datos de Contacto del Cliente</h3>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; font-size: 14px; line-height: 1.6;">
            <p style="margin: 2px 0;"><strong>Cliente:</strong> ${data.customerName}</p>
            <p style="margin: 2px 0;"><strong>Empresa:</strong> ${data.companyName || "No especificada"}</p>
            <p style="margin: 2px 0;"><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            <p style="margin: 2px 0;"><strong>Teléfono:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>
            ${data.notes ? `<p style="margin: 6px 0; padding-top: 6px; border-top: 1px dashed #cbd5e1;"><strong>Notas del cliente:</strong> ${data.notes}</p>` : ""}
          </div>

          <h3 style="font-size: 15px; margin: 24px 0 10px 0; color: #1e293b;">Desglose de Productos</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-size: 12px; color: #475569; text-transform: uppercase;">
                <th style="padding: 8px; text-align: left;">Producto</th>
                <th style="padding: 8px; text-align: center;">Presentación</th>
                <th style="padding: 8px; text-align: center;">Cant.</th>
                <th style="padding: 8px; text-align: right;">Unitario</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="text-align: right; font-size: 14px; line-height: 1.6; border-top: 2px solid #e2e8f0; padding-top: 12px;">
            <p style="margin: 4px 0; color: #64748b;">Subtotal: <strong>${formatCurrency(data.subtotal)}</strong></p>
            <p style="margin: 4px 0; color: #64748b;">I.V.A. (16%): <strong>${formatCurrency(data.tax)}</strong></p>
            <p style="margin: 6px 0; font-size: 18px; color: #00A859;">Total Cotizado: <strong>${formatCurrency(data.total)}</strong></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  let clientSent = false;
  let adminSent = false;

  try {
    if (data.email && data.email.includes("@")) {
      await transporter.sendMail({
        from: fromAddress,
        to: data.email,
        subject: `Comprobante de Cotización #${data.quoteNumber} - Karmax`,
        html: clientHtml,
      });
      clientSent = true;
      console.log(`[Mailer] Comprobante enviado al cliente: ${data.email}`);
    }
  } catch (error) {
    console.error(`[Mailer] Error enviando comprobante a ${data.email}:`, error);
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: karmaxAdminEmail,
      subject: `Nueva Cotización #${data.quoteNumber} recibida - ${data.customerName}`,
      html: adminHtml,
    });
    adminSent = true;
    console.log(`[Mailer] Notificación enviada a Karmax: ${karmaxAdminEmail}`);
  } catch (error) {
    console.error(`[Mailer] Error enviando notificación a ${karmaxAdminEmail}:`, error);
  }

  return { clientSent, adminSent };
}
