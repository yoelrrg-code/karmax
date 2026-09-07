import React from "react";
import Link from "next/link";
import { IndustryItem } from "@/lib/data/mockData";
import {
  Hotel,
  UtensilsCrossed,
  Building2,
  Building,
  Stethoscope,
  Dumbbell,
  Sparkles,
  Car,
  LucideIcon,
} from "lucide-react";

interface IndustrySolutionsProps {
  industries: IndustryItem[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  Hotel,
  UtensilsCrossed,
  Building2,
  Building,
  Stethoscope,
  Dumbbell,
  Sparkles,
  Car,
};

export const IndustrySolutions: React.FC<IndustrySolutionsProps> = ({ industries }) => {
  return (
    <section id="industrias" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Soluciones para cada industria
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((ind) => {
            const IconComponent = ICON_MAP[ind.iconName] || Sparkles;

            return (
              <div
                key={ind.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:border-[#22c55e]/40 text-center"
              >
                <div className="flex flex-col items-center">
                  {/* Icon Circle */}
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#10b981] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                    <IconComponent className="w-7 h-7 stroke-[1.75]" />
                  </div>

                  {/* Industry Title */}
                  <h3 className="text-base font-bold text-slate-900 mb-2.5 line-clamp-2 min-h-[3rem] flex items-center justify-center">
                    {ind.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6 line-clamp-3">
                    {ind.description}
                  </p>
                </div>

                {/* "Ver productos" Outline Button */}
                <div className="pt-2">
                  <Link
                    href={`#industria-${ind.slug}`}
                    className="inline-flex items-center justify-center w-full py-2 px-4 rounded-full border border-[#22c55e] text-[#16a34a] hover:bg-[#22c55e] hover:text-white text-xs sm:text-sm font-semibold transition-all duration-200"
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
