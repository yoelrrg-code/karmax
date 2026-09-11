import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/context/Providers";
import { QuoteDrawer } from "@/components/quote/QuoteDrawer";
import { AuthModal } from "@/components/auth/AuthModal";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KARMAX | Todo lo que tu empresa necesita para limpieza e higiene",
  description:
    "Venta y cotización de productos de limpieza industrial, higiene institucional, jarcería y químicos por mayoreo para empresas.",
  keywords: [
    "KARMAX",
    "productos de limpieza por mayoreo",
    "limpieza industrial",
    "jarcería",
    "artículos de higiene para empresas",
    "químicos de limpieza",
    "insumos para hoteles y restaurantes",
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
          {children}
          <QuoteDrawer />
          <AuthModal />
        </Providers>
      </body>
    </html>
  );
}

