import { NextResponse } from "next/server";
import { db, users, roles } from "@/lib/db";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Find user with role
    const [userRecord] = await db
      .select({
        id: users.id,
        roleId: users.roleId,
        name: users.name,
        email: users.email,
        phone: users.phone,
        companyName: users.companyName,
        passwordHash: users.passwordHash,
        isActive: users.isActive,
        discountPercentage: users.discountPercentage,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.email, cleanEmail))
      .limit(1);

    if (!userRecord) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    if (!userRecord.isActive) {
      return NextResponse.json(
        { error: "Esta cuenta se encuentra desactivada." },
        { status: 403 }
      );
    }

    if (!userRecord.passwordHash) {
      return NextResponse.json(
        { error: "Esta cuenta no tiene contraseña configurada." },
        { status: 400 }
      );
    }

    const isMatch = await verifyPassword(password, userRecord.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    await setSessionCookie({
      id: userRecord.id,
      email: userRecord.email,
      roleId: userRecord.roleId,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        phone: userRecord.phone,
        companyName: userRecord.companyName,
        roleId: userRecord.roleId,
        roleName: userRecord.roleName || "cliente",
        discountPercentage: Number(userRecord.discountPercentage || 0),
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al iniciar sesión." },
      { status: 500 }
    );
  }
}
