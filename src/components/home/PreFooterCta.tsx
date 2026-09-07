import React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export const PreFooterCta: React.FC = () => {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+5215512345678";

  return (
    <section className="bg-[#00509d] text-white py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
          Abastece tu empresa de forma fácil y conveniente
        </h2>
        <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Encuentra productos de limpieza e higiene para cada área y solicita una propuesta según tus necesidades.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="#productos"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold px-7 py-3.5 rounded-lg text-sm sm:text-base shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Explorar y cotizar productos
          </Link>

          <a
            href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=Hola,%20quisiera%20cotizar%20productos%20para%20mi%20empresa`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 text-white font-semibold px-7 py-3.5 rounded-lg text-sm sm:text-base border border-white/80 transition-colors"
          >
            <MessageCircle className="w-5 h-5 fill-white/20" />
            <span>Contactar por WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
};
