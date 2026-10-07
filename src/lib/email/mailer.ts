import nodemailer from "nodemailer";
import ExcelJS from "exceljs";
import { getKarmaxNotificationEmail } from "@/lib/services/karmaxService";

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
  discountPercentage?: number | string | null;
}

export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatCurrency(val: number | string): string {
  const num = typeof val === "number" ? val : parseFloat(String(val)) || 0;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(num);
}

function getFromAddress(): string {
  if (process.env.SMTP_FROM) {
    return process.env.SMTP_FROM.trim();
  }
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || "ventas@karmax.mx";
  return `"Karmax México" <${user.trim()}>`;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn(
      "[Mailer] Advertencia: Credenciales SMTP (SMTP_USER/SMTP_PASSWORD o GMAIL_USER/GMAIL_APP_PASSWORD) no configuradas en el entorno. El correo no se enviará."
    );
    return null;
  }

  // Si se definió host SMTP específico (por ejemplo Hostinger: smtp.hostinger.com)
  if (host) {
    return nodemailer.createTransport({
      host: host.trim(),
      port,
      secure,
      auth: {
        user: user.trim(),
        pass: pass.trim(),
      },
    });
  }

  // Fallback a servicio Gmail tradicional si no hay SMTP_HOST
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user.trim(),
      pass: pass.trim().replace(/\s+/g, ""),
    },
  });
}

/**
 * Genera un archivo Excel (.xlsx) con los datos y el desglose de productos de la cotización.
 */
export async function generateQuoteExcelBuffer(data: QuoteEmailData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Karmax México";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(`Cotización ${data.quoteNumber}`, {
    views: [{ showGridLines: true }],
  });

  const greenHeaderFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF00A859" },
  };

  const whiteBoldFont: Partial<ExcelJS.Font> = {
    name: "Calibri",
    size: 11,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };

  // 1. Encabezado de la cotización
  worksheet.addRow(["COTIZACIÓN KARMAX", `#${data.quoteNumber}`]);
  worksheet.getCell("A1").font = { name: "Calibri", size: 14, bold: true, color: { argb: "FF1A2B49" } };
  worksheet.getCell("B1").font = { name: "Calibri", size: 14, bold: true, color: { argb: "FF00A859" } };

  worksheet.addRow(["Fecha:", new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })]);
  worksheet.addRow(["Cliente:", data.customerName]);
  worksheet.addRow(["Empresa:", data.companyName || "No especificada"]);
  worksheet.addRow(["Correo:", data.email]);
  worksheet.addRow(["Teléfono:", data.phone]);
  const discountNum = Number(data.discountPercentage) || 0;
  if (discountNum > 0) {
    worksheet.addRow(["Descuento aplicado:", `${discountNum}% OFF`]);
  }
  if (data.notes) {
    worksheet.addRow(["Notas:", data.notes]);
  }
  worksheet.addRow([]); // Fila en blanco

  // 2. Tabla de productos
  const tableHeader = worksheet.addRow([
    "SKU",
    "Producto",
    "Presentación",
    "Cantidad",
    "Precio Unitario (MXN)",
    "Total (MXN)",
  ]);

  tableHeader.eachCell((cell) => {
    cell.fill = greenHeaderFill;
    cell.font = whiteBoldFont;
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  tableHeader.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
  tableHeader.getCell(2).alignment = { vertical: "middle", horizontal: "left" };
  tableHeader.getCell(5).alignment = { vertical: "middle", horizontal: "right" };
  tableHeader.getCell(6).alignment = { vertical: "middle", horizontal: "right" };

  // 3. Filas de productos
  data.items.forEach((item) => {
    const qty = typeof item.quantity === "number" ? item.quantity : parseFloat(String(item.quantity)) || 0;
    const unitPrice = typeof item.unitPrice === "number" ? item.unitPrice : parseFloat(String(item.unitPrice)) || 0;
    const totalPrice = typeof item.totalPrice === "number" ? item.totalPrice : parseFloat(String(item.totalPrice)) || 0;

    const row = worksheet.addRow([
      item.sku || "—",
      item.productName,
      item.presentation || "Estándar",
      qty,
      unitPrice,
      totalPrice,
    ]);

    row.getCell(1).alignment = { horizontal: "left" };
    row.getCell(2).alignment = { horizontal: "left" };
    row.getCell(3).alignment = { horizontal: "center" };
    row.getCell(4).alignment = { horizontal: "center" };
    row.getCell(5).numFmt = '"$"#,##0.00';
    row.getCell(5).alignment = { horizontal: "right" };
    row.getCell(6).numFmt = '"$"#,##0.00';
    row.getCell(6).alignment = { horizontal: "right" };
  });

  worksheet.addRow([]); // Fila en blanco

  // 4. Totales
  const subtotalNum = typeof data.subtotal === "number" ? data.subtotal : parseFloat(String(data.subtotal)) || 0;
  const taxNum = typeof data.tax === "number" ? data.tax : parseFloat(String(data.tax)) || 0;
  const totalNum = typeof data.total === "number" ? data.total : parseFloat(String(data.total)) || 0;

  const subtotalRow = worksheet.addRow(["", "", "", "", "Subtotal:", subtotalNum]);
  subtotalRow.getCell(5).font = { bold: true };
  subtotalRow.getCell(6).numFmt = '"$"#,##0.00';
  subtotalRow.getCell(6).font = { bold: true };

  const taxRow = worksheet.addRow(["", "", "", "", "I.V.A.:", taxNum]);
  taxRow.getCell(5).font = { bold: true };
  taxRow.getCell(6).numFmt = '"$"#,##0.00';
  taxRow.getCell(6).font = { bold: true };

  if (discountNum > 0) {
    const discRow = worksheet.addRow(["", "", "", "", "Descuento Cliente:", `${discountNum}% OFF`]);
    discRow.getCell(5).font = { bold: true, color: { argb: "FF00A859" } };
    discRow.getCell(6).font = { bold: true, color: { argb: "FF00A859" } };
  }

  const totalRow = worksheet.addRow(["", "", "", "", "Total Cotizado:", totalNum]);
  totalRow.getCell(5).font = { bold: true, color: { argb: "FF00A859" } };
  totalRow.getCell(6).numFmt = '"$"#,##0.00';
  totalRow.getCell(6).font = { bold: true, color: { argb: "FF00A859" } };

  // Anchos de columna
  worksheet.columns = [
    { width: 18 }, // SKU
    { width: 38 }, // Producto
    { width: 22 }, // Presentación
    { width: 12 }, // Cantidad
    { width: 22 }, // Precio Unitario
    { width: 20 }, // Total
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function buildItemsHtml(items: EmailQuoteItem[]): string {
  return items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 8px; font-size: 13px; font-family: monospace, Courier, sans-serif; color: #475569; white-space: nowrap;">
          ${escapeHtml(item.sku || "—")}
        </td>
        <td style="padding: 12px 8px; font-size: 14px; color: #1e293b;">
          <strong>${escapeHtml(item.productName)}</strong>
        </td>
        <td style="padding: 12px 8px; font-size: 14px; color: #475569; text-align: center;">
          ${escapeHtml(item.presentation || "Estándar")}
        </td>
        <td style="padding: 12px 8px; font-size: 14px; color: #475569; text-align: center;">
          ${escapeHtml(item.quantity)}
        </td>
        <td style="padding: 12px 8px; font-size: 14px; color: #475569; text-align: right; white-space: nowrap;">
          ${formatCurrency(item.unitPrice)}
        </td>
        <td style="padding: 12px 8px; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right; white-space: nowrap;">
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

  const karmaxAdminEmail = await getKarmaxNotificationEmail();
  const fromAddress = getFromAddress();
  const itemsHtml = buildItemsHtml(data.items);

  const safeQuoteNumber = escapeHtml(data.quoteNumber);
  const safeCustomerName = escapeHtml(data.customerName);
  const safeCompanyName = escapeHtml(data.companyName || "No especificada");
  const safePhone = escapeHtml(data.phone);
  const safeEmail = escapeHtml(data.email);
  const safeNotes = data.notes ? escapeHtml(data.notes) : "";

  const taxNum = Number(data.tax) || 0;
  const subtotalNum = Number(data.subtotal) || 0;
  const taxPercent = (subtotalNum > 0 && taxNum > 0) ? Math.round((taxNum / subtotalNum) * 100) : 0;
  const taxLabel = taxNum > 0 ? `I.V.A. (${taxPercent}%):` : "I.V.A. (Sin IVA):";
  const discountNum = Number(data.discountPercentage) || 0;

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
          <h2 style="color: #00A859; font-size: 18px; margin-top: 0;">¡Hola ${safeCustomerName}!</h2>
          <p style="font-size: 14px; line-height: 1.5; color: #475569;">
            Hemos recibido tu solicitud de cotización <strong>#${safeQuoteNumber}</strong>. Uno de nuestros asesores comerciales revisará la disponibilidad y se comunicará contigo a la brevedad.
          </p>

          <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px;">
            <p style="margin: 4px 0;"><strong>Cotización:</strong> #${safeQuoteNumber}</p>
            <p style="margin: 4px 0;"><strong>Empresa:</strong> ${safeCompanyName}</p>
            <p style="margin: 4px 0;"><strong>Teléfono:</strong> ${safePhone}</p>
            <p style="margin: 4px 0;"><strong>Correo:</strong> ${safeEmail}</p>
            ${discountNum > 0 ? `<p style="margin: 4px 0; color: #00A859;"><strong>Descuento de cliente aplicado:</strong> <span style="background-color: #dcfce7; color: #15803d; font-weight: bold; padding: 2px 8px; border-radius: 9999px; font-size: 12px;">${discountNum}% OFF</span></p>` : ""}
            ${safeNotes ? `<p style="margin: 4px 0;"><strong>Notas adicionales:</strong> ${safeNotes}</p>` : ""}
          </div>

          <h3 style="font-size: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">Productos Solicitados</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1; font-size: 12px; color: #64748b; text-transform: uppercase;">
                <th style="padding: 8px; text-align: left;">SKU</th>
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
            ${discountNum > 0 ? `<p style="margin: 4px 0; color: #00A859; font-weight: 600;">Descuento de cliente: <strong>-${discountNum}% OFF</strong></p>` : ""}
            <p style="margin: 4px 0; color: #64748b;">Subtotal: <strong>${formatCurrency(data.subtotal)}</strong></p>
            <p style="margin: 4px 0; color: #64748b;">${taxLabel} <strong>${formatCurrency(data.tax)}</strong></p>
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
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">NUEVA COTIZACIÓN ENTRANTE #${safeQuoteNumber}</h1>
        </div>
        <div style="padding: 24px;">
          <h3 style="font-size: 15px; margin-top: 0; color: #1e293b;">Datos de Contacto del Cliente</h3>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; font-size: 14px; line-height: 1.6;">
            <p style="margin: 2px 0;"><strong>Cliente:</strong> ${safeCustomerName}</p>
            <p style="margin: 2px 0;"><strong>Empresa:</strong> ${safeCompanyName}</p>
            <p style="margin: 2px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
            <p style="margin: 2px 0;"><strong>Teléfono:</strong> <a href="tel:${safePhone}">${safePhone}</a></p>
            ${discountNum > 0 ? `
              <p style="margin: 4px 0 2px 0; color: #15803d; font-weight: 500;">
                <strong>Descuento de Cliente:</strong>
                <span style="display: inline-block; background-color: #dcfce7; color: #15803d; font-weight: bold; padding: 2px 8px; border-radius: 9999px; font-size: 12px; margin-left: 4px; border: 1px solid #bbf7d0;">
                  ${discountNum}% OFF
                </span>
                <span style="font-size: 12px; color: #64748b; margin-left: 4px;">(Precios unitarios ya reflejan este descuento)</span>
              </p>
            ` : ""}
            ${safeNotes ? `<p style="margin: 6px 0; padding-top: 6px; border-top: 1px dashed #cbd5e1;"><strong>Notas del cliente:</strong> ${safeNotes}</p>` : ""}
          </div>

          <h3 style="font-size: 15px; margin: 24px 0 10px 0; color: #1e293b;">Desglose de Productos</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-size: 12px; color: #475569; text-transform: uppercase;">
                <th style="padding: 8px; text-align: left;">SKU</th>
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
            ${discountNum > 0 ? `
              <p style="margin: 4px 0; color: #15803d; font-weight: 600;">
                Descuento de cliente aplicado: <span style="background-color: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; border: 1px solid #bbf7d0;">-${discountNum}% OFF</span>
              </p>
            ` : ""}
            <p style="margin: 4px 0; color: #64748b;">Subtotal: <strong>${formatCurrency(data.subtotal)}</strong></p>
            <p style="margin: 4px 0; color: #64748b;">${taxLabel} <strong>${formatCurrency(data.tax)}</strong></p>
            <p style="margin: 6px 0; font-size: 18px; color: #00A859;">Total Cotizado: <strong>${formatCurrency(data.total)}</strong></p>
          </div>

          <p style="margin: 16px 0 0 0; font-size: 13px; color: #00A859; font-weight: 500;">
            📎 Se adjunta el archivo Excel con el listado completo de los productos de esta cotización.
          </p>
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
    const adminAttachments = [];
    try {
      const excelBuffer = await generateQuoteExcelBuffer(data);
      const cleanQuoteNumber = data.quoteNumber.replace(/[^a-zA-Z0-9_-]/g, "_");
      adminAttachments.push({
        filename: `Cotizacion-${cleanQuoteNumber}.xlsx`,
        content: excelBuffer,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    } catch (excelErr) {
      console.error("[Mailer] Error generando archivo Excel adjunto:", excelErr);
    }

    await transporter.sendMail({
      from: fromAddress,
      to: karmaxAdminEmail,
      subject: `Nueva Cotización #${data.quoteNumber} recibida - ${data.customerName}`,
      html: adminHtml,
      attachments: adminAttachments,
    });
    adminSent = true;
    console.log(`[Mailer] Notificación enviada a Karmax: ${karmaxAdminEmail}`);
  } catch (error) {
    console.error(`[Mailer] Error enviando notificación a ${karmaxAdminEmail}:`, error);
  }

  return { clientSent, adminSent };
}

export interface ContactNotificationEmailData {
  fullName: string;
  company: string;
  phone: string;
  email: string;
  message: string;
  createdAt?: string;
}

/**
 * Envía un correo de notificación a Karmax cuando un cliente envía un mensaje desde /contacto.
 */
export async function sendContactNotificationEmail(
  data: ContactNotificationEmailData
): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    return false;
  }

  const karmaxAdminEmail = await getKarmaxNotificationEmail();
  const fromAddress = getFromAddress();
  const safeFullName = escapeHtml(data.fullName);
  const safeCompany = escapeHtml(data.company);
  const safeEmail = escapeHtml(data.email);
  const safePhone = escapeHtml(data.phone);
  const safeMessage = escapeHtml(data.message);

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="background-color: #1A2B49; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 1px;">KARMAX</h1>
          <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 14px;">Nuevo Mensaje de Contacto Recibido</p>
        </div>

        <div style="padding: 24px;">
          <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 16px; margin-bottom: 20px; border-radius: 0 6px 6px 0;">
            <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 600;">
              Se ha recibido un nuevo mensaje a través del formulario de contacto del sitio web.
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; width: 150px;"><strong>Nombre completo:</strong></td>
                <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${safeFullName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b;"><strong>Empresa:</strong></td>
                <td style="padding: 10px 0; color: #0f172a;">${safeCompany}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b;"><strong>Correo electrónico:</strong></td>
                <td style="padding: 10px 0;"><a href="mailto:${safeEmail}" style="color: #0284c7; text-decoration: none;">${safeEmail}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b;"><strong>Teléfono:</strong></td>
                <td style="padding: 10px 0;"><a href="tel:${safePhone}" style="color: #0f172a; text-decoration: none;">${safePhone}</a></td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 20px;">
            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
              Mensaje del cliente:
            </p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap;">${safeMessage}</div>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <a href="mailto:${safeEmail}?subject=Respuesta a tu mensaje en KARMAX" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-weight: 600; font-size: 14px;">
              Responder al Cliente
            </a>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
          Este correo fue generado automáticamente por el sitio web de KARMAX.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: karmaxAdminEmail,
      replyTo: data.email,
      subject: `Nuevo mensaje de contacto: ${data.fullName} (${data.company})`,
      html,
    });
    console.log(`[Mailer] Notificación de contacto enviada a Karmax: ${karmaxAdminEmail}`);
    return true;
  } catch (error) {
    console.error(`[Mailer] Error enviando notificación de contacto a ${karmaxAdminEmail}:`, error);
    return false;
  }
}

