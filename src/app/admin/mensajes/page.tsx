"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Search,
  CheckCircle2,
  Eye,
  Phone,
  Building,
  Trash2,
  X,
  MessageSquare,
  Loader2,
  Calendar,
} from "lucide-react";
import { WhatsappIcon } from "@/components/icons";
import type { ContactMessageItem } from "@/types";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Modal de detalle
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchList() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (search.trim()) params.set("search", search.trim());
        params.set("page", String(page));
        params.set("limit", "15");

        const res = await fetch(`/api/admin/contact-messages?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setMessages(data.messages || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
            setUnreadCount(data.unreadCount || 0);
          }
        }
      } catch (err) {
        console.error("Error cargando mensajes:", err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchList();

    return () => {
      ignore = true;
    };
  }, [statusFilter, search, page, refreshIndex]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleStatusChange = async (messageId: number, newStatus: "unread" | "read" | "replied") => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Actualizar estado local
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, status: newStatus } : m))
        );
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        // Actualizar contador de no leídos
        setRefreshIndex((k) => k + 1);
      }
    } catch (err) {
      console.error("Error al actualizar estado del mensaje:", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async (messageId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este mensaje? Esta acción no se puede deshacer.")) {
      return;
    }

    setDeletingId(messageId);
    try {
      const res = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
        setRefreshIndex((k) => k + 1);
      }
    } catch (err) {
      console.error("Error al eliminar mensaje:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const openDetailModal = (msg: ContactMessageItem) => {
    setSelectedMessage(msg);
    // Si está no leído, marcarlo automáticamente como leído al abrir
    if (msg.status === "unread") {
      handleStatusChange(msg.id, "read");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            No leído
          </span>
        );
      case "read":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Eye className="w-3 h-3" /> Leído
          </span>
        );
      case "replied":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Respondido
          </span>
        );
      default:
        return (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Mensajes de Contacto
            </h1>
            {unreadCount > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount} {unreadCount === 1 ? "nuevo" : "nuevos"}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Consultas y solicitudes de clientes recibidas desde la página de contacto.
          </p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs de estado */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "Todos" },
              { id: "unread", label: "No leídos" },
              { id: "read", label: "Leídos" },
              { id: "replied", label: "Respondidos" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.id
                    ? "bg-[var(--blue-karmax)] text-white font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Buscador */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, empresa..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--blue-karmax)] bg-slate-50/50"
            />
          </form>
        </div>
      </div>

      {/* Tabla de Mensajes */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[var(--blue-karmax)]" />
            <p className="text-sm">Cargando mensajes...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-700">No se encontraron mensajes</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {search || statusFilter !== "all"
                ? "No hay mensajes que coincidan con los filtros seleccionados."
                : "Aún no se han recibido mensajes a través del formulario de contacto."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Cliente / Empresa</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Mensaje</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
                {messages.map((m) => {
                  const cleanPhone = m.phone.replace(/[^0-9]/g, "");
                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        m.status === "unread" ? "bg-amber-50/20 font-medium" : ""
                      }`}
                    >
                      {/* Fecha */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-xs">
                        {formatDate(m.createdAt)}
                      </td>

                      {/* Cliente / Empresa */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{m.fullName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          {m.company}
                        </div>
                      </td>

                      {/* Contacto */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <a
                            href={`mailto:${m.email}`}
                            className="hover:text-[var(--blue-karmax)] underline decoration-slate-300"
                          >
                            {m.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                          <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <a href={`tel:${m.phone}`} className="hover:text-[var(--blue-karmax)]">
                            {m.phone}
                          </a>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--green-karmax)] hover:opacity-80 inline-flex items-center"
                              title="Abrir chat en WhatsApp"
                            >
                              <WhatsappIcon size={14} />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Extracto de mensaje */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                        {m.message}
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(m.status)}
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openDetailModal(m)}
                            className="p-1.5 text-slate-500 hover:text-[var(--blue-karmax)] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Ver detalle del mensaje"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === m.id}
                            onClick={() => handleDelete(m.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                            title="Eliminar mensaje"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200/80 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Mostrando página {page} de {totalPages} ({total} mensajes en total)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalle de Mensaje */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[var(--blue-karmax)] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Detalle del Mensaje</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {formatDate(selectedMessage.createdAt)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del Mensaje */}
            <div className="p-6 space-y-5">
              {/* Tarjeta de Datos del Remitente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 text-xs block mb-0.5">Nombre completo</span>
                  <strong className="text-slate-900 font-semibold">{selectedMessage.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block mb-0.5">Empresa</span>
                  <span className="text-slate-800 font-medium">{selectedMessage.company}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block mb-0.5">Correo electrónico</span>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-[var(--blue-karmax)] hover:underline font-medium"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block mb-0.5">Teléfono</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${selectedMessage.phone}`}
                      className="text-slate-800 hover:text-[var(--blue-karmax)] font-medium"
                    >
                      {selectedMessage.phone}
                    </a>
                    {selectedMessage.phone.replace(/[^0-9]/g, "") && (
                      <a
                        href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--green-karmax)] hover:opacity-80"
                        title="Enviar WhatsApp"
                      >
                        <WhatsappIcon size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Cuerpo del Mensaje */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Mensaje recibido:
                </label>
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Selector de Estado */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Estado:</span>
                  <select
                    value={selectedMessage.status}
                    disabled={isUpdatingStatus}
                    onChange={(e) =>
                      handleStatusChange(
                        selectedMessage.id,
                        e.target.value as "unread" | "read" | "replied"
                      )
                    }
                    className="text-xs text-[var(--text-karmax)] font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[var(--blue-karmax)]"
                  >
                    <option value="unread">No leído</option>
                    <option value="read">Leído</option>
                    <option value="replied">Respondido</option>
                  </select>
                </div>

                {/* Botones de acción directa */}
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Respuesta a tu consulta en KARMAX`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-blue-50 text-[var(--blue-karmax)] hover:bg-blue-100 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Responder por Email
                  </a>
                  {selectedMessage.phone.replace(/[^0-9]/g, "") && (
                    <a
                      href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, "")}?text=Hola%20${encodeURIComponent(
                        selectedMessage.fullName
                      )},%20te%20contactamos%20de%20KARMAX%20en%20relación%20a%20tu%20mensaje`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <WhatsappIcon size={14} />
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
