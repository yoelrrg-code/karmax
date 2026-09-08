import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { IndustryItem } from "@/types";
import { getIndustries } from "@/lib/services/karmaxService";

interface IndustrySolutionsProps {
  industries?: IndustryItem[];
}

export const IndustrySolutions = async ({ industries: propIndustries }: IndustrySolutionsProps = {}) => {
  const industries = propIndustries ?? await getIndustries();
  return (
    <section id="industries" className="py-16 sm:py-24 bg-[var(--light-bg-karmax)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="tracking-tight">
            Soluciones para cada industria
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((ind) => {
            return (
              <div
                key={ind.id}
                className="bg-white rounded-[20px] p-6 transition-all duration-300 flex flex-col justify-between group text-center"
              >
                <div className="flex flex-col items-center">
                  {/* Icon Circle */}
                  <div className="w-28 h-28 flex items-center justify-center mb-5">
                    <Image
                        src={ind.iconUrl}
                        alt={ind.name}
                        width={100}
                        height={100}
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>

                  {/* Industry Title */}
                  <h3 className="text-base text-[var(--blue-karmax)] mb-2 flex items-center justify-center px-2">
                    {ind.name}
                  </h3>

                  {/* Description */}
                  <p className="leading-relaxed mb-6 text-[var(--text-karmax)]">
                    {ind.description}
                  </p>
                </div>

                {/* "Ver productos" Outline Button */}
                <div className="pt-2">
                  <Link
                    href={`${ind.catLink}`}
                    className="btn-secondary inline-flex items-center justify-center py-3 px-5 rounded-full border border-[var(--green-karmax)] text-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] hover:text-white transition-all duration-200"
                  >
                    Ver productos
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
