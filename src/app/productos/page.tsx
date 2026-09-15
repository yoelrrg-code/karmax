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
  getSeoSettings,
} from "@/lib/services/karmaxService";
import {
  JsonLd,
  buildBreadcrumbsSchema,
  buildCatalogItemListSchema,
} from "@/components/seo/JsonLd";
import type { CatalogSortOption } from "@/types";
import type { FooterProps } from "@/components/layout/Footer";

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

export async function generateMetadata({
  searchParams,
}: ProductosPageProps): Promise<Metadata> {
  const params = await searchParams;
  const [seo, categories, industries] = await Promise.all([
    getSeoSettings(),
    getCategories(),
    getIndustries(),
  ]);

  const baseUrl = (seo.siteUrl || "https://karmax.mx").replace(/\/$/, "");
  let title = "Catálogo de Productos Químicos y Limpieza | KARMAX";
  let description =
    "Explora nuestro catálogo profesional de productos de limpieza, solventes, desinfectantes y químicos de alta calidad para empresas e industrias.";
  let canonical = `${baseUrl}/productos`;

  if (params.category) {
    const matchedCategory = categories.find((c) => c.slug === params.category);
    if (matchedCategory) {
      title = matchedCategory.metaTitle || `${matchedCategory.name} | Catálogo KARMAX`;
      description =
        matchedCategory.metaDescription ||
        `Productos y soluciones químicas para ${matchedCategory.name}. Distribución y precios mayoristas en México.`;
      canonical = `${baseUrl}/productos?category=${matchedCategory.slug}`;
    }
  } else if (params.industry) {
    const matchedIndustry = industries.find((i) => i.slug === params.industry);
    if (matchedIndustry) {
      title = matchedIndustry.metaTitle || `Productos Químicos para ${matchedIndustry.name} | KARMAX`;
      description =
        matchedIndustry.metaDescription ||
        matchedIndustry.description ||
        `Catálogo especializado en químicos y productos de limpieza para el sector ${matchedIndustry.name}.`;
      canonical = `${baseUrl}/productos?industry=${matchedIndustry.slug}`;
    }
  } else if (params.search) {
    title = `Búsqueda: "${params.search}" | Catálogo KARMAX`;
    description = `Resultados de productos químicos y soluciones para "${params.search}" en KARMAX México.`;
  }

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

export default async function ProductosPage({ searchParams }: ProductosPageProps) {
  const params = await searchParams;
  const categorySlug = params.category;
  const industrySlug = params.industry;
  const search = params.search;
  const sortBy = params.sortBy || "name_asc";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const [categories, industries, catalogData, footerInfo, socialLinks, seo] = await Promise.all([
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
    getSeoSettings(),
  ]);

  const baseUrl = (seo.siteUrl || "https://karmax.mx").replace(/\/$/, "");
  const breadcrumbs = [
    { name: "Inicio", url: baseUrl },
    { name: "Catálogo", url: `${baseUrl}/productos` },
  ];

  if (categorySlug) {
    const cat = categories.find((c) => c.slug === categorySlug);
    if (cat) {
      breadcrumbs.push({ name: cat.name, url: `${baseUrl}/productos?category=${cat.slug}` });
    }
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+529988436581";

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[var(--dark-blue-karmax)] selection:text-white">
      {/* Structured Data */}
      <JsonLd data={buildBreadcrumbsSchema(breadcrumbs)} />
      <JsonLd data={buildCatalogItemListSchema(catalogData.products, baseUrl)} />

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
