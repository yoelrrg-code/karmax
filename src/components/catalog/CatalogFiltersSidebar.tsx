"use client";

import React from "react";
import { motion } from "motion/react";
import type { CategoryItem, IndustryItem } from "@/types";

interface CatalogFiltersSidebarProps {
  categories: CategoryItem[];
  industries: IndustryItem[];
  selectedCategorySlug?: string;
  selectedIndustrySlug?: string;
  onSelectCategory: (slug?: string) => void;
  onSelectIndustry: (slug?: string) => void;
}

export const CatalogFiltersSidebar: React.FC<CatalogFiltersSidebarProps> = ({
  categories,
  industries,
  selectedCategorySlug,
  selectedIndustrySlug,
  onSelectCategory,
  onSelectIndustry,
}) => {
  const handleCategoryClick = (slug: string) => {
    // Si ya está seleccionada, la deseleccionamos (mostrar todos)
    if (selectedCategorySlug === slug) {
      onSelectCategory(undefined);
    } else {
      // Filtro único: seleccionar categoría desactiva industria
      onSelectIndustry(undefined);
      onSelectCategory(slug);
    }
  };

  const handleIndustryClick = (slug: string) => {
    // Si ya está seleccionada, la deseleccionamos
    if (selectedIndustrySlug === slug) {
      onSelectIndustry(undefined);
    } else {
      // Filtro único: seleccionar industria desactiva categoría
      onSelectCategory(undefined);
      onSelectIndustry(slug);
    }
  };

  const isAllActive = !selectedCategorySlug && !selectedIndustrySlug;

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      {/* Botón para resetear todos los filtros si hay alguno activo */}
      {!isAllActive && (
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => {
            onSelectCategory(undefined);
            onSelectIndustry(undefined);
          }}
          className="mb-4 text-xs font-semibold text-[var(--green-karmax)] hover:text-[var(--green-hover-karmax)] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>✕</span> Limpiar filtros activos
        </motion.button>
      )}

      {/* Sección 1: Categorías */}
      <div className="mb-8">
        <motion.h3
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-base text-[var(--text-karmax)] pt-5 mb-3 border-t border-[var(--green-karmax)]"
        >
          Categorías
        </motion.h3>
        <ul className="space-y-2">
          {categories.map((cat, idx) => {
            const isActive = selectedCategorySlug === cat.slug;
            return (
              <motion.li
                key={cat.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(idx * 0.04, 0.5),
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <button
                  type="button"
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`w-full text-left text-[16px] font-medium transition-all py-2 px-2 rounded-md cursor-pointer flex items-center justify-between ${
                    isActive
                      ? "text-[var(--green-hover-karmax)] bg-white font-medium font-semibold border-l-4 border-[var(--green-karmax)] pl-3"
                      : "text-[var(--blue-karmax)] hover:text-[var(--green-hover-karmax)] hover:bg-white font-medium hover:pl-3 hover:font-semibold hover:border-l-4 hover:border-[var(--green-karmax)]"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>

      {/* Sección 2: Industrias */}
      <div>
        <motion.h3
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-base text-[var(--text-karmax)] pt-5 mb-3 border-t border-[var(--green-karmax)]"
        >
          Industrias
        </motion.h3>
        <ul className="space-y-2">
          {industries.map((ind, idx) => {
            const isActive = selectedIndustrySlug === ind.slug;
            return (
              <motion.li
                key={ind.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(idx * 0.04, 0.5),
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <button
                  type="button"
                  onClick={() => handleIndustryClick(ind.slug)}
                  className={`w-full text-left text-[16px] font-medium transition-all py-2 px-2 rounded-md cursor-pointer flex items-center justify-between ${
                    isActive
                      ? "text-[var(--green-hover-karmax)] bg-white font-medium font-semibold border-l-4 border-[var(--green-karmax)] pl-3"
                      : "text-[var(--blue-karmax)] hover:text-[var(--green-hover-karmax)] hover:bg-white font-medium hover:pl-3 hover:font-semibold hover:border-l-4 hover:border-[var(--green-karmax)]"
                  }`}
                >
                  <span className="truncate">{ind.name}</span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};
