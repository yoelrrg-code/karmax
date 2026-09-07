"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { User, ShoppingBag, Menu, X, MessageCircle } from "lucide-react";

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+5215512345678";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo variant="blue" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-700">
            <Link
              href="#productos"
              className="hover:text-[#00509d] transition-colors font-semibold"
            >
              Productos
            </Link>
            <Link
              href="#quienes-somos"
              className="hover:text-[#00509d] transition-colors"
            >
              Quiénes somos
            </Link>
            <Link
              href="#contacto"
              className="hover:text-[#00509d] transition-colors"
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
              className="inline-flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white px-4 py-2.5 rounded-full text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Cotizar por WhatsApp</span>
            </a>

            {/* User Profile */}
            <button
              aria-label="Cuenta de usuario"
              className="p-2 text-slate-600 hover:text-[#00509d] hover:bg-slate-100 rounded-full transition-colors"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Cart / Quote Bag */}
            <Link
              href="#cotizacion"
              aria-label="Bolsa de cotización"
              className="relative p-2 text-slate-600 hover:text-[#00509d] hover:bg-slate-100 rounded-full transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
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
              <ShoppingBag className="w-5 h-5" />
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
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Cotizar por WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
