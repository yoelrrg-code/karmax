"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-[var(--dark-blue-karmax)]">
                    Detalle de Cotización #{selectedQuote.quoteNumber}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {formatDate(selectedQuote.createdAt)} • {selectedQuote.status === "saved" ? "Borrador" : "Enviada"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 pr-1 space-y-4">
                {selectedQuote.notes && (
                  <div className="bg-slate-50 p-3.5 rounded-xl text-xs text-slate-600 border border-slate-100">
                    <strong className="text-slate-800 block mb-1">Notas o comentarios:</strong>
                    {selectedQuote.notes}
                  </div>
                )}

                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase">
                        <th className="p-3">Producto</th>
                        <th className="p-3 text-center">Pres.</th>
                        <th className="p-3 text-center">Cant.</th>
                        <th className="p-3 text-right">Unitario</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedQuote.items?.map((it) => (
                        <tr key={it.id}>
                          <td className="p-3 font-medium text-slate-800">
                            {it.productName}
                            {it.sku && <span className="block text-[10px] text-slate-400 font-normal">SKU: {it.sku}</span>}
                          </td>
                          <td className="p-3 text-center text-slate-500">{it.presentation || "Estándar"}</td>
                          <td className="p-3 text-center font-semibold text-slate-700">{it.quantity}</td>
                          <td className="p-3 text-right text-slate-500">{formatCurrency(it.unitPrice)}</td>
                          <td className="p-3 text-right font-bold text-slate-800">{formatCurrency(it.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 text-right text-xs sm:text-sm space-y-1">
                  <p className="text-slate-500">
                    Subtotal: <span className="font-semibold text-slate-800">{formatCurrency(selectedQuote.subtotal)}</span>
                  </p>
                  <p className="text-slate-500">
                    I.V.A. (16%): <span className="font-semibold text-slate-800">{formatCurrency(selectedQuote.tax)}</span>
                  </p>
                  <p className="text-base font-bold text-[var(--green-karmax)] pt-1 border-t border-slate-100">
                    Total: {formatCurrency(selectedQuote.total)}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="px-5 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
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
                    className="px-6 py-2 rounded-full text-xs font-semibold text-white bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] transition-colors cursor-pointer shadow-sm"
                  >
                    Continuar cotización
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
