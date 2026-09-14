import { NextRequest, NextResponse } from "next/server";
import { db, contactMessages } from "@/lib/db";
import { checkRateLimit } from "@/lib/security/rateLimiter";
import { verifyAntiBot } from "@/lib/security/antiBot";
import { sendContactNotificationEmail } from "@/lib/email/mailer";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0].trim()
      : request.headers.get("x-real-ip") || "127.0.0.1";

    // 1. Rate Limiting: máx 5 mensajes por cada 10 minutos por IP
    const rateCheck = checkRateLimit(ip, "contact", {
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error:
            "Demasiados intentos de envío. Por favor, espera unos minutos antes de enviar otro mensaje.",
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      fullName,
      company,
      phone,
      email,
      message,
      antiBotToken,
      honeypot,
      turnstileToken,
    } = body;

    // 2. Verificación Anti-Bot / CAPTCHA invisible
    const botCheck = await verifyAntiBot({
      token: antiBotToken,
      honeypot,
      turnstileToken,
      clientIp: ip,
    });
    if (!botCheck.valid) {
      return NextResponse.json(
        { error: botCheck.reason || "Error en la verificación de seguridad." },
        { status: 400 }
      );
    }

    // 3. Validación y sanitización de campos requeridos
    const cleanFullName = String(fullName || "").trim();
    const cleanCompany = String(company || "").trim();
    const cleanPhone = String(phone || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanMessage = String(message || "").trim();

    if (!cleanFullName || cleanFullName.length < 2 || cleanFullName.length > 255) {
      return NextResponse.json(
        { error: "Por favor ingresa un nombre completo válido (mínimo 2 caracteres)." },
        { status: 400 }
      );
    }

    if (!cleanCompany || cleanCompany.length < 1 || cleanCompany.length > 255) {
      return NextResponse.json(
        { error: "Por favor ingresa el nombre de tu empresa." },
        { status: 400 }
      );
    }

    if (!cleanPhone || cleanPhone.length < 6 || cleanPhone.length > 50) {
      return NextResponse.json(
        { error: "Por favor ingresa un número de teléfono válido." },
        { status: 400 }
      );
    }

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 255) {
      return NextResponse.json(
        { error: "Por favor ingresa un correo electrónico válido." },
        { status: 400 }
      );
    }

    if (!cleanMessage || cleanMessage.length < 5 || cleanMessage.length > 5000) {
      return NextResponse.json(
        { error: "Por favor ingresa un mensaje detallado (mínimo 5 caracteres)." },
        { status: 400 }
      );
    }

    // 4. Inserción en la base de datos
    await db.insert(contactMessages).values({
      fullName: cleanFullName,
      company: cleanCompany,
      phone: cleanPhone,
      email: cleanEmail,
      message: cleanMessage,
      status: "unread",
      ipAddress: ip,
    });

    // 5. Enviar notificación por correo electrónico a Karmax
    try {
      await sendContactNotificationEmail({
        fullName: cleanFullName,
        company: cleanCompany,
        phone: cleanPhone,
        email: cleanEmail,
        message: cleanMessage,
      });
    } catch (mailError) {
      console.error("Error al enviar email de notificación a Karmax:", mailError);
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "¡Gracias por ponerte en contacto! Hemos recibido tu mensaje y nos comunicaremos contigo lo antes posible.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/contact:", error);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado al enviar el mensaje. Intenta de nuevo más tarde." },
      { status: 500 }
    );
  }
}
