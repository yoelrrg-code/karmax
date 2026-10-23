import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import { getAuditLogs } from "@/lib/services/auditService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit")) || 20));
    const search = searchParams.get("search") || undefined;
    const module = searchParams.get("module") || undefined;
    const action = searchParams.get("action") || undefined;

    const data = await getAuditLogs({
      page,
      limit,
      search,
      module,
      action,
    });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Error en GET /api/admin/audit-logs:", error);
    return NextResponse.json(
      { error: "Error al obtener los logs de auditoría" },
      { status: 500 }
    );
  }
}
