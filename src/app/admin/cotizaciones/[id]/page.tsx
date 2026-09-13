"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Building,
  Mail,
  MessageCircle,
  CheckCircle2,
  Save,
} from "lucide-react";

interface QuoteItem {
  id: number;
  productId: number | null;
  productName: string;
  presentation: string | null;
  sku: string | null;
  imageUrl: string | null;
  quantity: number;
  unitPrice: string | number | null;
  totalPrice: string | number | null;
}

interface QuoteDetail {
  id: number;
  quoteNumber: string | null;
  userId: number | null;
  customerName: string;
  companyName: string | null;
  email: string;
  phone: string;
  notes: string | null;
  subtotal: string | number | null;
  tax: string | number | null;
  total: string | number | null;
  status: string;
  createdAt: string;
}

export default function AdminQuoteDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [status, setStatus] = useState<string>("pending");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadQuote() {
      try {
        const res = await fetch(`/api/admin/quotes/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setQuote(data.quote);
            setItems(data.items || []);
            setStatus(data.quote.status || "pending");
            setAdminNotes(data.quote.notes || "");
          }
        }
      } catch (err) {
        console.error("Error loading quote detail:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    if (id) loadQuote();
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    setStatus(newStatus);
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/quotes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        showToast("Estado actualizado correctamente");
      }
    } catch {
      showToast("Error al actualizar el estado");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/quotes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, notes: adminNotes }),
      });
      if (res.ok) {
        showToast("Notas guardadas correctamente");
      }
    } catch {
      showToast("Error al guardar notas");
    } finally {
      setIsSaving(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">
        Cargando detalle de la cotización...
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-slate-500">No se encontró la cotización solicitada.</p>
        <Link
          href="/admin/cotizaciones"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--dark-blue-karmax)] underline"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al listado
        </Link>
      </div>
    );
  }

  // Sanitize phone for WhatsApp
  const cleanPhone = quote.phone?.replace(/[^0-9]/g, "") || "";
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith("52") ? cleanPhone : `52${cleanPhone}`}?text=${encodeURIComponent(
        `Hola ${quote.customerName}, te escribimos de KARMAX en relación a tu cotización ${quote.quoteNumber || ""}.`
      )}`
    : null;

  const dateFormatted = quote.createdAt
    ? new Date(quote.createdAt).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Status Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin/cotizaciones"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[var(--blue-karmax)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Cotizaciones</span>
        </Link>

        {/* Status Dropdown / Buttons */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">
            Estado:
          </label>
          <select
            value={status}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            disabled={isSaving}
            className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-[var(--blue-karmax)] focus:outline-none focus:ring-2 focus:ring-[var(--green-karmax)]/20 cursor-pointer"
          >
            <option value="pending">⏳ Pendiente</option>
            <option value="contacted">📞 Contactado</option>
            <option value="approved">✅ Aprobado</option>
            <option value="rejected">❌ Rechazado</option>
            <option value="saved">💾 Borrador</option>
          </select>
        </div>
      </div>

      {/* Quote Summary Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-semibold text-slate-900 font-mono">
              {quote.quoteNumber || `#${quote.id.toString().padStart(6, "0")}`}
            </h3>
            <span
              className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                status === "pending"
                  ? "bg-amber-100 text-amber-800"
                  : status === "approved"
                  ? "bg-emerald-100 text-emerald-800"
                  : status === "contacted"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Recibida el {dateFormatted}
          </p>
        </div>

        {/* Action Buttons for communication */}
        <div className="flex flex-wrap items-center gap-2.5">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-xs transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contactar por WhatsApp</span>
            </a>
          )}
          {quote.email && (
            <a
              href={`mailto:${quote.email}?subject=${encodeURIComponent(
                `Cotización KARMAX ${quote.quoteNumber || ""}`
              )}`}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3.5 rounded-xl transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Enviar Correo</span>
            </a>
          )}
        </div>
      </div>

      {/* Grid 2 Columns: Client Info & Financials */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Col 1: Customer Details (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3">
            Datos del Cliente
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Nombre Completo</p>
              <p className="text-slate-900 font-semibold text-sm mt-0.5">
                {quote.customerName}
              </p>
            </div>

            <div>
              <p className="text-slate-400 font-medium">Empresa / Razón Social</p>
              <p className="text-[var(--blue-karmax)] font-semibold text-sm mt-0.5 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {quote.companyName || "No especificada"}
              </p>
            </div>

            <div>
              <p className="text-slate-400 font-medium">Correo Electrónico</p>
              <a
                href={`mailto:${quote.email}`}
                className="text-[var(--dark-blue-karmax)] font-semibold mt-0.5 block hover:underline"
              >
                {quote.email}
              </a>
            </div>

            <div>
              <p className="text-slate-400 font-medium">Teléfono / Celular</p>
              <a
                href={`tel:${quote.phone}`}
                className="text-[var(--blue-karmax)] font-semibold mt-0.5 block hover:underline"
              >
                {quote.phone || "No especificado"}
              </a>
            </div>
          </div>
        </div>

        {/* Col 2: Financial Summary (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3">
              Resumen Económico
            </h3>

            <div className="space-y-2.5 mt-4 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal estimado</span>
                <span className="font-semibold text-slate-900">
                  ${Number(quote.subtotal || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>IVA estimado (16%)</span>
                <span className="font-semibold text-slate-900">
                  ${Number(quote.tax || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">Total Cotizado</span>
            <span className="text-xl font-semibold text-[var(--green-karmax)]">
              ${Number(quote.total || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">
            Productos Solicitados ({items.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Detalle de los artículos, presentaciones y SKUs de variación seleccionados
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Producto</th>
                <th className="px-5 py-3">Presentación / Aroma</th>
                <th className="px-5 py-3">SKU de Variación</th>
                <th className="px-5 py-3 text-center">Cantidad</th>
                <th className="px-5 py-3 text-right">Precio Unit.</th>
                <th className="px-5 py-3 text-right">Importe Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No hay productos asociados a esta cotización.
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 relative bg-slate-50 rounded-lg p-1 border border-slate-100 flex-shrink-0">
                          <Image
                            src={it.imageUrl || "/images/products/placeholder.jpg"}
                            alt={it.productName}
                            fill
                            className="object-contain p-0.5"
                            sizes="40px"
                          />
                        </div>
                        <p className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-1">
                          {it.productName}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-700">
                      {it.presentation || "Estándar"}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-[var(--blue-karmax)]">
                      {it.sku || "—"}
                    </td>
                    <td className="px-5 py-4 text-center font-semibold text-slate-900">
                      {it.quantity}
                    </td>
                    <td className="px-5 py-4 text-right text-xs text-slate-700">
                      ${Number(it.unitPrice || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-900">
                      ${Number(it.totalPrice || (Number(it.unitPrice || 0) * it.quantity)).toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3">
          Notas y Seguimiento Interno
        </h3>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Notas de la cotización / Comentarios de seguimiento:
          </label>
          <textarea
            rows={4}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Añade observaciones, condiciones pactadas o historial de contacto con el cliente..."
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveNotes}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Notas</span>
          </button>
        </div>
      </div>
    </div>
  );
}
