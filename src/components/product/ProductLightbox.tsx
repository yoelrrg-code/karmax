"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface ProductLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  productName: string;
}

export const ProductLightbox: React.FC<ProductLightboxProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
  productName,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const prevImage = useCallback(() => {
    setIsZoomed(false);
    onIndexChange((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onIndexChange]);

  const nextImage = useCallback(() => {
    setIsZoomed(false);
    onIndexChange((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onIndexChange]);

  // Manejo de atajos de teclado y bloqueo del scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, prevImage, nextImage]);

  // Reset zoom al cerrar
  useEffect(() => {
    if (!isOpen) {
      setIsZoomed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentImage = images[currentIndex] || "/images/products/placeholder.jpg";

  return (
    <AnimatePresence>
      <motion.div
        key="lightbox-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex flex-col justify-between bg-black/92 backdrop-blur-md select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Barra Superior: Título, contador y botones de acción */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3 max-w-[70%]">
            <span className="text-xs sm:text-sm font-semibold text-white/70 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xs">
              {currentIndex + 1} / {images.length}
            </span>
            <span className="text-sm sm:text-base font-medium text-white truncate drop-shadow-xs">
              {productName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsZoomed((prev) => !prev)}
              aria-label={isZoomed ? "Reducir zoom" : "Ampliar zoom"}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              title={isZoomed ? "Reducir (click en imagen)" : "Ampliar (click en imagen)"}
            >
              {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar vista ampliada"
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Zona Central: Imagen activa con controles previo / siguiente */}
        <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
          {/* Botón Anterior */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              aria-label="Imagen anterior"
              className="absolute left-3 sm:left-6 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white/90 hover:text-white border border-white/20 transition-all cursor-pointer shadow-lg backdrop-blur-xs hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          )}

          {/* Contenedor de la Imagen */}
          <div
            className={`relative w-full h-full max-w-5xl max-h-[75vh] flex items-center justify-center transition-transform duration-300 ${
              isZoomed ? "cursor-zoom-out scale-150" : "cursor-zoom-in scale-100"
            }`}
            onClick={() => setIsZoomed((prev) => !prev)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="relative w-full h-full"
              >
                <Image
                  src={currentImage}
                  alt={`${productName} - vista ampliada ${currentIndex + 1}`}
                  fill
                  priority
                  className="object-contain"
                  sizes="100vw"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Botón Siguiente */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Imagen siguiente"
              className="absolute right-3 sm:right-6 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white/90 hover:text-white border border-white/20 transition-all cursor-pointer shadow-lg backdrop-blur-xs hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          )}
        </div>

        {/* Tira inferior de miniaturas */}
        {images.length > 1 && (
          <div className="z-10 py-3 sm:py-4 px-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full px-2 py-1 scrollbar-none">
              {images.map((imgUrl, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsZoomed(false);
                      onIndexChange(idx);
                    }}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-white/10 overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                      isActive
                        ? "border-[var(--green-karmax)] scale-105 shadow-md shadow-[var(--green-karmax)]/30"
                        : "border-white/20 opacity-60 hover:opacity-100 hover:border-white/50"
                    }`}
                    aria-label={`Ir a imagen ${idx + 1}`}
                  >
                    <Image
                      src={imgUrl}
                      alt={`Miniatura ${idx + 1}`}
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
