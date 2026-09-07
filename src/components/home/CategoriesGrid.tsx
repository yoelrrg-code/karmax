import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryItem, QUICK_TAGS } from "@/lib/data/mockData";

interface CategoriesGridProps {
  categories: CategoryItem[];
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({ categories }) => {
  return (
    <section id="productos" className="py-16 sm:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Productos para cada espacio y necesidad
          </h2>
        </div>

        {/* 8 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`#categoria-${cat.slug}`}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-slate-200/80 transition-all duration-300 flex flex-col"
            >
              {/* Card Header Title Pill */}
              <div className="p-3.5 text-center bg-white border-b border-slate-100 z-10">
                <h3 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-[#00509d] transition-colors line-clamp-1">
                  {cat.name}
                </h3>
              </div>

              {/* Image Container */}
              <div className="relative w-full aspect-4/3 bg-slate-100 overflow-hidden">
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Filter Tags / Pills */}
        <div className="mt-12 flex flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Búsquedas frecuentes
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl">
            {QUICK_TAGS.map((tag) => (
              <Link
                key={tag}
                href={`#tag-${encodeURIComponent(tag)}`}
                className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-[#00509d] bg-white border border-blue-200 hover:bg-blue-50/80 hover:border-blue-400 transition-all duration-200 shadow-2xs active:scale-95"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
