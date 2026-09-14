import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer, type FooterProps } from "@/components/layout/Footer";
import { QuoteSteps, type QuoteStepsProps } from "@/components/home/QuoteSteps";
import { PreFooterCta, type PreFooterCtaProps } from "@/components/home/PreFooterCta";
import { ContactHeroBar } from "@/components/contact/ContactHeroBar";
import { ContactSection } from "@/components/contact/ContactSection";
import { getAllSiteSettings } from "@/lib/services/karmaxService";
import type { ContactPageData } from "@/types";

export const metadata: Metadata = {
  title: "Contacto | KARMAX",
  description:
    "Comunícate con nuestro equipo para cotizaciones personalizadas, dudas o asesoría sobre productos profesionales de limpieza e higiene.",
};

export const revalidate = 60;

export default async function ContactoPage() {
  const settings = await getAllSiteSettings();

  const contactData = (settings.contact_page as ContactPageData) || {};
  const footerInfo = (settings.footer_info as FooterProps["data"]) || {};
  const socialLinks = (settings.social_links as FooterProps["socialLinks"]) || {};
  const quoteSteps = (settings.quote_steps as QuoteStepsProps["steps"]) || [];
  const prefooterData = (settings.prefooter_cta as PreFooterCtaProps["data"]) || {};

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[var(--dark-blue-karmax)] selection:text-white">
      {/* 1. Header principal */}
      <Header />

      <main className="flex-1">
        {/* 2. Banner azul de Contacto sin buscador */}
        <ContactHeroBar title={contactData.bannerTitle || "Contacto"} />

        {/* 3. Sección principal con formulario protegido y datos de contacto */}
        <ContactSection pageData={contactData} footerInfo={footerInfo} />

        {/* 4. Cotiza y recibe tu pedido en 3 pasos */}
        <QuoteSteps steps={quoteSteps} />

        {/* 5. Abastece tu empresa de forma fácil y conveniente */}
        <PreFooterCta data={prefooterData} />
      </main>

      {/* 6. Footer institucional */}
      <Footer data={footerInfo} socialLinks={socialLinks} />
    </div>
  );
}
