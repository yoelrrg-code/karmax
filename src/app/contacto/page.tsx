import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer, type FooterProps } from "@/components/layout/Footer";
import { QuoteSteps, type QuoteStepsProps } from "@/components/home/QuoteSteps";
import { PreFooterCta, type PreFooterCtaProps } from "@/components/home/PreFooterCta";
import { ContactHeroBar } from "@/components/contact/ContactHeroBar";
import { ContactSection } from "@/components/contact/ContactSection";
import { RevealOnScroll } from "@/components/common/RevealOnScroll";
import { getAllSiteSettings, getSeoSettings } from "@/lib/services/karmaxService";
import { JsonLd, buildBreadcrumbsSchema } from "@/components/seo/JsonLd";
import type { ContactPageData } from "@/types";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const baseUrl = (seo.siteUrl || "https://karmax.mx").replace(/\/$/, "");
  const title = "Contacto y Cotizaciones Mayoristas | KARMAX";
  const description =
    "Comunícate con el equipo de KARMAX para cotizaciones de productos químicos, soluciones de limpieza y asesoría técnica especializada en México.";
  const canonical = `${baseUrl}/contacto`;
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

export default async function ContactoPage() {
  const [settings, seo] = await Promise.all([
    getAllSiteSettings(),
    getSeoSettings(),
  ]);

  const baseUrl = (seo.siteUrl || "https://karmax.mx").replace(/\/$/, "");
  const contactData = (settings.contact_page as ContactPageData) || {};
  const footerInfo = (settings.footer_info as FooterProps["data"]) || {};
  const socialLinks = (settings.social_links as FooterProps["socialLinks"]) || {};
  const quoteSteps = (settings.quote_steps as QuoteStepsProps["steps"]) || [];
  const prefooterData = (settings.prefooter_cta as PreFooterCtaProps["data"]) || {};

  const breadcrumbs = [
    { name: "Inicio", url: baseUrl },
    { name: "Contacto", url: `${baseUrl}/contacto` },
  ];

  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contacto KARMAX",
    url: `${baseUrl}/contacto`,
    description: "Página de contacto y cotizaciones de KARMAX México",
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[var(--dark-blue-karmax)] selection:text-white">
      {/* Schema.org Structured Data */}
      <JsonLd data={buildBreadcrumbsSchema(breadcrumbs)} />
      <JsonLd data={contactPageSchema} />

      {/* 1. Header principal */}
      <Header />

      <main className="flex-1">
        {/* 2. Banner azul de Contacto sin buscador */}
        <ContactHeroBar title={contactData.bannerTitle || "Contacto"} />

        {/* 3. Sección principal con formulario protegido y datos de contacto */}
        <RevealOnScroll direction="up" delay={0.1}>
          <ContactSection pageData={contactData} footerInfo={footerInfo} />
        </RevealOnScroll>

        {/* 4. Cotiza y recibe tu pedido en 3 pasos */}
        <RevealOnScroll direction="up" delay={0.1}>
          <QuoteSteps steps={quoteSteps} />
        </RevealOnScroll>

        {/* 5. Abastece tu empresa de forma fácil y conveniente */}
        <RevealOnScroll direction="up" delay={0.1}>
          <PreFooterCta data={prefooterData} />
        </RevealOnScroll>
      </main>

      {/* 6. Footer institucional */}
      <Footer data={footerInfo} socialLinks={socialLinks} />
    </div>
  );
}
