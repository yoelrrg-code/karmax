"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useQuote, SavedQuotePayload } from "@/context/QuoteContext";
import { FileText, ChevronRight, Clock, CheckCircle2, ArrowRight, Eye, X } from "lucide-react";

interface QuoteItemData {
  id: number;
  productId?: number | null;
  productName: string;
  presentation?: string | null;
  sku?: string | null;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: string | number;
  totalPrice: string | number;
}

interface QuoteData {
  id: number;
  quoteNumber: string;
  customerName: string;
  companyName?: string | null;
  email: string;
  phone: string;
  notes?: string | null;
  subtotal: string | number;
  tax: string | number;
  total: string | number;
  status: "saved" | "pending" | "processed" | string;
  createdAt: string;
  items: QuoteItemData[];
}

export default function MisCotizacionesPage() {
  const { user, isLoading: isAuthLoading, openAuthModal } = useAuth();
  const { loadSavedQuote, openDrawer } = useQuote();

  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [quotesLoaded, setQuotesLoaded] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteData | null>(null);

  const isLoading = isAuthLoading || (!!user && !quotesLoaded);

  useEffect(() => {
    if (!user) return;

    let ignore = false;

    fetch("/api/quotes")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && Array.isArray(data.quotes)) {
          setQuotes(data.quotes);
        }
      })
      .catch((err) => console.error("Error fetching quotes:", err))
      .finally(() => {
        if (!ignore) setQuotesLoaded(true);
      });

    return () => {
      ignore = true;
    };
  }, [user]);

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "number" ? amount : parseFloat(String(amount)) || 0;
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const handleContinueQuote = (quote: QuoteData) => {
    const payload: SavedQuotePayload = {
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      notes: quote.notes,
      subtotal: quote.subtotal,
      tax: quote.tax,
      total: quote.total,
      items: quote.items.map((it) => ({
        productId: it.productId ?? it.id,
        productName: it.productName,
        presentation: it.presentation,
        sku: it.sku,
        imageUrl: it.imageUrl,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
      })),
    };

    loadSavedQuote(payload);
    openDrawer();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-[var(--green-karmax)] transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 font-semibold">Mis Cotizaciones</span>
        </nav>

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 mb-8">
          <div>
            <h1 className="font-semibold text-[var(--dark-blue-karmax)]">
              Mis Cotizaciones
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Consulta el estado de tus cotizaciones enviadas y continúa con tus borradores guardados.
            </p>
          </div>
          <Link
            href="/productos"
            className="inline-flex items-center justify-center gap-2 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer self-start sm:self-auto"
          >
            <span>Explorar catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Estado de carga */}
        {isLoading ? (
          /* Skeleton loading */
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs animate-pulse flex items-center justify-between"
              >
                <div className="space-y-2">
                  <div className="h-5 bg-slate-200 rounded-md w-36" />
                  <div className="h-3 bg-slate-100 rounded-md w-24" />
                </div>
                <div className="h-8 bg-slate-200 rounded-full w-28" />
              </div>
            ))}
          </div>
        ) : !user ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-md mx-auto shadow-sm border border-slate-100 my-12">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[var(--green-karmax)] flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Inicia sesión en tu cuenta</h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Para visualizar tu historial y cotizaciones guardadas, debes iniciar sesión con tu cuenta de cliente.
            </p>
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="w-full bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer text-sm"
            >
              Iniciar sesión / Registrarme
            </button>
          </div>
        ) : quotes.length === 0 ? (
          /* Lista vacía */
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm border border-slate-100 my-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Aún no tienes cotizaciones</h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Agrega productos desde nuestro catálogo y cotiza fácilmente para ver el historial aquí.
            </p>
            <Link
              href="/productos"
              className="inline-flex items-center justify-center gap-2 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer text-sm"
            >
              Ir al catálogo de productos
            </Link>
          </div>
        ) : (
          /* Tabla / Cards de cotizaciones */
          <div className="space-y-4">
            {quotes.map((q) => {
              const isSaved = q.status === "saved";
              const itemsCount = q.items?.reduce((acc, it) => acc + it.quantity, 0) || 0;

              return (
                <div key={q.id}
                  className="bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        isSaved ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-[var(--green-karmax)]"
                      }`}
                    >
                      {isSaved ? <Clock className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-base sm:text-lg text-[var(--dark-blue-karmax)]">
                          Cotización #{q.quoteNumber}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            isSaved
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isSaved ? "Borrador guardado" : "Enviada a Karmax"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Registrada el {formatDate(q.createdAt)} • {itemsCount} {itemsCount === 1 ? "producto" : "productos"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
                        Total
                      </span>
                      <span className="text-lg font-bold text-slate-900">
                        {formatCurrency(q.total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedQuote(q)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                        title="Ver detalle de productos"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Detalle</span>
                      </button>

                      {isSaved && (
                        <button
                          type="button"
                          onClick={() => handleContinueQuote(q)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] transition-colors shadow-xs hover:shadow-md cursor-pointer"
                        >
                          <span>Continuar</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Detalle de Cotización */}
        {selectedQuote && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl text-[var(--dark-blue-karmax)]">
                    Detalle de Cotización #{selectedQuote.quoteNumber}
                  </h3>
                  <p className="!text-[14px] text-[var(--text-karmax)] font-normal mt-0.5">
                    {formatDate(selectedQuote.createdAt)} • {selectedQuote.status === "saved" ? "Borrador guardado" : "Enviada a Karmax"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="flex items-center gap-1.5 !text-[14px] text-[var(--light-text-karmax)] hover:text-[var(--green-hover-karmax)] p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span>Cerrar</span>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body / Scrollable Content */}
              <div className="overflow-y-auto flex-1 pr-1">
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-[#9AA1AA] text-[12px] font-semibold text-[var(--text-karmax)] uppercase tracking-wider">
                        <th className="pb-2 min-w-[180px] font-semibold text-[12px]">Producto</th>
                        <th className="pb-2 text-center min-w-[90px] font-semibold text-[12px]">Presentación</th>
                        <th className="pb-2 text-center min-w-[90px] font-semibold text-[12px]">Cantidad</th>
                        <th className="pb-2 text-right min-w-[120px] font-semibold text-[12px]">Precio Unitario</th>
                        <th className="pb-2 text-right min-w-[80px] font-semibold text-[12px]">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedQuote.items?.map((it) => {
                        const unitPriceNum = typeof it.unitPrice === "number" ? it.unitPrice : parseFloat(String(it.unitPrice)) || 0;
                        const totalPriceNum = typeof it.totalPrice === "number" ? it.totalPrice : parseFloat(String(it.totalPrice)) || 0;

                        return (
                          <tr key={it.id} className="group hover:bg-slate-50/60 transition-colors">
                            {/* Product Image & Info */}
                            <td className="py-3.5 pr-3 align-middle">
                              <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 p-1 flex items-center justify-center">
                                  <Image
                                    src={it.imageUrl || "/images/products/placeholder.jpg"}
                                    alt={it.productName}
                                    fill
                                    className="object-contain p-0.5"
                                    sizes="48px"
                                    unoptimized
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="!font-[600] text-[var(--text-karmax)] line-clamp-1 leading-tight !text-[14px]">
                                    {it.productName}
                                  </p>
                                  <p className="text-[14px] text-[var(--light-text-karmax)] mt-0 !leading-tight">
                                    SKU: {it.sku || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Presentación */}
                            <td className="py-3.5 px-2 text-center align-middle text-slate-600 font-medium text-[14px]">
                              {it.presentation || "-"}
                            </td>

                            {/* Cantidad */}
                            <td className="py-3.5 px-2 text-center align-middle text-[var(--text-karmax)] font-medium text-[14px]">
                              {it.quantity}
                            </td>

                            {/* Precio Unitario */}
                            <td className="py-3.5 px-2 text-right align-middle text-[var(--text-karmax)] text-[14px]">
                              {formatCurrency(unitPriceNum)}
                            </td>

                            {/* Total */}
                            <td className="py-3.5 pl-2 text-right align-middle font-medium text-[var(--text-karmax)] text-[14px]">
                              {formatCurrency(totalPriceNum)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Section: Comentarios + Resumen Financiero */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8 pt-6 border-t border-slate-200">
                  {/* Comentarios */}
                  {selectedQuote.notes ? (
                    <div className="md:col-span-7 flex flex-col">
                      <label className="text-[12px] font-semibold uppercase text-[var(--text-karmax)] tracking-wider mb-2">
                        Comentarios
                      </label>
                      <div className="w-full p-3 text-[14px] text-[var(--text-karmax)] rounded-xl border border-[#CCCCCC] bg-slate-50/50 whitespace-pre-wrap">
                        {selectedQuote.notes}
                      </div>
                    </div>
                  ) : (
                    <div className="hidden md:block md:col-span-7" />
                  )}

                  {/* Subtotal, IVA 16%, Total */}
                  <div className="md:col-span-5 flex flex-col justify-between space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between text-[var(--text-karmax)]">
                      <span className="font-semibold">Subtotal</span>
                      <span className="font-medium">{formatCurrency(selectedQuote.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[var(--text-karmax)] pt-2.5 border-t border-[#D6DADD]">
                      <span className="font-semibold">IVA 16%</span>
                      <span className="font-medium">{formatCurrency(selectedQuote.tax)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[var(--text-karmax)] pt-2.5 border-t border-[#9AA1AA] text-sm sm:text-base">
                      <span className="font-semibold">Total</span>
                      <span className="text-[var(--text-karmax)] font-semibold text-[14px]">
                        {formatCurrency(selectedQuote.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
                {selectedQuote.status === "saved" && (
                  <button
                    type="button"
                    onClick={() => {
                      const q = selectedQuote;
                      setSelectedQuote(null);
                      handleContinueQuote(q);
                    }}
                    className="inline-flex items-center gap-2 border border-[var(--green-karmax)] bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] hover:border-[var(--green-hover-karmax)] text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    <span>Continuar cotización</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
