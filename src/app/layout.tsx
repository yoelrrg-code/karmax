import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Providers } from "@/context/Providers";
import { QuoteDrawer } from "@/components/quote/QuoteDrawer";
import { AuthModal } from "@/components/auth/AuthModal";
import { PageLoader } from "@/components/common/PageLoader";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://karmax.mx"),
  title: {
    default: "KARMAX | Soluciones Químicas y Limpieza Industrial",
    template: "%s | KARMAX",
  },
  description:
    "Venta y cotización de productos de limpieza industrial, higiene institucional, jarcería y químicos por mayoreo para empresas con cobertura nacional.",
  keywords: [
    "KARMAX",
    "productos de limpieza por mayoreo",
    "limpieza industrial",
    "jarcería",
    "artículos de higiene para empresas",
    "químicos de limpieza",
    "insumos para hoteles y restaurantes",
    "químicos industriales nuevo león",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${poppins.variable} font-sans h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <Providers>
          <Suspense fallback={null}>
            <PageLoader />
          </Suspense>
          {children}
          <QuoteDrawer />
          <AuthModal />
        </Providers>
      </body>
    </html>
  );
}

