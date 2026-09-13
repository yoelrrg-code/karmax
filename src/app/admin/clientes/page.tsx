"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Percent,
  CheckCircle2,
  X,
  FileText,
  Building,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
} from "lucide-react";
import type { AdminCustomerItem } from "@/types";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal de asignación de descuento
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomerItem | null>(null);
  const [discountInput, setDiscountInput] = useState<string>("0");
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/customers");
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setCustomers(data.customers || []);
          }
        }
      } catch (err) {
        console.error("Error al cargar clientes:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  // Filtrado en memoria
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.companyName && c.companyName.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
    );
  }, [customers, searchQuery]);

  // KPIs
  const totalCustomers = customers.length;
  const customersWithDiscount = customers.filter((c) => c.discountPercentage > 0).length;
  const totalQuotes = customers.reduce((acc, c) => acc + c.quotesCount, 0);

  const handleOpenDiscountModal = (customer: AdminCustomerItem) => {
    setSelectedCustomer(customer);
    setDiscountInput(String(customer.discountPercentage || 0));
  };

  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const val = parseFloat(discountInput);
    if (isNaN(val) || val < 0 || val > 100) {
      showToast("Ingresa un porcentaje válido entre 0 y 100");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/customers/${selectedCustomer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discountPercentage: val }),
      });

      if (res.ok) {
        showToast(`Descuento de ${val}% asignado a ${selectedCustomer.name}`);
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === selectedCustomer.id ? { ...c, discountPercentage: val } : c
          )
        );
        setSelectedCustomer(null);
      } else {
        const errData = await res.json();
        showToast(errData.error || "Error al actualizar el descuento");
      }
    } catch {
      showToast("Error de red al actualizar descuento");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[var(--green-karmax)]" />
            Gestión de Clientes y Descuentos
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Administra los usuarios registrados y asigna porcentajes de descuento que aplican a todo el catálogo.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[var(--blue-karmax)] flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
              Total Clientes
            </span>
            <span className="text-2xl font-bold text-slate-900">{totalCustomers}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[var(--green-karmax)] flex items-center justify-center font-bold">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
              Con Descuento Asignado
            </span>
            <span className="text-2xl font-bold text-emerald-600">{customersWithDiscount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
              Cotizaciones Generadas
            </span>
            <span className="text-2xl font-bold text-slate-900">{totalQuotes}</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, correo, empresa o teléfono..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm bg-transparent outline-none placeholder:text-slate-400 text-slate-800"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Cliente</th>
                <th className="py-3.5 px-4">Contacto</th>
                <th className="py-3.5 px-4 text-center">Rol</th>
                <th className="py-3.5 px-4 text-center">Cotizaciones</th>
                <th className="py-3.5 px-4 text-center">% Descuento Global</th>
                <th className="py-3.5 px-4 text-center">Fecha Registro</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Cargando listado de clientes...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No se encontraron clientes registrados.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const hasDiscount = c.discountPercentage > 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Cliente */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {c.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-snug">{c.name}</p>
                            {c.companyName && (
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Building className="w-3 h-3 text-slate-400" />
                                {c.companyName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contacto */}
                      <td className="py-4 px-4 text-slate-600">
                        <p className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{c.email}</span>
                        </p>
                        {c.phone && (
                          <p className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{c.phone}</span>
                          </p>
                        )}
                      </td>

                      {/* Rol */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            c.roleName === "admin"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {c.roleName === "admin" ? "Administrador" : "Cliente"}
                        </span>
                      </td>

                      {/* Cotizaciones */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[28px] h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold px-2">
                          {c.quotesCount}
                        </span>
                      </td>

                      {/* % Descuento */}
                      <td className="py-4 px-4 text-center">
                        {hasDiscount ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[var(--green-karmax)] border border-emerald-200 shadow-2xs">
                            <Percent className="w-3.5 h-3.5" />
                            {c.discountPercentage}% OFF
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Sin descuento</span>
                        )}
                      </td>

                      {/* Fecha de Registro */}
                      <td className="py-4 px-4 text-center text-xs text-slate-500">
                        <span className="flex items-center justify-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(c.createdAt).toLocaleDateString("es-MX", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDiscountModal(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[var(--green-karmax)] hover:bg-emerald-50 text-slate-700 hover:text-[var(--green-karmax)] text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        >
                          <span>Asignar</span>
                          <Percent className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Asignar Descuento */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Asignar Descuento al Cliente</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aplica para <strong className="text-slate-800">{selectedCustomer.name}</strong> en todo el catálogo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDiscount} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Porcentaje de Descuento (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    placeholder="Ej. 15"
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-base font-bold text-slate-900"
                    autoFocus
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    %
                  </span>
                </div>
              </div>

              {/* Botones de selección rápida */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Valores Rápidos:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[0, 5, 10, 15, 20, 25, 30].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDiscountInput(String(val))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        parseFloat(discountInput) === val
                          ? "bg-[var(--green-karmax)] text-white border-[var(--green-karmax)] shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {val === 0 ? "0% (Quitar)" : `${val}%`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-800">
                <AlertCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Cuando este cliente inicie sesión, verá los productos con el precio regular tachado, su precio final y la etiqueta <span className="font-bold">-{discountInput || "0"}%</span>.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-xs font-semibold py-2.5 px-6 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Guardando..." : "Guardar Descuento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
