import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="es" className={`${inter.variable} h-full scroll-smooth antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}
