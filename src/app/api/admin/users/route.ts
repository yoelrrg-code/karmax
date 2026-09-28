import { NextRequest, NextResponse } from "next/server";
import { db, users, roles } from "@/lib/db";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import { hashPassword } from "@/lib/auth/password";
import { eq, desc, sql, like, or } from "drizzle-orm";
import type { AdminUserItem, AdminRoleItem } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() || "";
    const roleIdParam = searchParams.get("roleId");

    const whereConditions = query
      ? or(
          like(users.name, `%${query}%`),
          like(users.email, `%${query}%`),
          like(users.companyName, `%${query}%`),
          like(users.phone, `%${query}%`)
        )
      : undefined;

    const [userRows, roleRows] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          companyName: users.companyName,
          roleId: users.roleId,
          roleName: roles.name,
          isActive: users.isActive,
          discountPercentage: users.discountPercentage,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          quotesCount: sql<number>`(SELECT COUNT(*) FROM quote_requests WHERE quote_requests.user_id = users.id)`,
        })
        .from(users)
        .leftJoin(roles, eq(users.roleId, roles.id))
        .where(whereConditions)
        .orderBy(desc(users.createdAt)),
      db
        .select({
          id: roles.id,
          name: roles.name,
          description: roles.description,
        })
        .from(roles)
        .orderBy(roles.id),
    ]);

    let filteredRows = userRows;
    if (roleIdParam) {
      const parsedRoleId = Number(roleIdParam);
      if (!isNaN(parsedRoleId)) {
        filteredRows = filteredRows.filter((r) => r.roleId === parsedRoleId);
      }
    }

    const userItems: AdminUserItem[] = filteredRows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone || null,
      companyName: r.companyName || null,
      roleId: r.roleId,
      roleName: r.roleName || (r.roleId === 1 ? "admin" : "cliente"),
      isActive: Boolean(r.isActive),
      discountPercentage: Number(r.discountPercentage || 0),
      quotesCount: Number(r.quotesCount || 0),
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined,
    }));

    const roleItems: AdminRoleItem[] = roleRows.map((rl) => ({
      id: rl.id,
      name: rl.name,
      description: rl.description || null,
    }));

    return NextResponse.json({
      users: userItems,
      roles: roleItems,
      total: userItems.length,
      currentUserId: guard.user?.id,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json(
      { error: "Error al consultar los usuarios" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      roleId,
      phone,
      companyName,
      discountPercentage,
      isActive,
    } = body;

    // Validations
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    const emailTrimmed = typeof email === "string" ? email.trim().toLowerCase() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      return NextResponse.json(
        { error: "Ingresa un correo electrónico válido" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    const targetRoleId = Number(roleId) || 2;
    // Check if role exists
    const [existingRole] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.id, targetRoleId))
      .limit(1);

    if (!existingRole) {
      return NextResponse.json(
        { error: "El rol seleccionado no es válido" },
        { status: 400 }
      );
    }

    // Check if email is already taken
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, emailTrimmed))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario registrado con este correo electrónico" },
        { status: 409 }
      );
    }

    // Parse discount
    let parsedDiscount = "0.00";
    if (discountPercentage !== undefined && discountPercentage !== null) {
      const num = Number(discountPercentage);
      if (!isNaN(num) && num >= 0 && num <= 100) {
        parsedDiscount = num.toFixed(2);
      }
    }

    const passwordHash = await hashPassword(password);

    const [result] = await db.insert(users).values({
      name: name.trim(),
      email: emailTrimmed,
      passwordHash,
      roleId: targetRoleId,
      phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
      companyName: typeof companyName === "string" && companyName.trim() ? companyName.trim() : null,
      discountPercentage: parsedDiscount,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Usuario creado exitosamente",
        userId: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/admin/users:", error);
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 }
    );
  }
}
