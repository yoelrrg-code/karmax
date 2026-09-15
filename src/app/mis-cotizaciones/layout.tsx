import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis Cotizaciones | KARMAX",
  description: "Revisa y gestiona tu lista de cotización de productos químicos y soluciones de limpieza en KARMAX.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function MisCotizacionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
