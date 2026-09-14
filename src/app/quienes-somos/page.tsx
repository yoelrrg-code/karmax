import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer, type FooterProps } from "@/components/layout/Footer";
import { QuoteSteps, type QuoteStepsProps } from "@/components/home/QuoteSteps";
import { PreFooterCta, type PreFooterCtaProps } from "@/components/home/PreFooterCta";
import { AboutHeroBar } from "@/components/about/AboutHeroBar";
import { AboutStorySection } from "@/components/about/AboutStorySection";
import { AboutValuesSection } from "@/components/about/AboutValuesSection";
import { RevealOnScroll } from "@/components/common/RevealOnScroll";
import { getAllSiteSettings } from "@/lib/services/karmaxService";
import type { AboutUsPageData } from "@/types";

export const metadata: Metadata = {
  title: "Quiénes Somos | KARMAX",
  description:
    "Conoce más sobre KARMAX, empresa 100% mexicana nacida en Cadereyta Jiménez, Nuevo León, dedicada a la fabricación y distribución de productos de limpieza profesional.",
};

export const revalidate = 60;

export default async function QuienesSomosPage() {
  const settings = await getAllSiteSettings();

  const aboutData = (settings.about_us as AboutUsPageData) || {};
  const footerInfo = (settings.footer_info as FooterProps["data"]) || {};
  const socialLinks = (settings.social_links as FooterProps["socialLinks"]) || {};
  const quoteSteps = (settings.quote_steps as QuoteStepsProps["steps"]) || [];
  const prefooterData = (settings.prefooter_cta as PreFooterCtaProps["data"]) || {};

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[var(--dark-blue-karmax)] selection:text-white">
      {/* 1. Header principal */}
      <Header />

      <main className="flex-1">
        {/* 2. Banner azul de Quiénes Somos */}
        <AboutHeroBar title={aboutData.bannerTitle || "Quiénes Somos"} />

        {/* 3. Sección 1: Historia, Misión, Visión y Mosaico (Fondo Blanco) */}
        <RevealOnScroll direction="up" delay={0.1}>
          <AboutStorySection data={aboutData} />
        </RevealOnScroll>

        {/* 4. Sección 2: Nuestros Valores (Fondo --light-bg-karmax) */}
        <RevealOnScroll direction="up" delay={0.1}>
          <AboutValuesSection data={aboutData} />
        </RevealOnScroll>

        {/* 5. Cotiza y recibe tu pedido en 3 pasos */}
        <RevealOnScroll direction="up" delay={0.1}>
          <QuoteSteps steps={quoteSteps} />
        </RevealOnScroll>

        {/* 6. Abastece tu empresa de forma fácil y conveniente */}
        <RevealOnScroll direction="up" delay={0.1}>
          <PreFooterCta data={prefooterData} />
        </RevealOnScroll>
      </main>

      {/* 7. Footer institucional */}
      <Footer data={footerInfo} socialLinks={socialLinks} />
    </div>
  );
}
