"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  initialSortBy = "name_asc",
}) => {
  const [products, setProducts] = useState<CatalogProductItem[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const [categorySlug, setCategorySlug] = useState<string | undefined>(initialCategorySlug);
  const [industrySlug, setIndustrySlug] = useState<string | undefined>(initialIndustrySlug);
  const [searchInput, setSearchInput] = useState<string>(initialSearch);
  const [search, setSearch] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<CatalogSortOption>(
    initialSortBy === "name" ? "name_asc" : initialSortBy
  );

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
    if (totalPages <= 9) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages - 2, totalPages - 1, totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1, 2, 3);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1, 2);
        pages.push("...");
        pages.push(page - 1, page, page + 1);
        pages.push("...");
        pages.push(totalPages - 1, totalPages);
      }
    }

    return (
      <nav
        aria-label="Paginación de productos"
        className="flex items-center justify-center flex-wrap gap-2 mt-12 mb-8 select-none"
      >
        {/* Anterior */}
        <button
          type="button"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          aria-label="Página anterior"
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[var(--green-karmax)] shadow-2xs hover:shadow-xs disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer mr-3 sm:mr-6"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`dots-${idx}`}
                className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-sm font-semibold text-[var(--dark-blue-karmax)] select-none shadow-2xs"
              >
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
              className={`w-10 h-10 rounded-lg text-[16px] font-semibold transition-all cursor-pointer flex items-center justify-center ${
                isActive
                  ? "bg-[var(--green-karmax)] text-white shadow-2xs font-bold"
                  : "bg-white text-[var(--dark-blue-karmax)] hover:bg-slate-50 hover:text-[var(--green-karmax)] shadow-2xs"
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
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[var(--green-karmax)] shadow-2xs hover:shadow-xs disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer ml-3 sm:ml-6"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-20">
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
            {/* Controles para Mobile / Tablet (< 1024px) */}
            <div className="lg:hidden w-full mb-6 space-y-4">
              {/* Fila 1: Filtros de Categorías e Industrias en 2 columnas */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Selector Categorías */}
                <div className="relative">
                  <select
                    id="mobile-filter-category"
                    aria-label="Filtrar por categoría"
                    value={categorySlug || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setCategorySlug(undefined);
                      } else {
                        setIndustrySlug(undefined);
                        setCategorySlug(val);
                      }
                      setPage(1);
                    }}
                    className="w-full appearance-none bg-white border border-slate-300 rounded-lg h-[40px] pl-4 pr-10 text-[14px] font-semibold text-[var(--text-karmax)] focus:outline-none focus:ring-1 focus:ring-[var(--green-karmax)] cursor-pointer truncate"
                  >
                    <option value="" className="font-bold">
                      Categorías
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug} className="font-normal text-slate-800">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M2.5 4.5L6 8.5L9.5 4.5H2.5Z" />
                    </svg>
                  </div>
                </div>

                {/* Selector Industrias */}
                <div className="relative">
                  <select
                    id="mobile-filter-industry"
                    aria-label="Filtrar por industria"
                    value={industrySlug || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setIndustrySlug(undefined);
                      } else {
                        setCategorySlug(undefined);
                        setIndustrySlug(val);
                      }
                      setPage(1);
                    }}
                    className="w-full appearance-none bg-white border border-slate-300 rounded-lg h-[40px] pl-4 pr-10 text-[14px] font-semibold text-[var(--text-karmax)] focus:outline-none focus:ring-1 focus:ring-[var(--green-karmax)] cursor-pointer truncate"
                  >
                    <option value="" className="font-bold">
                      Industrias
                    </option>
                    {industries.map((ind) => (
                      <option key={ind.id} value={ind.slug} className="font-normal text-slate-800">
                        {ind.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M2.5 4.5L6 8.5L9.5 4.5H2.5Z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Fila 2: Contador dinámico */}
              <div className="pt-1">
                <p className="!text-[14px] text-[var(--text-karmax)] tracking-tight leading-snug text-center">
                  {getCounterText()}
                </p>
              </div>

              {/* Fila 3: Ordenar por alineado a la derecha */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <label
                  htmlFor="mobile-sort-by"
                  className="text-[14px] font-normal text-[var(--text-karmax)] whitespace-nowrap"
                >
                  Ordenar por:
                </label>
                <div className="relative">
                  <select
                    id="mobile-sort-by"
                    value={sortBy === "name" ? "name_asc" : sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as CatalogSortOption);
                      setPage(1);
                    }}
                    className="appearance-none bg-white border border-slate-300 rounded-lg h-[34px] pl-4 pr-10 text-[14px] font-semibold text-[var(--text-karmax)] focus:outline-none focus:ring-1 focus:ring-[var(--green-karmax)] cursor-pointer truncate"
                  >
                    <option value="name_asc">Nombre</option>
                    <option value="name_desc">Nombre (Z-A)</option>
                    <option value="price_asc">Precio más bajo</option>
                    <option value="price_desc">Precio más alto</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M2.5 4.5L6 8.5L9.5 4.5H2.5Z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de control Desktop (>= 1024px): Contador dinámico y Ordenar por */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:flex items-center justify-between gap-4 pb-6 mb-6"
            >
              {/* Contador de productos dinámico */}
              <p className="text-[14px] sm:text-[15px] font-medium text-[var(--text-karmax)]">
                {getCounterText()}
              </p>

              {/* Selector de Ordenar por */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort-by" className="text-xs sm:text-sm font-medium text-slate-500 whitespace-nowrap">
                  Ordenar por:
                </label>
                <select
                  id="sort-by"
                  value={sortBy === "name" ? "name_asc" : sortBy}
                  onChange={(e) => setSortBy(e.target.value as CatalogSortOption)}
                  className="bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-lg py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-[var(--blue-karmax)] cursor-pointer shadow-2xs font-medium"
                >
                  <option value="name_asc">Nombre</option>
                  <option value="name_desc">De la Z a la A</option>
                  <option value="price_asc">Precio más bajo</option>
                  <option value="price_desc">Precio más alto</option>
                </select>
              </div>
            </motion.div>
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
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`products-grid-p${page}-${categorySlug || "all"}-${industrySlug || "all"}-${sortBy}-${search || ""}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {products.map((product, idx) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{
                          duration: 0.8,
                          delay: (idx % 3) * 0.12 + Math.floor(idx / 3) * 0.08,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="h-full"
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Paginación */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  {renderPaginationButtons()}
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-2xl border border-slate-100 p-12 text-center my-8 shadow-xs"
              >
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
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
