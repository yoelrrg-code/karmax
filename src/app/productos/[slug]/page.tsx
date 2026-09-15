import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  getProductBySlug,
  getRelatedProducts,
  getSiteSetting,
  getSeoSettings,
} from "@/lib/services/karmaxService";
import {
  JsonLd,
  buildProductSchema,
  buildBreadcrumbsSchema,
} from "@/components/seo/JsonLd";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { QuoteSteps } from "@/components/home/QuoteSteps";
import { PreFooterCta } from "@/components/home/PreFooterCta";
import { RevealOnScroll } from "@/components/common/RevealOnScroll";
import type { FooterProps } from "@/components/layout/Footer";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [product, seo] = await Promise.all([
    getProductBySlug(slug),
    getSeoSettings(),
  ]);

  if (!product) {
    return {
      title: "Producto no encontrado | KARMAX",
    };
  }

  const baseUrl = (seo.siteUrl || "https://karmax.mx").replace(/\/$/, "");
  const title = product.metaTitle || `${product.name} | KARMAX`;
  const description =
    product.metaDescription ||
    product.shortDescription ||
    (product.description ? product.description.slice(0, 160) : "") ||
    `Conoce más sobre ${product.name} en KARMAX. Químicos y productos de limpieza industrial de la más alta calidad.`;

  const canonical = `${baseUrl}/productos/${product.slug}`;
  const rawImage = product.imageUrl || seo.ogImageUrlDefault || "/images/hero/hero-bg.jpg";
  const ogImageUrl = rawImage.startsWith("http") ? rawImage : `${baseUrl}${rawImage}`;

  return {
    title,
    description,
    keywords: product.metaKeywords ? product.metaKeywords.split(",").map((k) => k.trim()) : undefined,
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
          url: ogImageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      locale: "es_MX",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [relatedProducts, footerInfo, socialLinks, seo] = await Promise.all([
    getRelatedProducts(product.id, product.categoryId, 8),
    getSiteSetting<FooterProps["data"]>("footer_info", {}),
    getSiteSetting<FooterProps["socialLinks"]>("social_links", {}),
    getSeoSettings(),
  ]);

  const baseUrl = (seo.siteUrl || "https://karmax.mx").replace(/\/$/, "");
  const breadcrumbs = [
    { name: "Inicio", url: baseUrl },
    { name: "Catálogo", url: `${baseUrl}/productos` },
  ];

  if (product.categoryName) {
    breadcrumbs.push({
      name: product.categoryName,
      url: `${baseUrl}/productos?category=${product.categorySlug || ""}`,
    });
  }
  breadcrumbs.push({
    name: product.name,
    url: `${baseUrl}/productos/${product.slug}`,
  });

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+529988436581";

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[var(--dark-blue-karmax)] selection:text-white">
      {/* Schema.org Structured Data */}
      <JsonLd data={buildBreadcrumbsSchema(breadcrumbs)} />
      <JsonLd data={buildProductSchema(product, baseUrl)} />

      <Header />
      <main className="flex-1">
        <ProductDetailView
          product={product}
          relatedProducts={relatedProducts}
        />
        {/* 5. Pasos de cotización (reutilizado) */}
        <RevealOnScroll direction="up" delay={0.1}>
          <QuoteSteps showCta={false} />
        </RevealOnScroll>

        {/* 6. Pre-Footer CTA */}
        <RevealOnScroll direction="up" delay={0.1}>
          <PreFooterCta
            title="¿Necesitas ayuda para elegir productos o calcular cantidades para tu empresa?"
            description=""
            cta={[
              {
                label: "Hablar con un asesor por WhatsApp",
                link: `https://wa.me/${whatsappNumber}`,
                target: "_blank",
              },
            ]}
          />
        </RevealOnScroll>
      </main>
      <Footer data={footerInfo} socialLinks={socialLinks} />
    </div>
  );
}
