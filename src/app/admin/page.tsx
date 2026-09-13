import React from "react";
import Link from "next/link";
import { db, quoteRequests, products, categories, industries } from "@/lib/db";
import { desc, eq, sql } from "drizzle-orm";
import {
  FileText,
  Package,
  FolderTree,
  Factory,
  PlusCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // 1. Fetch real counts
  const [
    totalQuotesRes,
    pendingQuotesRes,
    totalProductsRes,
    totalCategoriesRes,
    totalIndustriesRes,
    recentQuotes,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(quoteRequests),
    db
      .select({ count: sql<number>`count(*)` })
      .from(quoteRequests)
      .where(eq(quoteRequests.status, "pending")),
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.isActive, true)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(categories)
      .where(eq(categories.isActive, true)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(industries)
      .where(eq(industries.isActive, true)),
    db
      .select()
      .from(quoteRequests)
      .orderBy(desc(quoteRequests.id))
      .limit(6),
  ]);

  const totalQuotes = Number(totalQuotesRes[0]?.count || 0);
  const pendingQuotes = Number(pendingQuotesRes[0]?.count || 0);
  const totalProducts = Number(totalProductsRes[0]?.count || 0);
  const totalCategories = Number(totalCategoriesRes[0]?.count || 0);
  const totalIndustries = Number(totalIndustriesRes[0]?.count || 0);

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
            Rechazado
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
    <div className="space-y-8">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900">
            Resumen General
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Bienvenido al panel de control de KARMAX. Monitorea cotizaciones y catálogo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-2 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Cotizaciones Pendientes */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Por Atender
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-semibold text-slate-900">{pendingQuotes}</p>
            <p className="text-xs text-slate-400 mt-1">
              De un total de {totalQuotes} cotizaciones
            </p>
          </div>
        </div>

        {/* Card 2: Total Productos Activos */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Productos Activos
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-semibold text-slate-900">{totalProducts}</p>
            <p className="text-xs text-slate-400 mt-1">
              Disponibles en el catálogo público
            </p>
          </div>
        </div>

        {/* Card 3: Categorías */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Líneas / Categorías
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-semibold text-slate-900">{totalCategories}</p>
            <p className="text-xs text-slate-400 mt-1">
              Organizadas en el menú y filtros
            </p>
          </div>
        </div>

        {/* Card 4: Industrias */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sectores Industriales
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Factory className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-semibold text-slate-900">{totalIndustries}</p>
            <p className="text-xs text-slate-400 mt-1">
              Segmentos comerciales activos
            </p>
          </div>
        </div>
      </div>

      {/* Recent Quotes Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Últimas Cotizaciones
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Solicitudes recibidas recientemente a través de la plataforma
            </p>
          </div>
          <Link
            href="/admin/cotizaciones"
            className="text-xs font-semibold text-[var(--dark-blue-karmax)] hover:underline flex items-center gap-1"
          >
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Folio</th>
                <th className="px-6 py-3.5">Cliente</th>
                <th className="px-6 py-3.5">Empresa</th>
                <th className="px-6 py-3.5">Total</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No hay cotizaciones registradas aún.
                  </td>
                </tr>
              ) : (
                recentQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">
                      {q.quoteNumber || `#${q.id.toString().padStart(6, "0")}`}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{q.customerName}</p>
                      <p className="text-xs text-slate-400">{q.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {q.companyName || "—"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[var(--green-karmax)]">
                      ${Number(q.total || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(q.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/cotizaciones/${q.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--dark-blue-karmax)] hover:text-[var(--blue-karmax)] hover:underline"
                      >
                        Ver Detalle <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/admin/productos"
          className="group p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[var(--green-karmax)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Package className="w-5 h-5" />
          </div>
          <p className="font-semibold text-slate-900 text-base">
            <strong>Administrar Productos</strong>
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Crea, edita o elimina productos, asigna atributos, presentaciones, SKUs y fotos.
          </p>
        </Link>

        <Link
          href="/admin/categorias"
          className="group p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--blue-karmax)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FolderTree className="w-5 h-5" />
          </div>
          <p className="font-semibold text-slate-900 text-base">
            <strong>Categorías e Industrias</strong>
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Organiza las líneas de productos y los sectores a los que abastece KARMAX.
          </p>
        </Link>

        <Link
          href="/admin/secciones"
          className="group p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <p className="font-semibold text-slate-900 text-base">
            <strong>Editar Secciones del Sitio</strong>
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Personaliza el Hero, Marcas aliadas, Badges de valor, Pasos de cotización y Footer.
          </p>
        </Link>
      </div>
    </div>
  );
}
