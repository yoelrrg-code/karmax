import React from "react";
import Image from "next/image";
import { BRANDS_DATA } from "@/lib/data/mockData";

export const BrandsShowcase: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center tracking-tight mb-10">
          Las mejores marcas en un solo lugar
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-5 items-center justify-items-center opacity-85">
          {BRANDS_DATA.map((brand) => (
            <div
              key={brand.id}
              className="flex items-center justify-center w-full max-w-[100px] h-full max-h-[92px] group"
            >
              {brand.logoUrl ? (
                <Image
                  src={brand.logoUrl}
                  alt={brand.name}
                  width={120}
                  height={40}
                  className="max-w-full max-h-full object-contain grayscale"
                />
              ) : (
                <span className="font-black text-slate-700 group-hover:text-slate-900 tracking-wider text-sm sm:text-base select-none">
                  {brand.logoText ?? brand.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};