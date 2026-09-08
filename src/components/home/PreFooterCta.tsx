import React from "react";
import Link from "next/link";

export const PreFooterCta: React.FC = () => {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+529988436581";

  return (
    <section id="prefooter">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="tracking-tight mb-4">
          Abastece tu empresa de forma fácil y conveniente
        </h2>
        <p className="text-white max-w-3xl mx-auto mb-8 leading-relaxed">
          Encuentra productos de limpieza e higiene para cada área y solicita una propuesta según tus necesidades.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="#categories"
            className="btn-primary inline-flex items-center justify-center bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white px-8 py-4 rounded-full text-base shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            Explorar y cotizar productos
          </Link>

          <a
            href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=Hola,%20quisiera%20cotizar%20productos%20para%20mi%20empresa`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center justify-center bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white px-8 py-4 rounded-full text-base shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Contactar por WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
};
