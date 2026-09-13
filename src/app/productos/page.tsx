import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { QuoteSteps } from "@/components/home/QuoteSteps";
import { PreFooterCta } from "@/components/home/PreFooterCta";
import { CatalogView } from "@/components/catalog/CatalogView";
import {
  getCategories,
  getIndustries,
  getProductsCatalog,
  getSiteSetting,
} from "@/lib/services/karmaxService";
import type { CatalogSortOption } from "@/types";
import type { FooterProps } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Catálogo de Productos | KARMAX",
  description:
    "Explora nuestro catálogo completo de productos profesionales de limpieza, higiene y químicos para cada industria.",
};

export const revalidate = 60;

interface ProductosPageProps {
  searchParams: Promise<{
    category?: string;
    industry?: string;
    search?: string;
    sortBy?: CatalogSortOption;
    page?: string;
  }>;
}

export default async function ProductosPage({ searchParams }: ProductosPageProps) {
  const params = await searchParams;
  const categorySlug = params.category;
  const industrySlug = params.industry;
  const search = params.search;
  const sortBy = params.sortBy || "name";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const [categories, industries, catalogData, footerInfo, socialLinks] = await Promise.all([
    getCategories(),
    getIndustries(),
    getProductsCatalog({
      categorySlug,
      industrySlug,
      search,
      sortBy,
      page,
      limit: 12,
    }),
    getSiteSetting<FooterProps["data"]>("footer_info", {}),
    getSiteSetting<FooterProps["socialLinks"]>("social_links", {}),
  ]);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+529988436581";

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[var(--dark-blue-karmax)] selection:text-white">
      {/* 1. Header idéntico a la homepage */}
      <Header />

      <main className="flex-1">
        {/* 2. Vista principal del catálogo con barra azul, filtros y grid */}
        <CatalogView
          initialProducts={catalogData.products}
          initialTotal={catalogData.total}
          initialPage={catalogData.page}
          initialTotalPages={catalogData.totalPages}
          categories={categories}
          industries={industries}
          initialCategorySlug={categorySlug}
          initialIndustrySlug={industrySlug}
          initialSearch={search}
          initialSortBy={sortBy}
        />

        {/* 3. Secciones complementarias copiadas de la homepage */}
        <QuoteSteps showCta={false} />
        <PreFooterCta title="¿Necesitas ayuda para elegir productos o calcular cantidades para tu empresa?" description="" cta={[{ label: "Hablar con un asesor por WhatsApp", link: `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=Hola,%20quisiera%20cotizar%20productos%20para%20mi%20empresa`, target: "_blank" }]} />
      </main>

      {/* 4. Footer idéntico a la homepage */}
      <Footer data={footerInfo} socialLinks={socialLinks} />
    </div>
  );
}
