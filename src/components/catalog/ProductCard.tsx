"use client";

import React, { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CatalogProductItem } from "@/types";
import { useQuote } from "@/context/QuoteContext";

const emptySubscribe = () => () => {};

interface ProductCardProps {
  product: CatalogProductItem;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { getItemQuantity, addItem } = useQuote();
  const quantity = isMounted ? getItemQuantity(product.id) : 0;

  const hasSalePrice = Boolean(product.salePrice && Number(product.salePrice) > 0);
  const displayPrice = hasSalePrice
    ? `Desde $${product.salePrice}`
    : product.regularPrice
    ? `$${product.regularPrice}`
    : "Cotizar";

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100/90 shadow-2xs hover:shadow-lg transition-all duration-300 p-4 sm:p-5 h-full flex flex-col justify-between items-center text-center">
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
      <Link
        href={`/productos/${product.slug}`}
        className="relative w-full h-44 sm:h-48 mb-3 flex items-center justify-center overflow-hidden cursor-pointer"
      >
        <Image
          src={product.imageUrl || "/images/products/placeholder.jpg"}
          alt={product.name}
          fill
          className="object-contain transition-transform duration-300 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>

      {/* Info: Nombre y Precio */}
      <div className="w-full flex-1 flex flex-col justify-between items-center">
        <Link href={`/productos/${product.slug}`} className="cursor-pointer">
          <h3 className="text-[16px] sm:text-[18px] font-semibold text-[var(--blue-karmax)] group-hover:text-[var(--green-hover-karmax)] transition-colors line-clamp-2 min-h-[44px] mb-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="mb-4">
          <span className="text-[16px] sm:text-[20px] font-semibold text-[var(--green-karmax)]">
            {displayPrice}
          </span>
        </div>

        {/* Botón de acción: "+ Agregar" o Contador "– [cant] +" (Imagen 1) */}
        {quantity === 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addItem(product);
            }}
            className="inline-flex items-center justify-center bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-[14px] sm:text-[16px] font-semibold py-2 px-6 rounded-full transition-all duration-200 shadow-2xs hover:shadow-sm active:scale-95 cursor-pointer w-full max-w-[160px]"
          >
            + Agregar
          </button>
        ) : (
          <div
            className="inline-flex items-center justify-between bg-[var(--green-karmax)] text-white font-bold py-1.5 px-3 rounded-full transition-all duration-200 shadow-2xs w-full max-w-[160px] select-none"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem(product, undefined, -1);
              }}
              className="w-7 h-7 flex items-center justify-center text-white text-xl font-bold hover:bg-black/10 rounded-full transition-colors cursor-pointer active:scale-90"
              aria-label="Disminuir cantidad"
            >
              –
            </button>
            <span className="text-[16px] sm:text-[18px] font-bold px-2 text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem(product, undefined, 1);
              }}
              className="w-7 h-7 flex items-center justify-center text-white text-xl font-bold hover:bg-black/10 rounded-full transition-colors cursor-pointer active:scale-90"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
