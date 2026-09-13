import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdminApi } from "@/lib/auth/adminGuard";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT 1 as is_connected, NOW() as current_time");
    connection.release();

    return NextResponse.json({
      status: "success",
      message: "Conexión a base de datos operativa",
      data: rows,
    });
  } catch (error: unknown) {
    const isDev = process.env.NODE_ENV !== "production";
    const err = error as { message?: string; code?: string };
    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo conectar a la base de datos",
        ...(isDev ? { errorCode: err.code, errorMessage: err.message } : {}),
      },
      { status: 500 }
    );
  }
}
