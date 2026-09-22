"use client";

import React from "react";
import { motion } from "motion/react";

interface CatalogHeroBarProps {
  search: string;
  onSearchChange: (term: string) => void;
  onSearchSubmit: (term: string) => void;
}

export const CatalogHeroBar: React.FC<CatalogHeroBarProps> = ({
  search,
  onSearchChange,
  onSearchSubmit,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(search.trim());
  };

  const handleClear = () => {
    onSearchChange("");
    onSearchSubmit("");
  };

  return (
    <div
      className="w-full text-white shadow-md"
      style={{
        background: "linear-gradient(90deg, var(--blue-karmax) 0%, var(--light-blue-karmax) 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col sm:flex-row items-start justify-between gap-4">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="tracking-tight text-white text-left"
        >
          Productos
        </motion.h1>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={handleSubmit}
          className="relative flex items-center w-full max-w-md"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar..."
            className="w-full bg-white text-[var(--light-text-karmax)] placeholder-[var(--light-text-karmax)] mr-3 pl-5 pr-20 py-2 sm:py-2.5 rounded-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[var(--green-karmax)] shadow-inner transition-all"
          />

          {/* Clear button if text exists */}
          {search && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-12 text-slate-400 hover:text-slate-600 p-1 text-xs"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}

          {/* Submit Search Button */}
          <button
            type="submit"
            aria-label="Buscar productos"
            className="bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white w-15 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </motion.form>
      </div>
    </div>
  );
};
