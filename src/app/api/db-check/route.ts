import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT 1 as is_connected, NOW() as current_time");
    connection.release();

    return NextResponse.json({
      status: "success",
      message: "Conexión a MySQL en DreamHost exitosa",
      data: rows,
    });
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string };
    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo conectar a la base de datos MySQL",
        errorCode: err.code || "UNKNOWN",
        errorMessage: err.message,
        tip: "Verifica que en el panel de DreamHost (MySQL Databases -> Allowable hosts) hayas agregado la IP desde donde te conectas, y que las variables DB_HOST, DB_USER, DB_PASSWORD y DB_NAME en .env.local sean correctas.",
      },
      { status: 500 }
    );
  }
}
