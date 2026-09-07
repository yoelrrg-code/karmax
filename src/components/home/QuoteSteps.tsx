import React from "react";
import Link from "next/link";
import { ShoppingCart, FileSpreadsheet, CheckCircle2, LucideIcon } from "lucide-react";
import { QUOTE_STEPS } from "@/lib/data/mockData";

const STEP_ICONS: Record<string, LucideIcon> = {
  ShoppingCart,
  FileSpreadsheet,
  CheckCircle2,
};

export const QuoteSteps: React.FC = () => {
  return (
    <section id="cotizacion" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Cotiza y recibe tu pedido en 3 pasos
          </h2>
        </div>

        {/* 3 Step Flow with connecting line */}
        <div className="relative max-w-5xl mx-auto mb-12">
          {/* Connecting dotted line for desktop */}
          <div
            className="hidden md:block absolute top-7 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-[#22c55e]/50 z-0"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative z-10">
            {QUOTE_STEPS.map((step) => {
              const Icon = STEP_ICONS[step.iconName] || CheckCircle2;

              return (
                <div key={step.step} className="flex flex-col items-center text-center">
                  {/* Step Icon Badge */}
                  <div className="w-14 h-14 rounded-full bg-[#22c55e] text-white flex items-center justify-center shadow-md shadow-[#22c55e]/20 mb-5 relative">
                    <Icon className="w-7 h-7 stroke-[2]" />
                    <span className="absolute -top-1 -right-1 bg-white text-slate-900 text-xs font-black w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center">
                      {step.step}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2.5">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Link
            href="#productos"
            className="inline-flex items-center justify-center bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold px-8 py-3.5 rounded-lg text-sm sm:text-base shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Empieza a cotizar ahora
          </Link>
        </div>
      </div>
    </section>
  );
};
