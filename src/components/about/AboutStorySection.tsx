import React from "react";
import Image from "next/image";
import type { AboutUsPageData } from "@/types";

interface AboutStorySectionProps {
  data?: AboutUsPageData;
}

const DEFAULT_MOSAIC = [
  {
    id: 1,
    imageUrl: "/images/about/1-cadereyta.jpg",
    alt: "Parroquia histórica de Cadereyta Jiménez, Nuevo León",
    bgColor: "#ffffff",
    isCover: true,
  },
  {
    id: 2,
    imageUrl: "/images/about/2-brand.png",
    alt: "Logotipo institucional de Karmax",
    bgColor: "#7DCFF6",
    isCover: false,
  },
  {
    id: 3,
    imageUrl: "/images/about/3-products.png",
    alt: "Productos y químicos de limpieza Karmax",
    bgColor: "#BADD65",
    isCover: false,
  },
  {
    id: 4,
    imageUrl: "/images/about/4-cleaner.jpg",
    alt: "Especialista en limpieza profesional Karmax",
    bgColor: "#ffffff",
    isCover: true,
  },
  {
    id: 5,
    imageUrl: "/images/about/5-monterrey.jpg",
    alt: "Vista panorámica de Monterrey y Cerro de la Silla",
    bgColor: "#ffffff",
    isCover: true,
  },
  {
    id: 6,
    imageUrl: "/images/about/6-warehouse.jpg",
    alt: "Almacén de distribución y logística Karmax",
    bgColor: "#ffffff",
    isCover: true,
  },
];

export const AboutStorySection: React.FC<AboutStorySectionProps> = ({ data }) => {
  const storyTitle =
    data?.storyTitle || "Calidad que nace en el corazón de Nuevo León";
  const storyParagraph1 =
    data?.storyParagraph1 ||
    "KARMAX es una empresa 100% mexicana con sede en Cadereyta Jiménez. Fabricamos productos de limpieza profesional con materias primas seleccionadas y estrictos controles bajo estándares internacionales de calidad, a precios accesibles, para brindar eficacia y confianza en cada uso.";
  const storyParagraph2 =
    data?.storyParagraph2 ||
    "Atendemos a hogares, empresas e industrias de Nuevo León, con servicio directo y entregas en Monterrey y su área metropolitana. Nuestro compromiso es ofrecer soluciones efectivas, respaldadas por una atención cercana.";

  const missionTitle = data?.missionTitle || "Misión";
  const missionText =
    data?.missionText ||
    "Fabricar y ofrecer productos de limpieza profesional de la más alta calidad, elaborados con materias primas seleccionadas y procesos certificados, a precios competitivos, para ayudar a hogares, empresas e industrias a mantener espacios limpios, seguros y saludables.";

  const visionTitle = data?.visionTitle || "Visión";
  const visionText =
    data?.visionText ||
    "Ser una marca mexicana líder en productos de limpieza profesional, reconocida por su calidad, precios competitivos y excelencia en el servicio. Aspiramos a convertirnos en el proveedor de confianza de miles de hogares y empresas, tanto a nivel local como nacional.";

  const mosaic = data?.mosaicImages?.length
    ? data.mosaicImages.map((img, idx) => ({
        ...DEFAULT_MOSAIC[idx],
        ...img,
      }))
    : DEFAULT_MOSAIC;

  return (
    <section id="quienes-somos" className="w-full bg-white py-14 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Columna Izquierda: Historia, Misión y Visión */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6">
            <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-semibold !text-[var(--dark-blue-karmax)] tracking-tight leading-tight">
              {storyTitle}
            </h2>

            <p className="text-[var(--text-karmax)] text-sm sm:text-[15px] leading-relaxed">
              {storyParagraph1}
            </p>

            <p className="text-[var(--text-karmax)] text-sm sm:text-[15px] leading-relaxed">
              {storyParagraph2}
            </p>

            {/* Misión */}
            <div className="pt-2">
              <h3 className="text-lg sm:text-xl font-bold text-[var(--dark-blue-karmax)] mb-2 tracking-tight">
                {missionTitle}
              </h3>
              <p className="text-[var(--text-karmax)] text-sm sm:text-[15px] leading-relaxed">
                {missionText}
              </p>
            </div>

            {/* Visión */}
            <div className="pt-2">
              <h3 className="text-lg sm:text-xl font-bold text-[var(--dark-blue-karmax)] mb-2 tracking-tight">
                {visionTitle}
              </h3>
              <p className="text-[var(--text-karmax)] text-sm sm:text-[15px] leading-relaxed">
                {visionText}
              </p>
            </div>
          </div>

          {/* Columna Derecha: Mosaico 2x3 */}
          <div className="lg:col-span-6 xl:col-span-6">
            <div className="grid grid-cols-2 gap-0">
              {mosaic.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square overflow-hidden group transition-transform hover:scale-[1.01] transition-all duration-500"
                  style={{ backgroundColor: item.bgColor || "#ffffff" }}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.alt}
                    fill
                    className={
                      item.isCover === false
                        ? "object-contain"
                        : "object-cover"
                    }
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 45vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
