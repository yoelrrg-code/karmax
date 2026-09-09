import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { CatalogProductItem } from "@/types";

interface ProductCardProps {
  product: CatalogProductItem;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const hasSalePrice = Boolean(product.salePrice && Number(product.salePrice) > 0);
  const displayPrice = hasSalePrice
    ? `Desde $${product.salePrice}`
    : product.regularPrice
    ? `$${product.regularPrice}`
    : "Cotizar";

  const buttonText = hasSalePrice ? "Ver opciones" : "+ Agregar";

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100/90 shadow-2xs hover:shadow-lg transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between items-center text-center">
      {/* Badge Oferta si tiene sale_price */}
      {hasSalePrice && (
        <span className="absolute top-3 left-3 z-10 text-[12px] font-bold text-white bg-[#FF6816] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-2">
          <Image
            src={"/icons/arrow-down.svg"}
            alt="arrow down"
            width={8}
            height={11}
          />
          Oferta
        </span>
      )}

      {/* Imagen del producto */}
      <div className="relative w-full h-44 sm:h-48 mb-3 flex items-center justify-center overflow-hidden">
        <Image
          src={product.imageUrl || "/images/products/placeholder.png"}
          alt={product.name}
          fill
          className="object-contain transition-transform duration-300 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Info: Nombre y Precio */}
      <div className="w-full flex-1 flex flex-col justify-between items-center">
        <h3 className="text-[16px] sm:text-[18px] font-semibold text-[var(--blue-karmax)] group-hover:text-[var(--green-hover-karmax)] transition-colors line-clamp-2 min-h-[44px] mb-2 leading-snug">
          {product.name}
        </h3>

        <div className="mb-4">
          <span className="text-[16px] sm:text-[20px] font-semibold text-[var(--green-karmax)]">
            {displayPrice}
          </span>
        </div>

        {/* Botón de acción */}
        <Link
          href={`#cotizar-${product.slug}`}
          className="inline-flex items-center justify-center bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-[14px] sm:text-[16px] font-semibold py-2 px-6 rounded-full transition-all duration-200 shadow-2xs hover:shadow-sm active:scale-95 cursor-pointer w-full max-w-[160px]"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
};
