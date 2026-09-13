import { NextResponse } from "next/server";
import { db, users, roles } from "@/lib/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { verifyAntiBot } from "@/lib/security/antiBot";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // 1. Rate Limiting: máximo 5 registros por hora por IP
    const rateCheck = checkRateLimit(clientIp, "auth_register", {
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Demasiados intentos de registro. Intenta de nuevo en ${rateCheck.resetInSec} segundos.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, phone, companyName, password, antiBotToken, honeypot, turnstileToken } = body;

    // 2. Anti-Bot / Captcha Invisible
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

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nombre, correo y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { error: "El formato de correo electrónico es inválido." },
        { status: 400 }
      );
    }

    // Validación de longitud y seguridad de contraseña
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { error: "La contraseña es demasiado larga (máximo 128 caracteres)." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, cleanEmail))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un usuario registrado con este correo electrónico." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Get role 'cliente' (id: 2 fallback)
    const [clientRole] = await db
      .select({ id: roles.id, name: roles.name })
      .from(roles)
      .where(eq(roles.name, "cliente"))
      .limit(1);

    const roleId = clientRole ? clientRole.id : 2;

    const [insertResult] = await db.insert(users).values({
      roleId,
      name: String(name).trim(),
      email: cleanEmail,
      phone: phone ? String(phone).trim() : null,
      companyName: companyName ? String(companyName).trim() : null,
      passwordHash,
      isActive: true,
    });

    const newUserId = insertResult.insertId;

    await setSessionCookie({
      id: newUserId,
      email: cleanEmail,
      roleId,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUserId,
        name: String(name).trim(),
        email: cleanEmail,
        phone: phone ? String(phone).trim() : null,
        companyName: companyName ? String(companyName).trim() : null,
        roleId,
        roleName: clientRole?.name || "cliente",
        discountPercentage: 0,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al registrar el usuario." },
      { status: 500 }
    );
  }
}
