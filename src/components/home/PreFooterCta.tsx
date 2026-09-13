import React from "react";
import Link from "next/link";

export interface PreFooterCtaProps {
  title?: string;
  description?: string;
  cta?: Array<{
    label: string;
    link: string;
    target?: string;
  }>;
  data?: {
    title?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
    phone?: string;
    phoneClean?: string;
  };
}

const defaultWhatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+529988436581";

export const PreFooterCta: React.FC<PreFooterCtaProps> = ({ 
    title = "Abastece tu empresa de forma fácil y conveniente", 
    description = "Encuentra productos de limpieza e higiene para cada área y solicita una propuesta según tus necesidades.", 
    cta,
    data,
  }) => {
  const displayTitle = data?.title || title;
  const displayDescription = data?.description || description;
  const whatsappNum = data?.phoneClean || data?.phone || defaultWhatsappNumber;

  const defaultCta = [
    {
      label: data?.ctaText || "Explorar y cotizar productos",
      link: data?.ctaLink || "/productos",
      target: "_self",
    },
    {
      label: "Contactanos por WhatsApp",
      link: `https://wa.me/${whatsappNum.replace(/[^0-9]/g, "")}?text=Hola,%20quisiera%20cotizar%20productos%20para%20mi%20empresa`,
      target: "_blank",
    },
  ];

  const actions = cta && cta.length > 0 ? cta : defaultCta;
  return (
    <section id="prefooter">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className={`tracking-tight ${displayDescription ? "mb-4" : "mb-8"}`}>
          {displayTitle}
        </h2>

        {displayDescription && (
          <p className="text-white max-w-3xl mx-auto mb-8 leading-relaxed">
            {displayDescription}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {actions[0] && (
            <Link
              href={actions[0].link}
              target={actions[0].target || "_self"}
              className="btn-primary inline-flex items-center justify-center border border-[var(--green-karmax)] bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] hover:border-[var(--green-hover-karmax)] text-white px-8 py-4 rounded-full text-base shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              {actions[0].label}
            </Link>
          )}

          {actions.length > 1 && (
            <a 
              href={actions[1]?.link}
              target={actions[1]?.target || "_self"}
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center justify-center border border-[var(--white-karmax)] bg-transparent hover:bg-[var(--green-hover-karmax)] hover:border-[var(--green-hover-karmax)] text-white px-8 py-4 rounded-full text-base shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>{actions[1]?.label}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
