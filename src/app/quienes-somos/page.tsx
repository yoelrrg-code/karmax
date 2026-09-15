import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer, type FooterProps } from "@/components/layout/Footer";
import { QuoteSteps, type QuoteStepsProps } from "@/components/home/QuoteSteps";
import { PreFooterCta, type PreFooterCtaProps } from "@/components/home/PreFooterCta";
import { AboutHeroBar } from "@/components/about/AboutHeroBar";
import { AboutStorySection } from "@/components/about/AboutStorySection";
import { AboutValuesSection } from "@/components/about/AboutValuesSection";
import { RevealOnScroll } from "@/components/common/RevealOnScroll";
import { getAllSiteSettings, getSeoSettings } from "@/lib/services/karmaxService";
import { JsonLd, buildBreadcrumbsSchema } from "@/components/seo/JsonLd";
import type { AboutUsPageData } from "@/types";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const baseUrl = (seo.siteUrl || "https://karmax.mx").replace(/\/$/, "");
  const title = "Quiénes Somos | Historia y Valores de KARMAX México";
  const description =
    "Conoce más sobre KARMAX, empresa 100% mexicana dedicada a la fabricación y distribución de productos de limpieza, higiene y químicos profesionales.";
  const canonical = `${baseUrl}/quienes-somos`;
  const ogImage = seo.ogImageUrlDefault || "/images/hero/hero-bg.jpg";
  const fullOgImage = ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: seo.companyName || "KARMAX",
      images: [
        {
          url: fullOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "es_MX",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [fullOgImage],
    },
  };
}

export default async function QuienesSomosPage() {
  const [settings, seo] = await Promise.all([
    getAllSiteSettings(),
    getSeoSettings(),
  ]);

  const baseUrl = (seo.siteUrl || "https://karmax.mx").replace(/\/$/, "");
  const aboutData = (settings.about_us as AboutUsPageData) || {};
  const footerInfo = (settings.footer_info as FooterProps["data"]) || {};
  const socialLinks = (settings.social_links as FooterProps["socialLinks"]) || {};
  const quoteSteps = (settings.quote_steps as QuoteStepsProps["steps"]) || [];
  const prefooterData = (settings.prefooter_cta as PreFooterCtaProps["data"]) || {};

  const breadcrumbs = [
    { name: "Inicio", url: baseUrl },
    { name: "Quiénes Somos", url: `${baseUrl}/quienes-somos` },
  ];

  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Quiénes Somos - KARMAX",
    url: `${baseUrl}/quienes-somos`,
    description: "Historia, misión, visión y valores de KARMAX Soluciones Químicas en México",
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[var(--dark-blue-karmax)] selection:text-white">
      {/* Schema.org Structured Data */}
      <JsonLd data={buildBreadcrumbsSchema(breadcrumbs)} />
      <JsonLd data={aboutPageSchema} />

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
