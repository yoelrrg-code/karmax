import { NextRequest, NextResponse } from "next/server";
import { db, users, roles, quoteRequests } from "@/lib/db";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import { hashPassword } from "@/lib/auth/password";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  try {
    const { id } = await params;
    const userId = Number(id);
    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 });
    }

    const [userRecord] = await db
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
      .where(eq(users.id, userId))
      .limit(1);

    if (!userRecord) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        phone: userRecord.phone || null,
        companyName: userRecord.companyName || null,
        roleId: userRecord.roleId,
        roleName: userRecord.roleName || (userRecord.roleId === 1 ? "admin" : "cliente"),
        isActive: Boolean(userRecord.isActive),
        discountPercentage: Number(userRecord.discountPercentage || 0),
        quotesCount: Number(userRecord.quotesCount || 0),
        createdAt: userRecord.createdAt ? new Date(userRecord.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: userRecord.updatedAt ? new Date(userRecord.updatedAt).toISOString() : undefined,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/admin/users/[id]:", error);
    return NextResponse.json(
      { error: "Error al obtener el usuario" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  try {
    const { id } = await params;
    const userId = Number(id);
    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 });
    }

    // Check user exists
    const [existingUser] = await db
      .select({
        id: users.id,
        email: users.email,
        roleId: users.roleId,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

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

    const isSelf = guard.user?.id === userId;

    const updateData: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };

    // Name
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { error: "El nombre no puede estar vacío" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    // Email
    if (email !== undefined) {
      const emailTrimmed = typeof email === "string" ? email.trim().toLowerCase() : "";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
        return NextResponse.json(
          { error: "Ingresa un correo electrónico válido" },
          { status: 400 }
        );
      }

      if (emailTrimmed !== existingUser.email) {
        const [conflict] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, emailTrimmed))
          .limit(1);

        if (conflict) {
          return NextResponse.json(
            { error: "Ya existe un usuario con este correo electrónico" },
            { status: 409 }
          );
        }
        updateData.email = emailTrimmed;
      }
    }

    // Password (optional on update)
    if (password !== undefined && password !== null && password !== "") {
      if (typeof password !== "string" || password.length < 8) {
        return NextResponse.json(
          { error: "La contraseña debe tener al menos 8 caracteres" },
          { status: 400 }
        );
      }
      updateData.passwordHash = await hashPassword(password);
    }

    // Role
    if (roleId !== undefined) {
      const newRoleId = Number(roleId);
      if (isNaN(newRoleId)) {
        return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
      }

      // Check role exists
      const [roleExists] = await db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.id, newRoleId))
        .limit(1);

      if (!roleExists) {
        return NextResponse.json({ error: "El rol seleccionado no existe" }, { status: 400 });
      }

      // Self-demotion guard
      if (isSelf && newRoleId !== existingUser.roleId) {
        return NextResponse.json(
          { error: "No puedes modificar tu propio rol de administrador" },
          { status: 400 }
        );
      }

      updateData.roleId = newRoleId;
    }

    // IsActive
    if (isActive !== undefined) {
      const boolActive = Boolean(isActive);
      // Self-deactivation guard
      if (isSelf && !boolActive) {
        return NextResponse.json(
          { error: "No puedes desactivar tu propia cuenta de usuario" },
          { status: 400 }
        );
      }
      updateData.isActive = boolActive;
    }

    // Phone & Company
    if (phone !== undefined) {
      updateData.phone = typeof phone === "string" && phone.trim() ? phone.trim() : null;
    }

    if (companyName !== undefined) {
      updateData.companyName = typeof companyName === "string" && companyName.trim() ? companyName.trim() : null;
    }

    // Discount percentage
    if (discountPercentage !== undefined && discountPercentage !== null) {
      const num = Number(discountPercentage);
      if (isNaN(num) || num < 0 || num > 100) {
        return NextResponse.json(
          { error: "El descuento debe ser un porcentaje entre 0 y 100" },
          { status: 400 }
        );
      }
      updateData.discountPercentage = num.toFixed(2);
    }

    await db.update(users).set(updateData).where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: "Usuario actualizado exitosamente",
      userId,
    });
  } catch (error) {
    console.error("Error in PUT /api/admin/users/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar el usuario" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  try {
    const { id } = await params;
    const userId = Number(id);
    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 });
    }

    // Guard against self-deletion
    if (guard.user?.id === userId) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propia cuenta de administrador" },
        { status: 400 }
      );
    }

    // Check user exists
    const [targetUser] = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Disconnect quotes to prevent foreign key errors and preserve historical quotes
    await db
      .update(quoteRequests)
      .set({ userId: null })
      .where(eq(quoteRequests.userId, userId));

    // Delete user
    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: `Usuario ${targetUser.name} eliminado exitosamente`,
    });
  } catch (error) {
    console.error("Error in DELETE /api/admin/users/[id]:", error);
    return NextResponse.json(
      { error: "Error al eliminar el usuario" },
      { status: 500 }
    );
  }
}
