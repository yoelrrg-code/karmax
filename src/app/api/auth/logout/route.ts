import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging out:", error);
    return NextResponse.json({ error: "Error al cerrar sesión" }, { status: 500 });
  }
}
