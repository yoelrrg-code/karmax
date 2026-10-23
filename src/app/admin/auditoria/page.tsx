"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  FileCode,
  Globe,
  Tag,
  AlertCircle,
} from "lucide-react";
import type { AuditLogItem, AuditLogResponse } from "@/types";
import { sileo } from "sileo";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");
  const [selectedAction, setSelectedAction] = useState("all");

  // Modal de detalles
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (selectedModule !== "all") params.set("module", selectedModule);
      if (selectedAction !== "all") params.set("action", selectedAction);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error("Error al consultar logs de auditoría");

      const data: AuditLogResponse = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      sileo.error({ title: "Error", description: "No se pudieron cargar los registros de auditoría" });
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedModule, selectedAction]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    switch (act) {
      case "CREAR":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            CREAR
          </span>
        );
      case "ACTUALIZAR":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            ACTUALIZAR
          </span>
        );
      case "ELIMINAR":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            ELIMINAR
          </span>
        );
      case "SINCRONIZAR":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            SINCRONIZAR
          </span>
        );
      case "LOGIN":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            LOGIN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            {act}
          </span>
        );
    }
  };

  const getModuleBadge = (moduleName: string) => {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
        <Tag className="w-3 h-3 text-slate-400" />
        {moduleName}
      </span>
    );
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(d);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/60 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Logs de Auditoría</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Registro histórico y trazabilidad de operaciones realizadas en el panel de administración
            </p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-xs hover:bg-slate-50 transition-colors disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        {/* Input de Búsqueda */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por usuario, email, target o dirección IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtro por Módulo */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={selectedModule}
            onChange={(e) => {
              setSelectedModule(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
          >
            <option value="all">Todos los Módulos</option>
            <option value="Productos">Productos</option>
            <option value="Categorías">Categorías</option>
            <option value="Industrias">Industrias</option>
            <option value="Ajustes">Ajustes Generales</option>
            <option value="Usuarios">Usuarios</option>
            <option value="Cotizaciones">Cotizaciones</option>
            <option value="Secciones">Secciones</option>
          </select>
        </div>

        {/* Filtro por Acción */}
        <div>
          <select
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-auto px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
          >
            <option value="all">Todas las Acciones</option>
            <option value="CREAR">CREAR</option>
            <option value="ACTUALIZAR">ACTUALIZAR</option>
            <option value="ELIMINAR">ELIMINAR</option>
            <option value="SINCRONIZAR">SINCRONIZAR</option>
            <option value="LOGIN">LOGIN</option>
          </select>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Fecha y Hora</th>
                <th className="py-3.5 px-4">Usuario</th>
                <th className="py-3.5 px-4">Módulo</th>
                <th className="py-3.5 px-4">Acción</th>
                <th className="py-3.5 px-4">Elemento Afectado</th>
                <th className="py-3.5 px-4">Dirección IP</th>
                <th className="py-3.5 px-4 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-blue-500" />
                    <span>Cargando registros de auditoría...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No se encontraron registros de auditoría</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Ajusta los filtros o realiza modificaciones en el panel para generar eventos.
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Fecha y Hora */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </td>

                    {/* Usuario */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 text-xs truncate">{item.userName}</div>
                          <div className="text-xs text-slate-400 truncate">{item.userEmail}</div>
                        </div>
                      </div>
                    </td>

                    {/* Módulo */}
                    <td className="py-3.5 px-4 whitespace-nowrap">{getModuleBadge(item.module)}</td>

                    {/* Acción */}
                    <td className="py-3.5 px-4 whitespace-nowrap">{getActionBadge(item.action)}</td>

                    {/* Elemento Afectado */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 text-xs truncate max-w-[220px]">
                        {item.targetName || item.targetId || "—"}
                      </div>
                      {item.targetId && item.targetName && (
                        <div className="text-[11px] text-slate-400">ID: {item.targetId}</div>
                      )}
                    </td>

                    {/* Dirección IP */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {item.ipAddress || "127.0.0.1"}
                      </span>
                    </td>

                    {/* Detalle */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {total > 0 && (
          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Mostrando <span className="font-medium text-slate-700">{logs.length}</span> de{" "}
              <span className="font-medium text-slate-700">{total}</span> registros de auditoría
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-medium text-slate-700">
                Página {page} de {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalle JSON del Log */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900 text-base">
                  Detalles del Registro #{selectedLog.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Usuario:</span>
                  <p className="font-medium text-slate-800">{selectedLog.userName}</p>
                  <p className="text-xs text-slate-500">{selectedLog.userEmail}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Fecha y Hora:</span>
                  <p className="font-medium text-slate-800">{formatDate(selectedLog.createdAt)}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Módulo & Acción:</span>
                  <div className="flex items-center gap-2 mt-1">
                    {getModuleBadge(selectedLog.module)}
                    {getActionBadge(selectedLog.action)}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">IP Origen:</span>
                  <p className="font-mono text-xs text-slate-700 mt-1">{selectedLog.ipAddress || "127.0.0.1"}</p>
                </div>
              </div>

              {selectedLog.targetName && (
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Elemento Afectado:</span>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {selectedLog.targetName} {selectedLog.targetId ? `(ID: ${selectedLog.targetId})` : ""}
                  </p>
                </div>
              )}

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Detalles / Payload (JSON):</span>
                <pre className="mt-2 p-3.5 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
                  {selectedLog.details && Object.keys(selectedLog.details).length > 0
                    ? JSON.stringify(selectedLog.details, null, 2)
                    : "// No se registraron metadatos adicionales"}
                </pre>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
