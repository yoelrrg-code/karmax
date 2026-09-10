"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useQuote } from "@/context/QuoteContext";
import { useAuth } from "@/context/AuthContext";
import { Trash2, X } from "lucide-react";

export const QuoteDrawer: React.FC = () => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearQuote,
    subtotal,
    tax,
    total,
    comments,
    setComments,
    quoteNumber,
    refreshQuoteNumber,
    isDrawerOpen,
    closeDrawer,
  } = useQuote();

  const { user, openAuthModal } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  // Format date in Spanish: "Septiembre 10, 2026"
  const formattedDate = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const capitalizedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleAction = async (action: "save" | "send") => {
    if (items.length === 0) {
      alert("No hay productos en la cotización.");
      return;
    }

    if (!user) {
      openAuthModal(async () => {
        await executeSave(action);
      });
      return;
    }

    await executeSave(action);
  };

  const executeSave = async (action: "save" | "send") => {
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteNumber,
          notes: comments,
          subtotal,
          tax,
          total,
          action,
          items: items.map((it) => ({
            productId: it.productId,
            productName: it.name,
            presentation: it.presentation,
            sku: it.sku,
            imageUrl: it.imageUrl,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            totalPrice: it.unitPrice * it.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Hubo un error al guardar la cotización.");
        return;
      }

      setSuccessMessage(
        action === "save"
          ? `✓ Cotización #${data.quoteNumber || quoteNumber} guardada en tu cuenta de cliente.`
          : `✓ Cotización #${data.quoteNumber || quoteNumber} enviada a Karmax con éxito.`
      );

      // Refresh to the next consecutive quote number from DB
      await refreshQuoteNumber();

      if (action === "send") {
        setTimeout(() => {
          clearQuote();
        }, 2500);
      }
    } catch (e) {
      console.error("Error saving quote:", e);
      alert("Error de conexión al procesar la cotización.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${
        isDrawerOpen ? "visible pointer-events-auto" : "invisible pointer-events-none delay-300"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          isDrawerOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-16 pointer-events-none">
        <div
          className={`w-screen max-w-4xl bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out pointer-events-auto ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* 1. Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[var(--dark-blue-karmax)]">
                Cotización #{quoteNumber}
              </h3>
              <p className="!text-[14px] text-[var(--text-karmax)] font-normal mt-0.5">
                {capitalizedDate}
              </p>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              className="flex items-center gap-1.5 !text-[14px] text-[var(--light-text-karmax)] hover:text-[var(--green-hover-karmax)] p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span>Cerrar</span>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Success message banner */}
          {successMessage && (
            <div className="mx-6 mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between animate-in fade-in">
              <span>{successMessage}</span>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="text-emerald-700 hover:text-emerald-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 2. Items Content / Table */}
          <div className="flex flex-col overflow-y-auto px-6 py-4 mb-8">
            {items.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
                <p className="text-base font-medium">Tu cotizador está vacío.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Agrega productos desde el catálogo para visualizarlos aquí.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#9AA1AA] text-[12px] font-semibold text-[var(--text-karmax)] uppercase tracking-wider">
                      <th className="pb-2 min-w-[160px] font-semibold text-[12px]" colSpan={2}>Producto</th>
                      <th className="pb-2 text-center min-w-[90px] font-semibold text-[12px]">Presentación</th>
                      <th className="pb-2 text-center min-w-[90px] font-semibold text-[12px]">Cantidad</th>
                      <th className="pb-2 text-right min-w-[120px] font-semibold text-[12px]">Precio Unitario</th>
                      <th className="pb-2 text-right min-w-[80px] font-semibold text-[12px]">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => {
                      const itemTotal = item.unitPrice * item.quantity;
                      return (
                        <tr key={`${item.productId}-${item.presentation}`} className="group hover:bg-slate-50/60 transition-colors">
                          {/* Trash Icon */}
                          <td className="py-3.5 pr-2 align-middle">
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId, item.presentation)}
                              title="Eliminar producto"
                              className="w-7 h-7 rounded-full text-[var(--green-karmax)] opacity-50 hover:opacity-100 hover:text-[var(--green-hover-karmax)] flex items-center justify-center transition-all cursor-pointer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>

                          {/* Product Image & Info */}
                          <td className="py-3.5 pr-3 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 p-1 flex items-center justify-center">
                                <Image
                                  src={item.imageUrl || "/images/products/placeholder.png"}
                                  alt={item.name}
                                  fill
                                  className="object-contain p-0.5"
                                  sizes="48px"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="!font-[600] text-[var(--text-karmax)] line-clamp-1 leading-tight !text-[14px]">
                                  {item.name}
                                </p>
                                <p className="text-[14px] text-[var(--light-text-karmax)] mt-0 !leading-tight">
                                  SKU: {item.sku || "N/A"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Presentación */}
                          <td className="py-3.5 px-2 text-center align-middle text-slate-600 font-medium">
                            {item.presentation || "-"}
                          </td>

                          {/* Cantidad Input / Stepper */}
                          <td className="py-3.5 px-2 align-middle">
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  updateQuantity(
                                    item.productId,
                                    item.presentation,
                                    isNaN(val) ? 1 : val
                                  );
                                }}
                                className="w-12 h-7 text-center rounded-md border border-[#CCCCCC] text-[14px] text-[var(--text-karmax)] font-normal focus:border-[var(--light-text-karmax)] focus:ring-1 focus:ring-[var(--light-text-karmax)] outline-none"
                              />
                            </div>
                          </td>

                          {/* Precio Unitario */}
                          <td className="py-3.5 px-2 text-right align-middle text-[var(--text-karmax)] text-[14px]">
                            {formatCurrency(item.unitPrice)}
                          </td>

                          {/* Total */}
                          <td className="py-3.5 pl-2 text-right align-middle font-medium text-[var(--text-karmax)] text-[14px]">
                            {formatCurrency(itemTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. Bottom Section: Comentarios + Resumen Financiero */}
            {items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8 pt-6 border-t border-slate-200">
                {/* Comentarios */}
                <div className="md:col-span-7 flex flex-col">
                  <label className="text-[12px] font-semibold uppercase text-[var(--text-karmax)] tracking-wider mb-2">
                    Comentarios
                  </label>
                  <textarea
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Escribe instrucciones o requerimientos particulares..."
                    className="w-full p-3 text-[14px] text-[var(--text-karmax)] rounded-xl border border-[#CCCCCC] focus:border-[#566371] focus:ring-1 focus:ring-[#566371] outline-none resize-none transition-all"
                  />
                </div>

                {/* Subtotal, IVA 16%, Total */}
                <div className="md:col-span-5 flex flex-col justify-between space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-[var(--text-karmax)]">
                    <span className="font-semibold">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[var(--text-karmax)] pt-2.5 border-t border-[#D6DADD]">
                    <span className="font-semibold">IVA 16%</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[var(--text-karmax)] pt-2.5 border-t border-[#9AA1AA] text-sm sm:text-base">
                    <span className="font-semibold">Total</span>
                    <span className="text-[var(--text-karmax)] font-semibold text-[14px]">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Action Buttons & Disclaimer Footer */}
          {items.length > 0 && (
            <div className="max-w-3xl mx-auto p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleAction("save")}
                  className="sm:flex-1 btn-primary inline-flex items-center justify-center border border-[var(--green-karmax)] bg-transparent hover:bg-[var(--green-hover-karmax)] hover:border-[var(--green-hover-karmax)] text-[var(--green-karmax)] hover:text-white px-8 py-4 rounded-full text-base shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  {isSubmitting ? "Guardando..." : "Guardar cotización"}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleAction("send")}
                  className="sm:flex-1 btn-primary gap-2 inline-flex items-center justify-center border border-[var(--green-karmax)] bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] hover:border-[var(--green-hover-karmax)] text-white px-8 py-4 rounded-full text-base shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  {isSubmitting ? "Enviando..." : "Enviar cotización a Karmax"}
                </button>
              </div>

              <p className="!text-[14px] text-[var(--text-karmax)] font-semibold text-center leading-relaxed">
                <strong>Importante:</strong> esta solicitud no representa una orden de compra. Un asesor se comunicará
                contigo para confirmar precios, existencias, costos de envío y condiciones, así como para
                coordinar la entrega.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
