import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getProductBySlug, getRelatedProducts } from "@/lib/services/karmaxService";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { QuoteSteps } from "@/components/home/QuoteSteps";
import { PreFooterCta } from "@/components/home/PreFooterCta";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Producto no encontrado | KARMAX",
    };
  }

  return {
    title: `${product.name} | KARMAX`,
    description:
      product.shortDescription ||
      product.description?.slice(0, 160) ||
      `Conoce más sobre ${product.name} en KARMAX. Químicos y productos de limpieza industrial de la más alta calidad.`,
    openGraph: {
      title: `${product.name} | KARMAX`,
      description:
        product.shortDescription ||
        `Conoce más sobre ${product.name} en KARMAX.`,
      images: product.imageUrl ? [{ url: product.imageUrl }] : [],
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

  const relatedProducts = await getRelatedProducts(
    product.id,
    product.categoryId,
    8
  );

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+529988436581";

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[var(--dark-blue-karmax)] selection:text-white">
      <Header />
      <main className="flex-1">
        <ProductDetailView
          product={product}
          relatedProducts={relatedProducts}
        />
        {/* 5. Pasos de cotización (reutilizado) */}
        <QuoteSteps showCta={false} />

        {/* 6. Pre-Footer CTA */}
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
      </main>
      <Footer />
    </div>
  );
}
