import React from "react";
import Image from "next/image";
import { BRANDS_DATA } from "@/lib/data/mockData";

export interface BrandsShowcaseProps {
  brands?: Array<{
    id: number | string;
    name: string;
    logoUrl?: string;
    logoText?: string;
  }>;
}

export const BrandsShowcase: React.FC<BrandsShowcaseProps> = ({ brands }) => {
  const items = brands && brands.length > 0 ? brands : BRANDS_DATA;

  return (
    <section className="pt-12 pb-16 sm:pt-14 sm:pb-25  bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center tracking-tight mb-10">
          Las mejores marcas en un solo lugar
        </h2>

        <div className="flex flex-wrap gap-x-8 md:gap-x-18 gap-y-4 md:gap-y-10 items-center justify-center opacity-85">
          {items.map((brand) => (
            <div
              key={brand.id}
              className="flex items-center justify-center w-[20%] md:w-[14%] max-w-[100px] h-full group"
            >
              {brand.logoUrl ? (
                <Image
                  src={brand.logoUrl}
                  alt={brand.name}
                  width={120}
                  height={40}
                  className="max-w-full w-full h-full max-h-[92px] object-contain grayscale"
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