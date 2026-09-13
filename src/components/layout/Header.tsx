"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { Icon } from "@/components/icons";
import { Menu, X } from "lucide-react";
import { useQuote } from "@/context/QuoteContext";
import { useAuth } from "@/context/AuthContext";

const emptySubscribe = () => () => {};

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+528186590941";

  const [isScrolled, setIsScrolled] = useState(false);
  const { totalItemsCount, openDrawer, notification, dismissNotification } = useQuote();
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const displayCount = isMounted ? totalItemsCount : 0;
  const { user, openAuthModal, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScroll = window.scrollY;
          // Hysteresis: se encoge al bajar de 60px y sólo se expande al regresar cerca del tope (< 15px)
          // para evitar saltos o parpadeos cuando el usuario hace scrolls pequeños.
          setIsScrolled((prev) => {
            if (!prev && currentScroll > 60) return true;
            if (prev && currentScroll < 15) return false;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={`sticky top-0 z-40 bg-white transition-all duration-300 ease-in-out ${isScrolled ? "h-20 shadow-2xs" : "h-30"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[var(--blue-karmax)] ml-auto mr-10">
            <Link
              href="/productos"
              className="hover:text-[var(--green-karmax)] transition-colors"
            >
              Productos
            </Link>
            <Link
              href="#quienes-somos"
              className="hover:text-[var(--green-karmax)] transition-colors"
            >
              Quiénes somos
            </Link>
            <Link
              href="#contacto"
              className="hover:text-[var(--green-karmax)] transition-colors"
            >
              Contacto
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center space-x-4">
            {/* WhatsApp Quote Button */}
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=Hola,%20quisiera%20solicitar%20una%20cotización%20para%20mi%20empresa`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white px-5 py-2 rounded-full text-[16px] font-medium shadow-xs hover:shadow-md transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <Icon
                name="whatsapp"
                size={24}
                className="transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-12"
              />
              <span className="transition-transform duration-300">WhatsApp</span>
            </a>

            {/* User Profile */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    openAuthModal();
                  } else {
                    setIsUserMenuOpen((prev) => !prev);
                  }
                }}
                aria-label={user ? `Usuario: ${user.name}` : "Iniciar sesión"}
                title={user ? `Conectado como ${user.name}` : "Iniciar sesión"}
                className={`group flex items-center justify-center p-2 h-10 w-10 rounded-full transition-all duration-300 active:scale-95 shadow-xs hover:shadow-md cursor-pointer ${
                  user
                    ? "bg-[var(--green-karmax)] text-white"
                    : "text-[var(--green-karmax)] hover:text-[var(--white-karmax)] bg-[var(--light-bg-karmax)] hover:bg-[var(--green-hover-karmax)]"
                }`}
              >
                <Icon
                  name="user"
                  size={18}
                  className="transition-transform duration-300 ease-out group-hover:scale-110"
                />
              </button>

              {/* User dropdown if logged in */}
              {user && isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/mis-cotizaciones"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors font-medium border-b border-slate-100"
                  >
                    <span>📋 Mis cotizaciones</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>

            {/* Cart / Quote Bag & Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={openDrawer}
                aria-label="Abrir cotizador"
                className={`group flex items-center justify-center p-2 h-10 w-10 rounded-full transition-all duration-300 active:scale-95 shadow-xs hover:shadow-md relative cursor-pointer ${
                  displayCount > 0
                    ? "bg-[var(--light-bg-karmax)] text-[#FF6816]"
                    : "text-[var(--green-karmax)] hover:text-[var(--white-karmax)] bg-[var(--light-bg-karmax)] hover:bg-[var(--green-hover-karmax)]"
                }`}
              >
                <Icon
                  name="cotiza"
                  size={18}
                  className={`transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-0.5 ${
                    displayCount > 0 ? "text-[#FF6816]" : ""
                  }`}
                />
                {displayCount > 0 ? (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#FF6816] text-white text-[11px] font-bold px-2 py-0.5 min-w-[24px] h-[18px] rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs leading-none">
                    {displayCount}
                  </span>
                ) : (
                  <span className="absolute top-1 right-1 bg-[#22c55e] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs">
                    0
                  </span>
                )}
              </button>

              {/* Orange Popover Notification (Image 2) */}
              {notification.visible && (
                <div
                  className="absolute right-0 top-full mt-4 z-50 whitespace-nowrap bg-[#FF6816] text-white text-xs sm:text-[13px] font-medium py-2.5 px-4 rounded-2xl shadow-xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
                  role="status"
                >
                  {/* Arrow pointing up */}
                  <div
                    className="absolute -top-1 right-3.5 w-3 h-3 bg-[#FF6816] rotate-45 rounded-xs"
                    aria-hidden="true"
                  />
                  <span className="font-bold">✓</span>
                  <span>
                    {notification.type === "added"
                      ? "Producto agregado"
                      : "Producto eliminado"}
                  </span>
                  <span className="opacity-75">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      dismissNotification();
                      openDrawer();
                    }}
                    className="underline underline-offset-2 hover:opacity-90 font-semibold cursor-pointer"
                  >
                    Ver cotización
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center space-x-2">
            <button
              type="button"
              onClick={openDrawer}
              className={`group relative p-2 rounded-full transition-transform active:scale-95 cursor-pointer ${
                displayCount > 0 ? "bg-[#EFF3F6] text-[#FF6816]" : "text-slate-700"
              }`}
              aria-label="Abrir cotizador"
            >
              <Icon
                name="cotiza"
                size={22}
                className={`transition-transform duration-300 ease-out group-hover:scale-110 ${
                  displayCount > 0 ? "text-[#FF6816]" : ""
                }`}
              />
              {displayCount > 0 ? (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#FF6816] text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[20px] h-[16px] rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 leading-none">
                  {displayCount}
                </span>
              ) : (
                <span className="absolute top-1 right-1 bg-[#22c55e] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  0
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors duration-200 active:scale-95 cursor-pointer"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 transition-transform duration-300 rotate-0 hover:rotate-90" />
              ) : (
                <Menu className="w-6 h-6 transition-transform duration-300 hover:scale-110" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <Link
            href="/productos"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-[var(--green-karmax)] transition-colors"
          >
            Productos
          </Link>
          <Link
            href="#quienes-somos"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-[var(--green-karmax)] transition-colors"
          >
            Quiénes somos
          </Link>
          <Link
            href="#contacto"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-[var(--green-karmax)] transition-colors"
          >
            Contacto
          </Link>
          {user && (
            <Link
              href="/mis-cotizaciones"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-[var(--blue-karmax)] hover:text-[var(--green-karmax)] transition-colors border-t border-slate-100 pt-3"
            >
              📋 Mis cotizaciones
            </Link>
          )}
          <div className="pt-2">
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 w-full bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white py-3 rounded-full font-bold shadow-xs transition-all duration-300 active:scale-95"
            >
              <Icon
                name="whatsapp"
                size={24}
                className="transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-12"
              />
              <span>Cotizar por WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
