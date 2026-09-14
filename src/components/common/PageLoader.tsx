"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { LoadingSpinner } from "./LoadingSpinner";

export const PageLoader: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const currentPathRef = useRef(pathname);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Al cambiar de ruta, ocultar el loader suavemente
  useEffect(() => {
    currentPathRef.current = pathname;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Pequeño retardo para asegurar que la nueva página se pinte sin parpadeos
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 220);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname, searchParams]);

  // Interceptar clics en enlaces internos para activar el loader inmediatamente
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Ignorar si se pulsó con Ctrl, Meta o botón derecho
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");

      // Validar si es enlace interno y no abre en nueva pestaña
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("/#") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("tel:") &&
        target !== "_blank"
      ) {
        try {
          const targetUrl = new URL(href, window.location.origin);
          const currentUrl = new URL(window.location.href);

          // Solo activar si realmente cambia la ruta o query
          const isDifferentPage =
            targetUrl.pathname !== currentUrl.pathname ||
            targetUrl.search !== currentUrl.search;

          if (isDifferentPage) {
            setIsLoading(true);

            // Timeout de seguridad de 5s para evitar que quede atascado si la navegación se cancela
            setTimeout(() => {
              setIsLoading(false);
            }, 5000);
          }
        } catch {
          // Ignorar URLs inválidas
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="page-loader-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-md"
        >
          <LoadingSpinner size={150} showText={true} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
