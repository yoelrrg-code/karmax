import React from "react";
import Link from "next/link";
import Image from "next/image";

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
        {/* Right 50%: hero.jpg full cover */}
        <div className="w-1/2 h-full relative">
          <Image
            src="/images/hero.jpg"
            alt="Productos de limpieza e higiene KARMAX"
            fill
            priority
            className="object-cover object-center"
            sizes="50vw"
          />
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
          <div className="flex flex-col justify-center py-0 pr-0">
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
          <div className="lg:hidden relative w-full h-[280px] sm:h-[380px] overflow-hidden rounded-2xl mb-8 shadow-md">
            <Image
              src="/images/hero.jpg"
              alt="Productos de limpieza e higiene KARMAX"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
