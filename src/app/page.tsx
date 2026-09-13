import { Header } from "@/components/layout/Header";
import { HeroSection, type HeroSectionProps } from "@/components/home/HeroSection";
import { TrustBadges, type TrustBadgesProps } from "@/components/home/TrustBadges";
import { CategoriesGrid } from "@/components/home/CategoriesGrid";
import { BrandsShowcase, type BrandsShowcaseProps } from "@/components/home/BrandsShowcase";
import { IndustrySolutions } from "@/components/home/IndustrySolutions";
import { QuoteSteps, type QuoteStepsProps } from "@/components/home/QuoteSteps";
import { PreFooterCta, type PreFooterCtaProps } from "@/components/home/PreFooterCta";
import { Footer, type FooterProps } from "@/components/layout/Footer";
import {
  getCategories,
  getIndustries,
  getAllSiteSettings,
} from "@/lib/services/karmaxService";

export const revalidate = 60; // Regenerar incremental cada 60s si hay cambios en MySQL

export default async function HomePage() {
  const [featuredCategories, otherCategories, industries, settings] = await Promise.all([
    getCategories(true),
    getCategories(false),
    getIndustries(),
    getAllSiteSettings(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[#00509d] selection:text-white">
      {/* Top Header & Navigation */}
      <Header />

      <main className="flex-1">
        {/* 1. Hero Section con copy y mosaico visual de productos */}
        <HeroSection data={settings.hero as HeroSectionProps["data"]} />

        {/* 2. Barra horizontal de propuesta de valor / confianza */}
        <TrustBadges badges={settings.trust_badges as TrustBadgesProps["badges"]} />

        {/* 3. Catálogo por categorías (8 cards fotográficas + sección 'Además') */}
        <CategoriesGrid
          categories={featuredCategories}
          otherCategories={otherCategories}
        />

        {/* 4. Marcas destacadas aliadas */}
        <BrandsShowcase brands={settings.brands as BrandsShowcaseProps["brands"]} />

        {/* 5. Soluciones y suministros por sector industrial */}
        <IndustrySolutions industries={industries} />

        {/* 6. Proceso de cotización en 3 simples pasos */}
        <QuoteSteps steps={settings.quote_steps as QuoteStepsProps["steps"]} />

        {/* 7. Llamado a la acción institucional */}
        <PreFooterCta data={settings.prefooter_cta as PreFooterCtaProps["data"]} />
      </main>

      {/* Footer corporativo */}
      <Footer data={settings.footer_info as FooterProps["data"]} />
    </div>
  );
}
