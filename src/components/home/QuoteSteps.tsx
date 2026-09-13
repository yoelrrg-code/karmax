import React from "react";
import Link from "next/link";
import Image from "next/image";
import { QUOTE_STEPS } from "@/lib/data/mockData";

export interface QuoteStepsProps {
  showCta?: boolean;
  steps?: Array<{
    step: number;
    title: string;
    description: string;
    iconUrl: string;
  }>;
}

export const QuoteSteps: React.FC<QuoteStepsProps> = ({
  showCta = true,
  steps,
}) => {
  const items = steps && steps.length > 0 ? steps : QUOTE_STEPS;

  return (
    <section id="cotizacion">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Cotiza y recibe tu pedido en 3 pasos
          </h2>
        </div>

        {/* 3 Step Flow with connecting line */}
        <div className="relative max-w-7xl mx-auto mb-12">
          {/* Connecting dotted line for desktop */}
          <div
            className="hidden md:block absolute top-11 left-[15%] right-[15%] h-1 border-t-2 border-dashed border-[var(--green-karmax)] z-0"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
            {items.map((step) => {

              return (
                <div key={step.step} className="flex flex-col items-center text-center">
                  {/* Step Icon Badge */}
                  <div className="mb-5 relative">
                    <Image
                      src={step.iconUrl}
                      alt={step.title}
                      width={88}
                      height={88}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-base mb-2.5">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Button */}
        {showCta && (
          <div className="flex justify-center">
            <Link
              href="/productos"
              className="btn-primary inline-flex items-center justify-center bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white px-8 py-4 rounded-full text-base shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              Empieza a cotizar ahora
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
