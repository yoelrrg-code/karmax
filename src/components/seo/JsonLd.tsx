import React from "react";
import type { ProductDetailItem, CatalogProductItem, SeoSettings } from "@/types";

interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Componente que inyecta JSON-LD estructurado de Schema.org en el HTML
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// 1. Schema: Organization & LocalBusiness
export function buildOrganizationSchema(seo: SeoSettings) {
  const siteUrl = seo.siteUrl || "https://karmax.mx";
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: seo.companyName || "KARMAX de México",
    alternateName: "KARMAX",
    url: siteUrl,
    logo: `${siteUrl}/images/karmax-logo.png`,
    description: seo.metaDescriptionDefault,
    telephone: seo.telephone || "+529988436581",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cadereyta Jiménez",
      addressRegion: "Nuevo León",
      addressCountry: "MX",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: seo.telephone || "+529988436581",
      contactType: "customer service",
      areaServed: "MX",
      availableLanguage: "Spanish",
    },
  };
}

export function buildLocalBusinessSchema(seo: SeoSettings) {
  const siteUrl = seo.siteUrl || "https://karmax.mx";
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: seo.companyName || "KARMAX",
    image: `${siteUrl}${seo.ogImageUrlDefault || "/images/hero-banner.jpg"}`,
    telephone: seo.telephone || "+529988436581",
    url: siteUrl,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cadereyta Jiménez",
      addressRegion: "Nuevo León",
      addressCountry: "MX",
    },
    priceRange: "$$",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
    ],
  };
}

// 2. Schema: WebSite with SearchAction
export function buildWebSiteSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "KARMAX",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/productos?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// 3. Schema: BreadcrumbList
export function buildBreadcrumbsSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// 4. Schema: Product with Offer
export function buildProductSchema(product: ProductDetailItem, siteUrl: string) {
  const productUrl = `${siteUrl}/productos/${product.slug}`;
  const price =
    product.salePrice && Number(product.salePrice) > 0
      ? product.salePrice
      : product.regularPrice && Number(product.regularPrice) > 0
      ? product.regularPrice
      : "0.00";

  const imageUrl = product.imageUrl
    ? product.imageUrl.startsWith("http")
      ? product.imageUrl
      : `${siteUrl}${product.imageUrl}`
    : `${siteUrl}/images/products/placeholder.jpg`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [imageUrl],
    description: product.shortDescription || product.description || product.name,
    sku: product.sku || `KMX-${product.id}`,
    brand: {
      "@type": "Brand",
      name: product.brand || "KARMAX",
    },
    category: product.categoryName || "Limpieza",
    url: productUrl,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "MXN",
      price: price,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stockStatus === "outofstock"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "KARMAX",
      },
    },
  };
}

// 5. Schema: CollectionPage / ItemList for Catalog
export function buildCatalogItemListSchema(
  products: CatalogProductItem[],
  siteUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Catálogo de Productos KARMAX",
    itemListElement: products.slice(0, 24).map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: p.name,
      url: `${siteUrl}/productos/${p.slug}`,
    })),
  };
}
