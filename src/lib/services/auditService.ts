import { db, auditLogs } from "@/lib/db";
import { desc, eq, and, sql, or, like } from "drizzle-orm";
import type { AuditLogItem, AuditLogResponse } from "@/types";
import { getClientIp } from "@/lib/security/rateLimiter";
import { escapeLikePattern } from "@/lib/security/sql";

export interface RecordAuditParams {
  userId?: number | null;
  userName: string;
  userEmail: string;
  action: "CREAR" | "ACTUALIZAR" | "ELIMINAR" | "LOGIN" | "SINCRONIZAR" | string;
  module: "Productos" | "Categorías" | "Industrias" | "Ajustes" | "Usuarios" | "Cotizaciones" | "Secciones" | string;
  targetId?: string | number | null;
  targetName?: string | null;
  details?: Record<string, unknown> | null;
  request?: Request;
  ipAddress?: string | null;
}

export interface GetAuditLogsOptions {
  page?: number;
  limit?: number;
  search?: string;
  module?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Registra de forma segura y no bloqueante una acción de auditoría en la base de datos.
 * Captura usuario, módulo, acción, target, IP y timestamp.
 */
export async function recordAuditLog(params: RecordAuditParams): Promise<void> {
  try {
    const ip = params.ipAddress || (params.request ? getClientIp(params.request) : "127.0.0.1");

    await db.insert(auditLogs).values({
      userId: params.userId ? Number(params.userId) : null,
      userName: String(params.userName || "Administrador").slice(0, 255),
      userEmail: String(params.userEmail || "admin@karmax.mx").slice(0, 255),
      action: String(params.action).toUpperCase().slice(0, 50),
      module: String(params.module).slice(0, 100),
      targetId: params.targetId ? String(params.targetId).slice(0, 100) : null,
      targetName: params.targetName ? String(params.targetName).slice(0, 255) : null,
      details: params.details || null,
      ipAddress: ip ? String(ip).slice(0, 100) : null,
      createdAt: new Date(),
    });
  } catch (error) {
    // La auditoría nunca debe romper la operación primaria si la BD o tabla tiene un fallo transitorio
    console.error("Error al registrar log de auditoría:", error);
  }
}

/**
 * Obtiene los registros de auditoría paginados y filtrables para el panel de administración.
 */
export async function getAuditLogs(options: GetAuditLogsOptions = {}): Promise<AuditLogResponse> {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(options.limit) || 20));
  const offset = (page - 1) * limit;

  try {
    const conditions = [];

    if (options.module && options.module !== "all") {
      conditions.push(eq(auditLogs.module, options.module));
    }

    if (options.action && options.action !== "all") {
      conditions.push(eq(auditLogs.action, options.action.toUpperCase()));
    }

    if (options.search && options.search.trim()) {
      const term = `%${escapeLikePattern(options.search.trim())}%`;
      conditions.push(
        or(
          like(auditLogs.userName, term),
          like(auditLogs.userEmail, term),
          like(auditLogs.targetName, term),
          like(auditLogs.targetId, term),
          like(auditLogs.module, term),
          like(auditLogs.action, term),
          like(auditLogs.ipAddress, term)
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(whereClause);

    const total = Number(countRes?.count || 0);

    const rows = await db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.id))
      .limit(limit)
      .offset(offset);

    const mappedLogs: AuditLogItem[] = rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.userName,
      userEmail: r.userEmail,
      action: r.action,
      module: r.module,
      targetId: r.targetId,
      targetName: r.targetName,
      details: (r.details as Record<string, unknown>) || null,
      ipAddress: r.ipAddress,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }));

    return {
      logs: mappedLogs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    };
  } catch (error) {
    console.error("Error al consultar logs de auditoría:", error);
    return {
      logs: [],
      total: 0,
      page,
      totalPages: 0,
      limit,
    };
  }
}
