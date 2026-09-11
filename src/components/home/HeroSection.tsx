import React from "react";
import Link from "next/link";
import Image from "next/image";

interface HeroProductGridProps {
  className?: string;
}

const HeroProductGrid: React.FC<HeroProductGridProps> = ({ className = "" }) => {
  return (
    <div className={`relative w-full h-full flex flex-col overflow-hidden select-none ${className}`}>
      {/* Top Row (50% height): 50% | 25% | 25% */}
      <div className="flex w-full h-1/2">
        {/* 1. Mop Bucket & Wringer Cart */}
        <div
          className="relative w-1/2 h-full flex items-center justify-center px-3 pb-0 sm:p-5 lg:p-2 lg:pb-0"
          style={{ backgroundColor: "#FFF5DE" }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src="/images/hero/1.png"
              alt="Carrito exprimidor para limpieza"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
          </div>
        </div>

        {/* 2. Heavy-duty Trash Bags */}
        <div
          className="relative w-1/4 h-full flex items-center justify-center p-2 sm:p-3 lg:p-10"
          style={{ backgroundColor: "#B3EAF7" }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src="/images/hero/2.png"
              alt="Bolsas para residuos pesados"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 1024px) 25vw, 13vw"
            />
          </div>
        </div>

        {/* 3. Spray Cleaner Bottle */}
        <div
          className="relative w-1/4 h-full flex items-center justify-center p-2 sm:p-3 lg:px-10 lg:pb-0"
          style={{ backgroundColor: "#FF9844" }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src="/images/hero/3.png"
              alt="Limpiador multisuperficies KARMAX"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 1024px) 25vw, 13vw"
            />
          </div>
        </div>
      </div>

      {/* Bottom Row (50% height): 25% | 25% | 50% */}
      <div className="flex w-full h-1/2">
        {/* 4. Industrial Broom Head */}
        <div
          className="relative w-1/4 h-full flex items-center justify-center px-2 pt-0 pb-2 sm:p-3 lg:px-2 lg:pt-0 lg:pb-20 lg:pt-0"
          style={{ backgroundColor: "#FFCB26" }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src="/images/hero/4.png"
              alt="Escobillón de uso rudo"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 1024px) 25vw, 13vw"
            />
          </div>
        </div>

        {/* 5. Paper / Soap Dispenser */}
        <div
          className="relative w-1/4 h-full flex items-center justify-center p-2 sm:p-3 lg:p-12"
          style={{ backgroundColor: "#39A0DA" }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src="/images/hero/5.png"
              alt="Dispensador institucional"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 1024px) 25vw, 13vw"
            />
          </div>
        </div>

        {/* 6. Chemical Bottles Trio */}
        <div
          className="relative w-1/2 h-full flex items-center justify-center px-4 pb-0 pt-4 sm:p-5 lg:px-10 lg:pb-0 lg:pt-16"
          style={{ backgroundColor: "#BADD65" }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src="/images/hero/6.png"
              alt="Línea química y desinfección KARMAX"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
          </div>
        </div>
      </div>

      {/* Central KARMAX Badge */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 md:w-[250px] w-[200px] max-w-[280px] min-w-[120px] aspect-[532/379] pointer-events-none drop-shadow-md">
        <Image
          src="/images/hero/l-karmax-product.svg"
          alt="KARMAX Productos de Limpieza Profesionales"
          fill
          priority
          className="object-contain"
          sizes="(max-width: 1024px) 28vw, 15vw"
        />
      </div>
    </div>
  );
};

export const HeroSection: React.FC = () => {
  return (
    <section id="hero" className="relative w-full overflow-hidden text-white">
      {/* Background split (Desktop lg+) */}
      <div className="absolute inset-0 hidden lg:flex pointer-events-none">
        {/* Left 50%: Linear gradient from --blue-karmax to --light-blue-karmax */}
        <div
          className="w-1/2 h-full"
          style={{
            background:
              "linear-gradient(90deg, var(--blue-karmax) 0%, var(--light-blue-karmax) 100%)",
          }}
        />
        {/* Right 50%: Product Grid */}
        <div className="w-1/2 h-full relative overflow-hidden">
          <HeroProductGrid />
        </div>
      </div>

      {/* Mobile background gradient */}
      <div
        className="absolute inset-0 lg:hidden pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, var(--blue-karmax) 0%, var(--light-blue-karmax) 100%)",
        }}
      />

      {/* Foreground Content Container aligned with site grid (max-w-7xl mx-auto px-4 sm:px-6 lg:px-8) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[460px] lg:min-h-[450px] xl:min-h-[520px]">
          {/* Left Column: Copy & CTA */}
          <div className="flex flex-col justify-center py-8 lg:py-0 pr-0">
            <h1 className="tracking-tight mb-5 text-white">
              Todo lo que tu empresa necesita para limpieza e higiene
            </h1>
            <p className="text-base sm:text-lg text-white/90 font-normal leading-relaxed mb-8 max-w-lg">
              Productos fabricados por KARMAX y marcas complementarias para abastecer tu operación en un solo lugar.
            </p>
            <div>
              <Link
                href="#productos"
                className="btn-primary inline-flex items-center justify-center bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white px-8 py-4 rounded-full text-base shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Ver productos
              </Link>
            </div>
          </div>

          {/* Right Column: Visible only on mobile/tablet */}
          <div className="lg:hidden relative w-full aspect-[16/9] sm:aspect-[2/1] overflow-hidden rounded-2xl mb-8 shadow-md">
            <HeroProductGrid />
          </div>
        </div>
      </div>
    </section>
  );
};
