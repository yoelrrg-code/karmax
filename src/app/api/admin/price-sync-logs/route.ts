import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import { getPriceSyncLogs, clearPriceSyncLogs } from "@/lib/services/karmaxService";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 20, 1), 100);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const offset = (page - 1) * limit;

    const data = await getPriceSyncLogs({ limit, offset });

    return NextResponse.json({
      success: true,
      logs: data.logs,
      total: data.total,
      page,
      limit,
      totalPages: Math.ceil(data.total / limit) || 1,
    });
  } catch (error) {
    console.error("Error en GET /api/admin/price-sync-logs:", error);
    return NextResponse.json(
      { error: "Error al obtener los logs de sincronización" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const success = await clearPriceSyncLogs();
    return NextResponse.json({
      success,
      message: success ? "Historial de logs eliminado correctamente." : "No se pudo limpiar el historial.",
    });
  } catch (error) {
    console.error("Error en DELETE /api/admin/price-sync-logs:", error);
    return NextResponse.json(
      { error: "Error al limpiar los logs de sincronización" },
      { status: 500 }
    );
  }
}
