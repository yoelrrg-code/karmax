"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { Icon } from "@/components/icons";
import { Menu, X } from "lucide-react";

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+5215512345678";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-30">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo/>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[var(--blue-karmax)]">
            <Link
              href="#productos"
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
              className="inline-flex items-center gap-2 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white px-4 py-2.5 rounded-full text-[16px] font-bold shadow-xs hover:shadow-md transition-all active:scale-95"
            >
              <Icon name="whatsapp" size={24} />
              <span>WhatsApp</span>
            </a>

            {/* User Profile */}
            <button
              aria-label="Cuenta de usuario"
              className="flex items-center justify-center p-2 h-10 w-10 text-[var(--green-karmax)] hover:text-[var(--white-karmax)] bg-[var(--light-bg-karmax)] hover:bg-[var(--green-karmax)] rounded-full transition-all"
            >
              <Icon name="user" size={18} />
            </button>

            {/* Cart / Quote Bag */}
            <Link
              href="#cotizacion"
              aria-label="Bolsa de cotización"
              className="flex items-center justify-center p-2 h-10 w-10 text-[var(--green-karmax)] hover:text-[var(--white-karmax)] bg-[var(--light-bg-karmax)] hover:bg-[var(--green-karmax)] rounded-full transition-all relative"
            >
              <Icon name="cotiza" size={18} />
              <span className="absolute top-1 right-1 bg-[#22c55e] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center space-x-2">
            <Link
              href="#cotizacion"
              className="relative p-2 text-slate-700"
              aria-label="Carrito"
            >
              <Icon name="cotiza" size={24} />
              <span className="absolute top-1 right-1 bg-[#22c55e] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <Link
            href="#productos"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-[#00509d]"
          >
            Productos
          </Link>
          <Link
            href="#quienes-somos"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-[#00509d]"
          >
            Quiénes somos
          </Link>
          <Link
            href="#contacto"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-[#00509d]"
          >
            Contacto
          </Link>
          <div className="pt-2">
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#22c55e] hover:bg-[#16a34a] text-white py-3 rounded-full font-bold shadow-xs"
            >
              <Icon name="whatsapp" size={24} />
              <span>Cotizar por WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
