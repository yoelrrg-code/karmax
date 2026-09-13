import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { db, users, roles } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export interface AdminSessionUser {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
}

/**
 * Ensures the current request has an authenticated admin session.
 * Used in Server Components and Layouts.
 * Redirects to home page if not an admin.
 */
export async function requireAdminSession(): Promise<AdminSessionUser> {
  const session = await getSessionUser();
  if (!session?.userId) {
    redirect("/?login=true");
  }

  const [userRecord] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleId: users.roleId,
      isActive: users.isActive,
      roleName: roles.name,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!userRecord || !userRecord.isActive || userRecord.roleName !== "admin") {
    redirect("/");
  }

  return {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    roleId: userRecord.roleId,
    roleName: userRecord.roleName || "admin",
  };
}

/**
 * Checks if the current request is from an admin user.
 * Returns null if not authenticated or not an admin.
 */
export async function getAdminSession(): Promise<AdminSessionUser | null> {
  try {
    const session = await getSessionUser();
    if (!session?.userId) return null;

    const [userRecord] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        roleId: users.roleId,
        isActive: users.isActive,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!userRecord || !userRecord.isActive || userRecord.roleName !== "admin") {
      return null;
    }

    return {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      roleId: userRecord.roleId,
      roleName: userRecord.roleName || "admin",
    };
  } catch {
    return null;
  }
}

/**
 * Guard wrapper for API route handlers.
 * Returns 401 or 403 response if not authorized.
 */
export async function requireAdminApi(): Promise<{ user?: AdminSessionUser; response?: NextResponse }> {
  const admin = await getAdminSession();
  if (!admin) {
    return {
      response: NextResponse.json(
        { error: "Acceso denegado: se requieren permisos de administrador" },
        { status: 403 }
      ),
    };
  }
  return { user: admin };
}
