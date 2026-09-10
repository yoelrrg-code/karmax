import { NextResponse } from "next/server";
import { db, users, roles } from "@/lib/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, companyName, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nombre, correo y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

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
