import React from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer id="contacto" className="bg-white border-t border-slate-200 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <Logo variant="blue" />
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs">
              Venta de productos de limpieza de calidad a precio justo para empresas e industrias.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-4 tracking-tight">Navegación</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/" className="hover:text-[#00509d] transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="#productos" className="hover:text-[#00509d] transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="#quienes-somos" className="hover:text-[#00509d] transition-colors">
                  Quiénes somos
                </Link>
              </li>
              <li>
                <Link href="#contacto" className="hover:text-[#00509d] transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm mb-4 tracking-tight">Contacto</h4>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-[#22c55e] flex-shrink-0 mt-0.5" />
              <span>Calle Zaragoza 118, 77500 Col. Centro, Cancún, Quintana Roo, México</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600">
              <Phone className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
              <a href="tel:+529988436581" className="hover:text-[#00509d] transition-colors">
                +52 998 843 6581
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600">
              <Mail className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
              <a href="mailto:contacto@karmax.mx" className="hover:text-[#00509d] transition-colors">
                contacto@karmax.mx
              </a>
            </div>
          </div>

          {/* Social Links & Community */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-4 tracking-tight">Síguenos</h4>
            <p className="text-xs text-slate-500 mb-4">
              Mantente al día con ofertas por mayoreo y nuevos lanzamientos institucionales.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-[#22c55e]/10 text-[#16a34a] hover:bg-[#22c55e] hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
              >
                f
              </a>
              <a
                href="https://wa.me/5215512345678"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full bg-[#22c55e]/10 text-[#16a34a] hover:bg-[#22c55e] hover:text-white flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-[#22c55e]/10 text-[#16a34a] hover:bg-[#22c55e] hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
              >
                in
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-[#22c55e]/10 text-[#16a34a] hover:bg-[#22c55e] hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
              >
                ig
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal bar */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Karmax. Todos los derechos reservados.</p>
          <div className="flex space-x-6">
            <Link href="#privacidad" className="hover:text-slate-600 transition-colors">
              Política de privacidad
            </Link>
            <Link href="#terminos" className="hover:text-slate-600 transition-colors">
              Términos y condiciones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
