import React from "react";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustBadges } from "@/components/home/TrustBadges";
import { CategoriesGrid } from "@/components/home/CategoriesGrid";
import { BrandsShowcase } from "@/components/home/BrandsShowcase";
import { IndustrySolutions } from "@/components/home/IndustrySolutions";
import { QuoteSteps } from "@/components/home/QuoteSteps";
import { PreFooterCta } from "@/components/home/PreFooterCta";
import { Footer } from "@/components/layout/Footer";
import { getCategories, getIndustries } from "@/lib/services/karmaxService";

export const revalidate = 60; // Regenerar incremental cada 60s si hay cambios en MySQL

export default async function HomePage() {
  const [categories, industries] = await Promise.all([
    getCategories(),
    getIndustries(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[#00509d] selection:text-white">
      {/* Top Header & Navigation */}
      <Header />

      <main className="flex-1">
        {/* 1. Hero Section con copy y mosaico visual de productos */}
        <HeroSection />

        {/* 2. Barra horizontal de propuesta de valor / confianza */}
        <TrustBadges />

        {/* 3. Catálogo por categorías (8 cards fotográficas + filtros rápidos) */}
        <CategoriesGrid categories={categories} />

        {/* 4. Marcas destacadas aliadas */}
        <BrandsShowcase />

        {/* 5. Soluciones y suministros por sector industrial */}
        <IndustrySolutions industries={industries} />

        {/* 6. Proceso de cotización en 3 simples pasos */}
        <QuoteSteps />

        {/* 7. Llamado a la acción institucional */}
        <PreFooterCta />
      </main>

      {/* Footer corporativo */}
      <Footer />
    </div>
  );
}
