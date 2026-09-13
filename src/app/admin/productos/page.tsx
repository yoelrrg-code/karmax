"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Layers,
  ExternalLink,
} from "lucide-react";

interface ProductRow {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  brand: string | null;
  regularPrice: string | null;
  salePrice: string | null;
  imageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: number;
  categoryName: string | null;
  variationCount: number;
}

interface CategoryOption {
  id: number;
  name: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load categories for filter
  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetch("/api/admin/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    }
    loadCats();
  }, []);

  // Load products
  useEffect(() => {
    let ignore = false;
    async function loadProducts() {
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (categoryFilter) params.set("categoryId", categoryFilter);
        if (activeFilter !== "all") params.set("isActive", activeFilter);
        params.set("page", String(page));
        params.set("limit", "15");

        const res = await fetch(`/api/admin/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setProducts(data.products || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
          }
        }
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadProducts();
    return () => {
      ignore = true;
    };
  }, [search, categoryFilter, activeFilter, page]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPage(1);
    setSearch(searchInput);
  };

  const handleDeleteProduct = async (prod: ProductRow) => {
    if (
      !confirm(
        `¿Deseas desactivar el producto "${prod.name}"? Ya no será visible en la tienda pública.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Producto desactivado correctamente");
        setProducts((prev) =>
          prev.map((p) => (p.id === prod.id ? { ...p, isActive: false } : p))
        );
      }
    } catch {
      showToast("Error al desactivar producto");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-[var(--dark-blue-karmax)]" />
            Catálogo de Productos
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Administra productos, variaciones con SKUs dinámicos, imágenes y precios.
          </p>
        </div>

        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o marca..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[var(--blue-karmax)] rounded-xl text-xs border border-slate-200 focus:outline-none focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* Category Filter & Active Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700"
            >
              <option value="">Todas las Categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700"
            >
              <option value="all">Todos los Estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Foto</th>
                <th className="px-5 py-3.5">Producto / SKU Base</th>
                <th className="px-5 py-3.5">Categoría</th>
                <th className="px-5 py-3.5">Precio Base</th>
                <th className="px-5 py-3.5 text-center">Variaciones</th>
                <th className="px-5 py-3.5 text-center">Estado</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Cargando productos...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No se encontraron productos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const priceStr = prod.salePrice && Number(prod.salePrice) > 0
                    ? `$${prod.salePrice}`
                    : prod.regularPrice
                    ? `$${prod.regularPrice}`
                    : "Cotizar";

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="w-12 h-12 relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200 p-1 flex items-center justify-center">
                          {prod.imageUrl ? (
                            <Image
                              src={prod.imageUrl}
                              alt={prod.name}
                              fill
                              className="object-contain p-0.5"
                              sizes="48px"
                            />
                          ) : (
                            <Layers className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/productos/${prod.id}`}
                          className="font-bold text-slate-900 text-sm hover:text-[var(--blue-karmax)] line-clamp-1"
                        >
                          {prod.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono">
                          <span>SKU: {prod.sku || "—"}</span>
                          <span>•</span>
                          <span className="uppercase">{prod.brand || "KARMAX"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-medium text-slate-700">
                        {prod.categoryName || "Limpieza general"}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[var(--green-karmax)] text-xs sm:text-sm">
                        {prod.variationCount > 1 && <span className="font-normal text-xs text-slate-500 mr-1">Desde</span>}
                        {priceStr}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            prod.variationCount > 1
                              ? "bg-purple-50 text-purple-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {prod.variationCount > 0 ? `${prod.variationCount} vars` : "Base"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                            prod.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {prod.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/productos/${prod.slug}`}
                            target="_blank"
                            title="Ver en la tienda"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/productos/${prod.id}`}
                            title="Editar producto"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod)}
                            title="Desactivar producto"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Total: {total} productos (Página {page} de {totalPages})
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
