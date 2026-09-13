"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Phone,
  Building,
} from "lucide-react";

interface QuoteItem {
  id: number;
  productName: string;
  quantity: number;
  presentation?: string;
  sku?: string;
}

interface QuoteRequestItem {
  id: number;
  quoteNumber: string | null;
  customerName: string;
  companyName: string | null;
  email: string;
  phone: string;
  total: string | number | null;
  status: string;
  createdAt: string;
  itemsCount: number;
  items: QuoteItem[];
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequestItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (search.trim()) params.set("search", search.trim());
        params.set("page", String(page));
        params.set("limit", "15");

        const res = await fetch(`/api/admin/quotes?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setQuotes(data.quotes || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
          }
        }
      } catch (err) {
        console.error("Error fetching quotes:", err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [statusFilter, search, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPage(1);
    setSearch(searchInput);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Pendiente
          </span>
        );
      case "contacted":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Contactado
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Aprobado
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" /> Rechazado
          </span>
        );
      case "saved":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Borrador Guardado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[var(--dark-blue-karmax)]" />
            Cotizaciones de Clientes
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Revisa, filtra y da seguimiento a todas las solicitudes de cotización recibidas.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "Todas" },
              { id: "pending", label: "Pendientes" },
              { id: "contacted", label: "Contactadas" },
              { id: "approved", label: "Aprobadas" },
              { id: "rejected", label: "Rechazadas" },
              { id: "saved", label: "Borradores" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-[var(--dark-blue-karmax)] text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Buscar por folio, cliente o correo..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Folio / Fecha</th>
                <th className="px-5 py-3.5">Cliente</th>
                <th className="px-5 py-3.5">Contacto</th>
                <th className="px-5 py-3.5 text-center">Items</th>
                <th className="px-5 py-3.5">Total Est.</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Cargando cotizaciones...
                  </td>
                </tr>
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No se encontraron cotizaciones con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                quotes.map((q) => {
                  const dateStr = q.createdAt
                    ? new Date(q.createdAt).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-mono font-bold text-slate-900 text-xs">
                          {q.quoteNumber || `#${q.id.toString().padStart(6, "0")}`}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{dateStr}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{q.customerName}</p>
                        {q.companyName && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400" />
                            {q.companyName}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs text-slate-700">{q.email}</p>
                        {q.phone && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {q.phone}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
                          {q.itemsCount || q.items?.length || 0}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-[var(--green-karmax)]">
                        ${Number(q.total || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4">{getStatusBadge(q.status)}</td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/cotizaciones/${q.id}`}
                          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-[var(--dark-blue-karmax)] hover:text-white text-slate-700 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Total: {total} cotizaciones (Página {page} de {totalPages})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
