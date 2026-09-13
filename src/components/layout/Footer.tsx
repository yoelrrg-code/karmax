import React from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { Icon } from "@/components/icons";

export interface FooterSocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  whatsapp?: string;
  youtube?: string;
}

export interface FooterProps {
  data?: {
    description?: string;
    phone?: string;
    email?: string;
    schedule?: string;
    address?: string;
    facebookUrl?: string;
    instagramUrl?: string;
  };
  socialLinks?: FooterSocialLinks;
}

export const Footer: React.FC<FooterProps> = ({ data, socialLinks }) => {
  const description =
    data?.description ||
    "Materia prima de la mejor calidad a precios incomparables.";
  const address =
    data?.address ||
    "Calle Zaragoza PTE. #313, Col. Centro\nCadereyta Jimenez Nuevo León, CP 67480";
  const phone = data?.phone || "+52 81 8659 0941";
  const phoneClean = phone.replace(/[^0-9+]/g, "");
  const email = data?.email || "contacto@karmax.mx";
  const facebookUrl = socialLinks?.facebook ?? data?.facebookUrl ?? "https://facebook.com";
  const instagramUrl = socialLinks?.instagram ?? data?.instagramUrl ?? "https://instagram.com";
  const tiktokUrl = socialLinks?.tiktok ?? "https://tiktok.com";
  const linkedinUrl = socialLinks?.linkedin ?? "https://linkedin.com";
  const whatsappUrl = socialLinks?.whatsapp ?? "";
  const youtubeUrl = socialLinks?.youtube ?? "";

  return (
    <footer id="contacto" className="bg-[var(--light-bg-karmax)] text-[var(--light-text-karmax)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-8 items-start pb-12">
          {/* 1. Brand & Value Proposition */}
          <div className="md:col-span-5 lg:col-span-4 space-y-5">
            <Logo size={{ w: 118, h: 20 }} />
            <p className="text-[15px] sm:text-[16px] text-[var(--light-text-karmax)] leading-relaxed max-w-xs whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* 2. Navigation Links */}
          <div className="md:col-span-3 lg:col-span-3 md:justify-self-center">
            <nav className="flex flex-col space-y-5">
              <Link
                href="/"
                className="text-[16px] font-medium text-[var(--blue-karmax)] hover:text-[var(--green-karmax)] transition-colors w-fit"
              >
                Home
              </Link>
              <Link
                href="#categories"
                className="text-[16px] font-medium text-[var(--blue-karmax)] hover:text-[var(--green-karmax)] transition-colors w-fit"
              >
                Productos
              </Link>
              <Link
                href="#quienes-somos"
                className="text-[16px] font-medium text-[var(--blue-karmax)] hover:text-[var(--green-karmax)] transition-colors w-fit"
              >
                Quiénes Somos
              </Link>
              <Link
                href="#contacto"
                className="text-[16px] font-medium text-[var(--blue-karmax)] hover:text-[var(--green-karmax)] transition-colors w-fit"
              >
                Contacto
              </Link>
            </nav>
          </div>

          {/* 3. Contact Details & Social Networks */}
          <div className="md:col-span-4 lg:col-span-5 flex flex-col space-y-4 lg:pl-10">
            {/* Address */}
            <div className="flex items-start gap-3 text-[var(--text-karmax)] text-[15px] leading-snug">
              <Icon
                name="map-pin"
                size={22}
                className="text-[var(--green-karmax)] flex-shrink-0 mt-0.5"
              />
              <div className="whitespace-pre-line">
                <p>{address}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 text-[var(--text-karmax)] text-[15px]">
              <Icon
                name="phone"
                size={22}
                className="text-[var(--green-karmax)] flex-shrink-0"
              />
              <a
                href={`tel:${phoneClean}`}
                className="hover:text-[var(--green-karmax)] transition-colors"
              >
                {phone}
              </a>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 text-[var(--text-karmax)] text-[15px]">
              <Icon
                name="mail"
                size={22}
                className="text-[var(--green-karmax)] flex-shrink-0"
              />
              <a
                href={`mailto:${email}`}
                className="hover:text-[var(--green-karmax)] transition-colors"
              >
                {email}
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="opacity-85 hover:opacity-100 hover:scale-105 transition-all"
                >
                  <Icon name="facebook" size={32} />
                </a>
              )}
              {tiktokUrl && (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="opacity-85 hover:opacity-100 hover:scale-105 transition-all"
                >
                  <Icon name="tiktok" size={32} />
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="opacity-85 hover:opacity-100 hover:scale-105 transition-all"
                >
                  <Icon name="linkedin" size={32} />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="opacity-85 hover:opacity-100 hover:scale-105 transition-all"
                >
                  <Icon name="instagram" size={32} />
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="opacity-85 hover:opacity-100 hover:scale-105 transition-all"
                >
                  <Icon name="youtube" size={32} />
                </a>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="opacity-85 hover:opacity-100 hover:scale-105 transition-all"
                >
                  <Icon name="whatsapp" size={32} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Legal bar */}
        <div className="border-t border-[#3a424c33] border-opacity-20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="copy text-[var(--light-text-karmax)]">© {new Date().getFullYear()} KARMAX. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2">
            <Link
              href="#privacidad"
              className="text-[14px] sm:text-[14px] text-[var(--light-text-karmax)] hover:text-[var(--green-hover-karmax)] transition-colors"
            >
              Política de privacidad
            </Link>
            <span className="text-slate-400">|</span>
            <Link
              href="#terminos"
              className="text-[14px] sm:text-[14px] text-[var(--light-text-karmax)] hover:text-[var(--green-hover-karmax)] transition-colors"
            >
              Términos y condiciones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

