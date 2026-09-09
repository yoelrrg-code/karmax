"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { CatalogHeroBar } from "./CatalogHeroBar";
import { CatalogFiltersSidebar } from "./CatalogFiltersSidebar";
import { ProductCard } from "./ProductCard";
import type {
  CategoryItem,
  IndustryItem,
  CatalogProductItem,
  CatalogSortOption,
  CatalogResponse,
} from "@/types";

interface CatalogViewProps {
  initialProducts: CatalogProductItem[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
  categories: CategoryItem[];
  industries: IndustryItem[];
  initialCategorySlug?: string;
  initialIndustrySlug?: string;
  initialSearch?: string;
  initialSortBy?: CatalogSortOption;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  initialProducts,
  initialTotal,
  initialPage = 1,
  initialTotalPages = 1,
  categories,
  industries,
  initialCategorySlug,
  initialIndustrySlug,
  initialSearch = "",
  initialSortBy = "name",
}) => {
  const [products, setProducts] = useState<CatalogProductItem[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const [categorySlug, setCategorySlug] = useState<string | undefined>(initialCategorySlug);
  const [industrySlug, setIndustrySlug] = useState<string | undefined>(initialIndustrySlug);
  const [searchInput, setSearchInput] = useState<string>(initialSearch);
  const [search, setSearch] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<CatalogSortOption>(initialSortBy);

  const [isLoading, setIsLoading] = useState(false);
  const isFirstMount = useRef(true);
  const gridTopRef = useRef<HTMLDivElement>(null);

  // Fetch productos cuando cambian los filtros
  const fetchProducts = useCallback(
    async (targetPage: number) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (categorySlug) params.set("category", categorySlug);
        if (industrySlug) params.set("industry", industrySlug);
        if (search) params.set("search", search);
        if (sortBy) params.set("sortBy", sortBy);
        params.set("page", String(targetPage));
        params.set("limit", "12");

        // Actualizar URL sin reload
        const newUrl = `/productos?${params.toString()}`;
        window.history.replaceState(null, "", newUrl);

        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error("Error en la respuesta del servidor");

        const data: CatalogResponse = await res.json();
        setProducts(data.products);
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [categorySlug, industrySlug, search, sortBy]
  );

  // Efecto cuando cambian los filtros (resetea a página 1)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setPage(1);
    fetchProducts(1);
  }, [categorySlug, industrySlug, search, sortBy, fetchProducts]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      fetchProducts(newPage);
      if (gridTopRef.current) {
        gridTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Helper para el texto del contador dinámico
  const getCounterText = () => {
    if (search && !categorySlug && !industrySlug) {
      return (
        <>
          <strong>{total}</strong> {total === 1 ? <strong>producto encontrado</strong> : <strong>productos encontrados</strong>} para <strong>{search}</strong>
        </>
      );
    }
    if (categorySlug) {
      const activeCat = categories.find((c) => c.slug === categorySlug);
      const name = activeCat ? activeCat.name : categorySlug;
      return (
        <>
          <strong>{total}</strong> {total === 1 ? <strong>producto</strong> : <strong>productos</strong>} en la categoría <strong>{name}</strong>
        </>
      );
    }
    if (industrySlug) {
      const activeInd = industries.find((i) => i.slug === industrySlug);
      const name = activeInd ? activeInd.name : industrySlug;
      return (
        <>
          <strong>{total}</strong> {total === 1 ? <strong>producto</strong> : <strong>productos</strong>} en la industria <strong>{name}</strong>
        </>
      );
    }
    return (
      <>
        <strong>{total}</strong> {total === 1 ? <strong>producto</strong> : <strong>productos</strong>} en todas las <strong>Categorías</strong> e <strong>Industrias</strong>
      </>
    );

  };

  // Generador de botones de paginación
  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return (
      <nav aria-label="Paginación de productos" className="flex items-center justify-center gap-1.5 mt-12 mb-8 select-none">
        {/* Anterior */}
        <button
          type="button"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          aria-label="Página anterior"
          className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          ‹
        </button>

        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`dots-${idx}`} className="w-8 text-center text-slate-400">
                ...
              </span>
            );
          }
          const pageNumber = p as number;
          const isActive = pageNumber === page;
          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => handlePageChange(pageNumber)}
              aria-current={isActive ? "page" : undefined}
              className={`w-9 h-9 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-[var(--green-karmax)] text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* Siguiente */}
        <button
          type="button"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Página siguiente"
          className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          ›
        </button>
      </nav>
    );
  };

  return (
    <div className="w-full bg-[var(--light-bg-karmax)]">
      {/* 1. Barra azul superior con buscador */}
      <CatalogHeroBar
        search={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={setSearch}
      />

      {/* Anchor para scroll suave al paginar */}
      <div ref={gridTopRef} />

      {/* 2. Contenedor principal con filtros y grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Layout de dos columnas: Sidebar + Grid */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          {/* Columna Izquierda: Filtros */}
          <CatalogFiltersSidebar
            categories={categories}
            industries={industries}
            selectedCategorySlug={categorySlug}
            selectedIndustrySlug={industrySlug}
            onSelectCategory={setCategorySlug}
            onSelectIndustry={setIndustrySlug}
          />

          {/* Columna Derecha: Grid de productos */}
          <div className="flex-1 w-full">
            {/* Barra de control: Contador dinámico y Ordenar por */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6">
              {/* Contador de productos dinámico */}
              <p className="text-[14px] sm:text-[15px] font-medium text-[var(--text-karmax)]">
                {getCounterText()}
              </p>

              {/* Selector de Ordenar por */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <label htmlFor="sort-by" className="text-xs sm:text-sm font-medium text-slate-500 whitespace-nowrap">
                  Ordenar por:
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as CatalogSortOption)}
                  className="bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-lg py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-[var(--blue-karmax)] cursor-pointer shadow-2xs font-medium"
                >
                  <option value="name">Nombre</option>
                  <option value="price_asc">Precio: menor a mayor</option>
                  <option value="price_desc">Precio: mayor a menor</option>
                </select>
              </div>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-6 h-80 animate-pulse border border-slate-100 flex flex-col justify-between"
                  >
                    <div className="w-full h-40 bg-slate-100 rounded-lg mb-4" />
                    <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-slate-100 rounded w-1/3 mb-4" />
                    <div className="h-8 bg-slate-100 rounded-full w-full" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Paginación */}
                {renderPaginationButtons()}
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center my-8 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-[var(--blue-karmax)] flex items-center justify-center mx-auto mb-4 text-2xl">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                  Intenta cambiar o limpiar los filtros seleccionados o buscar con otro término.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCategorySlug(undefined);
                    setIndustrySlug(undefined);
                    setSearchInput("");
                    setSearch("");
                  }}
                  className="inline-flex items-center justify-center bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-sm font-semibold py-2.5 px-6 rounded-full transition-all cursor-pointer shadow-xs"
                >
                  Ver todos los productos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
