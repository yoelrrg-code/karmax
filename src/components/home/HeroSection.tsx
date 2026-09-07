import React from "react";
import Link from "next/link";
import Image from "next/image";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-[#00509d] text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px] lg:min-h-[540px]">
          {/* Left Column: Copy and CTA */}
          <div className="lg:col-span-6 flex flex-col justify-center px-6 sm:px-10 lg:px-12 py-12 lg:py-16 z-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white mb-6">
              Todo lo que tu empresa necesita para limpieza e higiene
            </h1>
            <p className="text-base sm:text-lg text-blue-100/90 font-normal leading-relaxed mb-8 max-w-xl">
              Productos fabricados por <span className="font-bold text-white">KARMAX</span> y marcas complementarias para satisfacer tus compras en un solo lugar.
            </p>
            <div>
              <Link
                href="#productos"
                className="inline-flex items-center justify-center bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold px-8 py-3.5 rounded-lg text-base shadow-lg shadow-black/15 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Ver productos
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Product Mosaic */}
          <div className="lg:col-span-6 relative w-full h-[360px] sm:h-[440px] lg:h-auto min-h-[420px] overflow-hidden bg-slate-900/10">
            <div className="grid grid-cols-3 grid-rows-2 w-full h-full gap-1 p-1">
              {/* Box 1: Cubeta exprimidora (Amarillo) */}
              <div className="relative bg-[#facc15] overflow-hidden flex items-center justify-center group">
                <div className="relative w-4/5 h-4/5">
                  <Image
                    src="https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?auto=format&fit=crop&w=500&q=80"
                    alt="Cubeta con exprimidor industrial"
                    fill
                    className="object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 33vw, 20vw"
                  />
                </div>
              </div>

              {/* Box 2: Bolsas de basura en rollo (Naranja/Salmón) */}
              <div className="relative bg-[#fb923c] overflow-hidden flex items-center justify-center group">
                <div className="relative w-4/5 h-4/5">
                  <Image
                    src="https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=500&q=80"
                    alt="Bolsas de basura industriales en rollo"
                    fill
                    className="object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 33vw, 20vw"
                  />
                </div>
              </div>

              {/* Box 3: Atomizador y químico (Celeste) */}
              <div className="relative bg-[#38bdf8] overflow-hidden flex items-center justify-center group">
                <div className="relative w-4/5 h-4/5">
                  <Image
                    src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80"
                    alt="Pulverizador desinfectante multiusos"
                    fill
                    className="object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 33vw, 20vw"
                  />
                </div>
              </div>

              {/* Box 4: Escoba y jarcería (Azul marino) */}
              <div className="relative bg-[#0284c7] overflow-hidden flex items-center justify-center group">
                <div className="relative w-4/5 h-4/5">
                  <Image
                    src="https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=500&q=80"
                    alt="Escobillón y accesorios de limpieza"
                    fill
                    className="object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 33vw, 20vw"
                  />
                </div>
              </div>

              {/* Box 5: Dispensador de pared (Gris neutro) */}
              <div className="relative bg-[#475569] overflow-hidden flex items-center justify-center group">
                <div className="relative w-4/5 h-4/5">
                  <Image
                    src="https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&w=500&q=80"
                    alt="Dispensador institucional de toallas y jabón"
                    fill
                    className="object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 33vw, 20vw"
                  />
                </div>
              </div>

              {/* Box 6: Galones y químicos de limpieza (Verde suave / Menta) */}
              <div className="relative bg-[#34d399] overflow-hidden flex items-center justify-center group">
                <div className="relative w-4/5 h-4/5">
                  <Image
                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=500&q=80"
                    alt="Bidones y galones de químicos de limpieza"
                    fill
                    className="object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 33vw, 20vw"
                  />
                </div>
              </div>
            </div>

            {/* Central Floating KARMAX Emblem Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
              <div className="bg-white/95 backdrop-blur-xs px-4 py-2 rounded-full border-2 border-white shadow-2xl flex items-center gap-1.5 transform hover:scale-105 transition-transform">
                <div className="bg-[#004e9a] text-white text-xs font-black tracking-wider px-2 py-0.5 rounded">
                  KARMAX
                </div>
                <span className="text-xs font-bold text-slate-800 tracking-tight hidden sm:inline">
                  CALIDAD INDUSTRIAL
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
