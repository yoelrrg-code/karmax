import React from "react";
import { BRANDS_DATA } from "@/lib/data/mockData";

export const BrandsShowcase: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-extrabold text-center text-slate-800 tracking-tight mb-10">
          Las mejores marcas en un solo lugar
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6 items-center justify-items-center opacity-85">
          {BRANDS_DATA.map((brand) => (
            <div
              key={brand.id}
              className="flex items-center justify-center p-3 h-16 w-full max-w-[140px] rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100/80 transition-all cursor-default group"
            >
              <span className="font-black text-slate-700 group-hover:text-slate-900 tracking-wider text-sm sm:text-base select-none">
                {brand.logoText}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
