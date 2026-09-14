import { NextRequest, NextResponse } from "next/server";
import { db, contactMessages } from "@/lib/db";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { status } = body;

    const validStatuses = ["unread", "read", "replied"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Estado inválido. Debe ser uno de: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    await db
      .update(contactMessages)
      .set({ status })
      .where(eq(contactMessages.id, id));

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Error in PATCH /api/admin/contact-messages/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar el mensaje de contacto" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminApi();
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await db.delete(contactMessages).where(eq(contactMessages.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/admin/contact-messages/[id]:", error);
    return NextResponse.json(
      { error: "Error al eliminar el mensaje de contacto" },
      { status: 500 }
    );
  }
}
