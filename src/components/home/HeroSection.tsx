"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface FadeCellProps {
  images: Array<{ src: string; alt: string }>;
  sizes: string;
  className: string;
  style?: React.CSSProperties;
  paddingClass?: string;
  minInterval?: number;
  maxInterval?: number;
}

const HERO_CELL_IMAGES = {
  cell1: [
    { src: "/images/hero/1.png", alt: "Carrito exprimidor para limpieza" },
    { src: "/images/hero/11.png", alt: "Cubeta con exprimidor industrial" },
    { src: "/images/hero/111.png", alt: "Cubeta giratoria profesional" },
  ],
  cell2: [
    { src: "/images/hero/2.png", alt: "Bolsas para residuos pesados" },
    { src: "/images/hero/22.png", alt: "Bolsas de alta resistencia" },
    { src: "/images/hero/222.png", alt: "Guantes de nitrilo profesionales" },
  ],
  cell3: [
    { src: "/images/hero/3.png", alt: "Limpiador multisuperficies KARMAX" },
    { src: "/images/hero/33.png", alt: "Desinfectante de superficies para atomizador" },
    { src: "/images/hero/333.png", alt: "Limpiador de cristales profesional" },
  ],
  cell4: [
    { src: "/images/hero/4.png", alt: "Escobillón de uso rudo" },
    { src: "/images/hero/44.png", alt: "Escoba industrial grande" },
    { src: "/images/hero/444.png", alt: "Trapeador microfibra profesional" },
  ],
  cell5: [
    { src: "/images/hero/5.png", alt: "Dispensador institucional" },
    { src: "/images/hero/55.png", alt: "Despachador de toalla de papel" },
    { src: "/images/hero/555.png", alt: "Despachador institucional jumbo" },
  ],
  cell6: [
    { src: "/images/hero/6.png", alt: "Línea química y desinfección KARMAX" },
    { src: "/images/hero/66.png", alt: "Limpiador multiusos 10 Lts" },
    { src: "/images/hero/666.png", alt: "Químicos y jabón para manos" },
  ],
};

const FadeCell: React.FC<FadeCellProps> = ({
  images,
  sizes,
  className,
  style,
  paddingClass = "",
  minInterval = 2800,
  maxInterval = 4800,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const scheduleNext = () => {
      const delay =
        Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
      timeoutId = setTimeout(() => {
        setCurrentIndex((prev) => {
          let next;
          do {
            next = Math.floor(Math.random() * images.length);
          } while (next === prev && images.length > 1);
          return next;
        });
        scheduleNext();
      }, delay);
    };

    // Desfasar el inicio de la animación en cada columna aleatoriamente (1.2s - 3.5s)
    const initialDelay = Math.floor(Math.random() * 2300) + 1200;
    timeoutId = setTimeout(() => {
      setCurrentIndex((prev) => {
        let next;
        do {
          next = Math.floor(Math.random() * images.length);
        } while (next === prev && images.length > 1);
        return next;
      });
      scheduleNext();
    }, initialDelay);

    return () => clearTimeout(timeoutId);
  }, [images.length, minInterval, maxInterval]);

  return (
    <div
      className={`relative h-full flex items-center justify-center overflow-hidden ${className} ${paddingClass}`}
      style={style}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {images.map((img, idx) => (
          <div
            key={img.src}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out ${
              currentIndex === idx
                ? "opacity-100 z-10"
                : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={idx === 0}
              className="object-contain"
              sizes={sizes}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

interface HeroProductGridProps {
  className?: string;
}

const HeroProductGrid: React.FC<HeroProductGridProps> = ({ className = "" }) => {
  return (
    <div className={`relative w-full h-full flex flex-col overflow-hidden select-none ${className}`}>
      {/* Top Row (50% height): 50% | 25% | 25% */}
      <div className="flex w-full h-1/2">
        {/* 1. Mop Bucket & Wringer Cart */}
        <FadeCell
          className="w-1/2"
          style={{ backgroundColor: "#FFF5DE" }}
          paddingClass="px-3 pb-0 sm:p-5 lg:p-2 lg:pb-0"
          sizes="(max-width: 1024px) 50vw, 25vw"
          images={HERO_CELL_IMAGES.cell1}
        />

        {/* 2. Heavy-duty Trash Bags */}
        <FadeCell
          className="w-1/4"
          style={{ backgroundColor: "#B3EAF7" }}
          paddingClass="p-2 sm:p-3 lg:p-10"
          sizes="(max-width: 1024px) 25vw, 13vw"
          images={HERO_CELL_IMAGES.cell2}
        />

        {/* 3. Spray Cleaner Bottle */}
        <FadeCell
          className="w-1/4"
          style={{ backgroundColor: "#FF9844" }}
          paddingClass="p-2 sm:p-3 lg:px-10 lg:pb-0"
          sizes="(max-width: 1024px) 25vw, 13vw"
          images={HERO_CELL_IMAGES.cell3}
        />
      </div>

      {/* Bottom Row (50% height): 25% | 25% | 50% */}
      <div className="flex w-full h-1/2">
        {/* 4. Industrial Broom Head */}
        <FadeCell
          className="w-1/4"
          style={{ backgroundColor: "#FFCB26" }}
          paddingClass="px-2 pt-0 pb-2 sm:p-3 lg:px-2 lg:pt-0 lg:pb-20"
          sizes="(max-width: 1024px) 25vw, 13vw"
          images={HERO_CELL_IMAGES.cell4}
        />

        {/* 5. Paper / Soap Dispenser */}
        <FadeCell
          className="w-1/4"
          style={{ backgroundColor: "#39A0DA" }}
          paddingClass="p-2 sm:p-3 lg:p-12"
          sizes="(max-width: 1024px) 25vw, 13vw"
          images={HERO_CELL_IMAGES.cell5}
        />

        {/* 6. Chemical Bottles Trio */}
        <FadeCell
          className="w-1/2"
          style={{ backgroundColor: "#BADD65" }}
          paddingClass="px-4 pb-0 pt-4 sm:p-5 lg:px-10 lg:pb-0 lg:pt-16"
          sizes="(max-width: 1024px) 50vw, 25vw"
          images={HERO_CELL_IMAGES.cell6}
        />
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

export interface HeroSectionProps {
  data?: {
    badgeText?: string;
    title?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
    whatsappText?: string;
    whatsappMessage?: string;
  };
}

export const HeroSection: React.FC<HeroSectionProps> = ({ data }) => {
  const title = data?.title || "Todo lo que tu empresa necesita para limpieza e higiene";
  const description =
    data?.description ||
    "Productos fabricados por KARMAX y marcas complementarias para abastecer tu operación en un solo lugar.";
  const ctaText = data?.ctaText || "Ver productos";
  const ctaLink = data?.ctaLink || "#productos";

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
            {data?.badgeText && (
              <span className="inline-block px-3.5 py-1 mb-3 text-xs font-semibold uppercase tracking-wider rounded-full bg-white/20 text-white w-fit">
                {data.badgeText}
              </span>
            )}
            <h1 className="tracking-tight mb-5 text-white">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-white/90 font-normal leading-relaxed mb-8 max-w-lg">
              {description}
            </p>
            <div>
              <Link
                href={ctaLink}
                className="btn-primary inline-flex items-center justify-center bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white px-8 py-4 rounded-full text-base shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {ctaText}
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
