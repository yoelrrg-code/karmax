"use client";

import React, { useState, useRef, useMemo, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CatalogHeroBar } from "@/components/catalog/CatalogHeroBar";
import { ProductCard } from "@/components/catalog/ProductCard";
import { useQuote } from "@/context/QuoteContext";
import type { ProductDetailItem, CatalogProductItem } from "@/types";

const emptySubscribe = () => () => {};

interface ProductDetailViewProps {
  product: ProductDetailItem;
  relatedProducts: CatalogProductItem[];
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  relatedProducts,
}) => {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const sliderRef = useRef<HTMLDivElement>(null);
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { addItem, getItemQuantity, items } = useQuote();

  // Imágenes de la galería (mínimo la principal, más fallbacks dummy si es única)
  const defaultGallery =
    product.galleryImages && product.galleryImages.length > 0
      ? product.galleryImages
      : [product.imageUrl || "/images/products/placeholder.jpg"];

  // Si solo tiene 1 imagen, agregamos miniaturas con el mismo producto para simular la galería del mockup
  const gallery =
    defaultGallery.length === 1
      ? [
          defaultGallery[0],
          defaultGallery[0],
          defaultGallery[0],
          defaultGallery[0],
        ]
      : defaultGallery;

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Atributos (si no tiene en BD, datos dummy de referencia según mockup)
  const availableAttributes = useMemo(() => {
    return Object.keys(product.attributes).length > 0
      ? product.attributes
      : {};
  }, [product.attributes]);

  // Selección manual de atributos por parte del usuario
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  // Buscar si este producto ya está en el cotizador
  const itemInQuote = isMounted
    ? items.find((it) => Number(it.productId) === Number(product.id))
    : undefined;

  // Nombre del atributo de presentación (o primer atributo disponible)
  const presentationAttrName = useMemo(() => {
    if (availableAttributes["Presentaciones"]) return "Presentaciones";
    if (availableAttributes["Presentación"]) return "Presentación";
    return Object.keys(availableAttributes)[0] || "Presentaciones";
  }, [availableAttributes]);

  // Determinar la presentación efectiva seleccionada (respeta la que está en cotizador si no se ha cambiado manualmente)
  const selectedPresentation = useMemo(() => {
    if (selectedAttributes[presentationAttrName]) {
      return selectedAttributes[presentationAttrName];
    }
    if (
      itemInQuote?.presentation &&
      (availableAttributes[presentationAttrName]?.includes(itemInQuote.presentation) ||
        Object.keys(availableAttributes).length === 0)
    ) {
      return itemInQuote.presentation;
    }
    return availableAttributes[presentationAttrName]?.[0] || "Estándar";
  }, [selectedAttributes, itemInQuote, availableAttributes, presentationAttrName]);

  const presentationQty = isMounted
    ? getItemQuantity(product.id, selectedPresentation)
    : 0;

  const totalProductQty = isMounted
    ? getItemQuantity(product.id)
    : 0;

  const quantity =
    presentationQty > 0
      ? presentationQty
      : selectedAttributes[presentationAttrName]
      ? 0
      : totalProductQty;

  const activePresentation = selectedPresentation;

  // Buscar si el atributo seleccionado actual tiene un precio diferenciado (attr_price)
  const activePriceNumber = useMemo(() => {
    if (!product.rawAttributes || product.rawAttributes.length === 0) return null;

    // Prioridad 1: Presentación seleccionada
    const presentationAttr = product.rawAttributes.find(
      (attr) =>
        attr.name === presentationAttrName &&
        attr.value === selectedPresentation &&
        attr.attrPrice !== null &&
        attr.attrPrice !== undefined &&
        Number(attr.attrPrice) > 0
    );
    if (presentationAttr) {
      return Number(presentationAttr.attrPrice);
    }

    // Prioridad 2: Cualquier otro atributo seleccionado que defina un attrPrice
    for (const [attrName, val] of Object.entries(selectedAttributes)) {
      const matched = product.rawAttributes.find(
        (attr) =>
          attr.name === attrName &&
          attr.value === val &&
          attr.attrPrice !== null &&
          attr.attrPrice !== undefined &&
          Number(attr.attrPrice) > 0
      );
      if (matched) {
        return Number(matched.attrPrice);
      }
    }

    // Prioridad 3: Búsqueda por valor si el nombre del atributo difiere
    const fallbackAttr = product.rawAttributes.find(
      (attr) =>
        attr.value === selectedPresentation &&
        attr.attrPrice !== null &&
        attr.attrPrice !== undefined &&
        Number(attr.attrPrice) > 0
    );
    if (fallbackAttr) {
      return Number(fallbackAttr.attrPrice);
    }

    return null;
  }, [product.rawAttributes, presentationAttrName, selectedPresentation, selectedAttributes]);

  const displayPrice = useMemo(() => {
    if (activePriceNumber !== null) {
      return `$${activePriceNumber.toLocaleString("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    if (product.salePrice && Number(product.salePrice) > 0) {
      return `Desde $${product.salePrice}`;
    }
    if (product.regularPrice) {
      return `$${product.regularPrice}`;
    }
    return "Cotizar";
  }, [activePriceNumber, product.salePrice, product.regularPrice]);

  // Documentos PDF (si no tiene en BD, datos dummy según mockup)
  const documents =
    product.documents && product.documents.length > 0
      ? product.documents
      : [
          {
            id: 1,
            productId: product.id,
            title: "Ficha Técnica",
            fileUrl: "#ficha-tecnica",
            fileType: "pdf",
            fileSize: "PDF",
          },
          {
            id: 2,
            productId: product.id,
            title: "Hoja de seguridad / SDS",
            fileUrl: "#hoja-de-seguridad",
            fileType: "pdf",
            fileSize: "PDF",
          },
        ];

  const handleSearchSubmit = (term: string) => {
    if (term.trim()) {
      router.push(`/productos?search=${encodeURIComponent(term.trim())}`);
    } else {
      router.push(`/productos`);
    }
  };

  const handleSelectAttribute = (attrName: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attrName]: value,
    }));
  };

  // Slider de productos relacionados
  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.8;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };



  const formattedTitle = product.name
    ? product.name.charAt(0).toUpperCase() + product.name.slice(1).toLowerCase()
    : "";

  return (
    <div id="product-details" className="w-full bg-[var(--white-karmax)]">
      {/* 1. Barra azul superior con buscador */}
      <CatalogHeroBar
        search={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        {/* 2. Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs sm:text-[16px] text-[var(--blue-karmax)] mb-10 flex-wrap"
        >
          <Link
            href="/productos"
            className="underline underline-offset-2 hover:text-[var(--green-hover-karmax)] transition-colors font-medium"
          >
            Productos
          </Link>
          <span className="text-[var(--blue-karmax)] text-[22px]">›</span>
          <Link
            href={`/productos?category=${product.categorySlug || "limpieza-general"}`}
            className="underline underline-offset-2 hover:text-[var(--green-hover-karmax)] transition-colors font-medium"
          >
            {product.categoryName || "Limpieza general"}
          </Link>
          <span className="text-[var(--blue-karmax)] text-[22px]">›</span>
          <span className="text-[var(--text-karmax)] font-medium truncate max-w-xs sm:max-w-md">
            {formattedTitle}
          </span>
        </nav>

        {/* 3. Contenedor de Detalle de Producto (2 Columnas) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
          {/* Columna Izquierda: Galería de imágenes (5 cols en lg) */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* Imagen Principal */}
            <div className="w-full aspect-square relative bg-white rounded-2xl border border-[var(--green-karmax)] shadow-2xs p-8 flex items-center justify-center overflow-hidden">
              <Image
                src={gallery[activeImageIndex] || "/images/products/placeholder.jpg"}
                alt={product.name}
                fill
                priority
                loading="eager"
                className="object-contain p-4 transition-all duration-300"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>

            {/* Miniaturas de la galería */}
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-4 mt-3 w-full">
                {gallery.map((imgUrl, idx) => {
                  const isActive = idx === activeImageIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-square w-full rounded-xl bg-white p-2 border transition-all cursor-pointer flex items-center justify-center ${
                        isActive
                          ? "border-1 border-[var(--green-karmax)] shadow-xs"
                          : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                      }`}
                      aria-label={`Ver imagen ${idx + 1}`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`${product.name} miniatura ${idx + 1}`}
                        fill
                        className="object-contain p-1.5"
                        sizes="(max-width: 1024px) 25vw, 120px"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Columna Derecha: Datos y compra (7 cols en lg) */}
          <div className="lg:col-span-6 flex flex-col">
            {/* Meta: Marca y SKU */}
            <p className="text-[14px] font-normal text-[var(--light-text-karmax)] tracking-wide mb-5">
              Marca: <span className="uppercase">{product.brand || "KARMAX"}</span> | SKU:{" "}
              <span className="uppercase">{product.sku}</span>
            </p>

            {/* Título */}
            <h2 className="text-[var(--text-karmax)] mb-4 leading-tight">
              {formattedTitle}
            </h2>

            {/* Precio */}
            <div className="mb-5">
              <span className="text-[32px] font-semibold text-[var(--green-karmax)]">
                {displayPrice}
              </span>
            </div>

            {/* Atributos dinámicos seleccionables */}
            {Object.entries(availableAttributes).map(([attrName, values]) => (
              <div key={attrName} className="mb-5">
                <label className="block text-[18px] font-semibold text-[var(--text-karmax)] mb-4">
                  {attrName}
                </label>
                <div className="flex flex-wrap gap-2">
                  {values.map((val) => {
                    const isSelected =
                      (attrName === presentationAttrName
                        ? selectedPresentation === val
                        : (selectedAttributes[attrName] || values[0]) === val);
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSelectAttribute(attrName, val)}
                        className={`px-4 py-3 rounded-lg text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? "border-[var(--green-hover-karmax)] bg-[var(--green-hover-karmax)] text-[var(--white-karmax)] font-semibold"
                            : "border-[var(--blue-karmax)] bg-white text-[var(--blue-karmax)] hover:border-[var(--green-hover-karmax)] hover:text-[var(--green-hover-karmax)]"
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Botón de Agregar a Cotización o Selector de Cantidad (– [cant] +) */}
            <div className="my-3 mb-6">
              {quantity === 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    addItem(
                      product,
                      activePresentation,
                      1,
                      activePriceNumber !== null ? activePriceNumber : undefined
                    );
                  }}
                  className="btn-primary gap-2 inline-flex items-center justify-center border border-[var(--green-karmax)] bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] hover:border-[var(--green-hover-karmax)] text-white px-8 py-3.5 rounded-full text-base shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Agregar a cotización
                </button>
              ) : (
                <div
                  className="inline-flex items-center justify-between bg-[var(--green-karmax)] text-white font-bold py-2.5 px-6 rounded-full transition-all duration-200 shadow-xs w-full max-w-[240px] select-none"
                >
                  <button
                    type="button"
                    onClick={() =>
                      addItem(
                        product,
                        activePresentation,
                        -1,
                        activePriceNumber !== null ? activePriceNumber : undefined
                      )
                    }
                    className="w-5 h-5 flex items-center justify-center text-white text-2xl font-semibold hover:bg-black/10 rounded-full transition-colors cursor-pointer active:scale-90"
                    aria-label="Disminuir cantidad"
                  >
                    –
                  </button>
                  <span className="text-lg font-semibold px-4 text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      addItem(
                        product,
                        activePresentation,
                        1,
                        activePriceNumber !== null ? activePriceNumber : undefined
                      )
                    }
                    className="w-5 h-5 flex items-center justify-center text-white text-2xl font-semibold hover:bg-black/10 rounded-full transition-colors cursor-pointer active:scale-90"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* Descripción del producto */}
            <div id="product-description" className="text-[var(--text-karmax)] leading-relaxed space-y-4 mb-10 pt-6">
              {product.description ? (
                <div
                  dangerouslySetInnerHTML={{ __html: product.description }}
                  className="prose prose-lg max-w-none prose-slate"
                />
              ) : product.shortDescription ? (
                <p>{product.shortDescription}</p>
              ) : (
                <p>El Abrillantador Exterior tipo Armor All está diseñado para restaurar, proteger y dar brillo a las superficies exteriores del vehículo, dejando un acabado limpio, brillante y renovado.</p>
              )}
            </div>

            {/* Caja de Información de Entrega */}
            <div id="delivery-info" className="bg-[var(--light-green-karmax)] rounded-2xl p-6 mb-12">
              {product.deliveryInfo ? (
                <div
                  dangerouslySetInnerHTML={{ __html: product.deliveryInfo }}
                  className="prose prose-lg max-w-none prose-slate"
                />
              ) : (
                <>
                  <p className="text-[18px] text-[var(--text-karmax)] mb-3 flex items-center gap-2">
                    <strong>Información de entrega</strong>
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span>Entrega estimada: 3-5 días hábiles.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>Cobertura: Monterrey y área metropolitana.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>Envíos fuera del área: sujetos a cotización.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>Pedido mínimo: MXN $500 (Sujeto a cambios).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>Producto sujeto a disponibilidad.</span>
                    </li>
                  </ul>
                </>
              )}
            </div>

            {/* Documentos asociados (Ficha técnica y Hoja de seguridad) */}
            <div className="flex flex-wrap sm:flex-nowrap gap-6 mb-6">
              {documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-[#D6DADD] hover:border-[var(--green-hover-karmax)] rounded-2xl pt-3 pb-4.5 pl-4 pr-5 flex items-center gap-3 transition-all duration-200 shadow-2xs group cursor-pointer"
                >
                  <Image
                    src="/icons/pdf.svg"
                    alt="PDF"
                    width={30}
                    height={32}
                    style={{ width: "auto", height: "auto" }}
                    className="mt-2"
                  />
                  <div className="flex flex-col gap-2 justify-between align-center">
                    <p className="text-[14px] leading-0 font-medium text-[var(--blue-karmax)] group-hover:text-[var(--green-hover-karmax)] truncate transition-colors">
                      {doc.title}
                    </p>
                    <span className="text-[14px] leading-0 text-[#9AA1AA] uppercase font-normal">
                      {doc.fileSize || "PDF"}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* 4. Sección: Productos Relacionados */}
      {relatedProducts.length > 0 && (
        <div className="w-full bg-[var(--light-bg-karmax)]">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--dark-blue-karmax)]">
                Productos relacionados
              </h3>

              {/* Botones de navegación del slider */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollSlider("left")}
                  aria-label="Productos anteriores"
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[var(--green-karmax)] shadow-2xs hover:shadow-xs border border-slate-100 hover:border-slate-200 transition-all cursor-pointer"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => scrollSlider("right")}
                  aria-label="Productos siguientes"
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[var(--green-karmax)] shadow-2xs hover:shadow-xs border border-slate-100 hover:border-slate-200 transition-all cursor-pointer"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenedor deslizante de productos */}
            <div
              ref={sliderRef}
              className="flex items-stretch gap-5 overflow-x-auto pb-4 scroll-smooth scrollbar-none"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {relatedProducts.map((relProduct) => (
                <div
                  key={relProduct.id}
                  className="flex-shrink-0 w-64 sm:w-72"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <ProductCard product={relProduct} />
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
