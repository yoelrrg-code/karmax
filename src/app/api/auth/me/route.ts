import { NextResponse } from "next/server";
import { db, users, roles } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const [userRecord] = await db
      .select({
        id: users.id,
        roleId: users.roleId,
        name: users.name,
        email: users.email,
        phone: users.phone,
        companyName: users.companyName,
        isActive: users.isActive,
        discountPercentage: users.discountPercentage,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!userRecord || !userRecord.isActive) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
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
    console.error("Error fetching session user:", error);
    return NextResponse.json({ user: null });
  }
}
