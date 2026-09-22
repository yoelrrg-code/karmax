"use client";

import React, { useState, useRef } from "react";
import {
  Phone,
  Mail,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { WhatsappIcon } from "@/components/icons";
import { InvisibleCaptcha, InvisibleCaptchaRef } from "@/components/common/InvisibleCaptcha";
import type { ContactPageData } from "@/types";
import type { FooterProps } from "@/components/layout/Footer";

interface ContactSectionProps {
  pageData?: ContactPageData;
  footerInfo?: FooterProps["data"];
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  pageData,
  footerInfo,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    phone: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const captchaRef = useRef<InvisibleCaptchaRef>(null);

  // Textos configurables o predeterminados
  const formTitle = pageData?.formTitle || "Estamos para ayudarte";
  const formSubtitle =
    pageData?.formSubtitle ||
    "¿Tienes dudas sobre nuestros productos, precios o pedidos? Envíanos un mensaje y nuestro equipo se pondrá en contacto contigo lo antes posible.";
  const submitButtonText = pageData?.submitButtonText || "Enviar mensaje";

  // Datos de contacto (prioridad: pageData -> footerInfo -> defaults)
  const phone = pageData?.phone || footerInfo?.phone || "+52 81 8659 0941";
  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  const email = pageData?.email || footerInfo?.email || "contacto@karmax.mx";
  const schedule =
    pageData?.schedule ||
    footerInfo?.schedule ||
    "Horario de lunes a viernes de 9:00 - 18:00 hrs";
  const address =
    pageData?.address ||
    footerInfo?.address ||
    "Calle Zaragoza PTE. #313, Col. Centro Cadereyta Jimenez Nuevo León, CP 67480";
  const whatsappNumber =
    pageData?.whatsappNumber ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    "+528186590941";
  const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, "");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validaciones del cliente
    if (!formData.fullName.trim()) {
      setErrorMessage("Por favor ingresa tu nombre completo.");
      return;
    }
    if (!formData.company.trim()) {
      setErrorMessage("Por favor ingresa el nombre de tu empresa.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage("Por favor ingresa tu teléfono.");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage("Por favor ingresa tu correo electrónico.");
      return;
    }
    if (!formData.message.trim()) {
      setErrorMessage("Por favor escribe tu mensaje.");
      return;
    }

    setIsSubmitting(true);

    try {
      const verification = captchaRef.current?.getVerificationData();

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          company: formData.company.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          antiBotToken: verification?.antiBotToken,
          honeypot: verification?.honeypot,
          turnstileToken: verification?.turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo enviar el mensaje.");
      }

      setSubmitSuccess(true);
      setFormData({
        fullName: "",
        company: "",
        phone: "",
        email: "",
        message: "",
      });
      // Refrescar token de captcha para el siguiente intento
      captchaRef.current?.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al enviar el formulario.";
      setErrorMessage(msg);
      captchaRef.current?.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="w-full bg-[var(--light-bg-karmax)] pt-8 md:pt-12 pb-12 sm:pb-32 sm:pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--dark-blue-karmax)] tracking-tight mb-3">
          {formTitle}
        </h2>
        <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed mb-8">
          {formSubtitle}
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Columna Izquierda: Formulario */}
          <div className="lg:col-span-7">
            {submitSuccess ? (
              <div className="bg-white rounded-2xl p-8 sm:p-10 border border-emerald-100 shadow-xs text-center">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  ¡Mensaje enviado con éxito!
                </h3>
                <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto mb-6">
                  Hemos recibido tu solicitud y nuestro equipo se pondrá en contacto contigo a la brevedad.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(false)}
                  className="inline-flex items-center justify-center bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-sm font-semibold py-2.5 px-6 rounded-full transition-all cursor-pointer shadow-xs"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Nombre completo */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-[14px] sm:text-[16px] font-semibold text-[var(--text-karmax)] mb-1.5"
                  >
                    Nombre completo <span className="text-[var(--green-karmax)] font-normal">*</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder=""
                    className="w-full bg-white rounded-lg px-4 py-2.5 sm:py-3 text-[var(--text-karmax)] text-[14px] sm:text-[16px] focus:outline-none focus:shadow-[0_0_10px_0_rgba(22,194,74,0.5)] shadow-2xs transition-all"
                  />
                </div>

                {/* Empresa */}
                <div>
                  <label
                    htmlFor="company"
                    className="block text-[14px] sm:text-[16px] font-semibold text-[var(--text-karmax)] mb-1.5"
                  >
                    Empresa <span className="text-[var(--green-karmax)] font-normal">*</span>
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    placeholder=""
                    className="w-full bg-white rounded-lg px-4 py-2.5 sm:py-3 text-[var(--text-karmax)] text-[14px] sm:text-[16px] focus:outline-none focus:shadow-[0_0_10px_0_rgba(22,194,74,0.5)] shadow-2xs transition-all"
                  />
                </div>

                {/* Fila: Teléfono y Correo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-[14px] sm:text-[16px] font-semibold text-[var(--text-karmax)] mb-1.5"
                    >
                      Teléfono <span className="text-[var(--green-karmax)] font-normal">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder=""
                      className="w-full bg-white rounded-lg px-4 py-2.5 sm:py-3 text-[var(--text-karmax)] text-[14px] sm:text-[16px] focus:outline-none focus:shadow-[0_0_10px_0_rgba(22,194,74,0.5)] shadow-2xs transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[14px] sm:text-[16px] font-semibold text-[var(--text-karmax)] mb-1.5"
                    >
                      Correo electrónico <span className="text-[var(--green-karmax)] font-normal">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder=""
                      className="w-full bg-white rounded-lg px-4 py-2.5 sm:py-3 text-[var(--text-karmax)] text-[14px] sm:text-[16px] focus:outline-none focus:shadow-[0_0_10px_0_rgba(22,194,74,0.5)] shadow-2xs transition-all"
                    />
                  </div>
                </div>

                {/* Mensaje */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-[14px] sm:text-[16px] font-semibold text-[var(--text-karmax)] mb-1.5"
                  >
                    Mensaje <span className="text-[var(--green-karmax)] font-normal">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder=""
                    className="w-full bg-white rounded-lg px-4 py-2.5 sm:py-3 text-[var(--text-karmax)] text-[14px] sm:text-[16px] focus:outline-none focus:shadow-[0_0_10px_0_rgba(22,194,74,0.5)] shadow-2xs transition-all resize-none"
                  />
                </div>

                {/* CAPTCHA invisible & Honeypot */}
                <InvisibleCaptcha ref={captchaRef} />

                {/* Mensaje de error si falla el envío */}
                {errorMessage && (
                  <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Botón Enviar mensaje */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary inline-flex items-center justify-center border border-[var(--green-karmax)] bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] hover:border-[var(--green-hover-karmax)] text-white px-8 py-4 rounded-full text-base shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      submitButtonText
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Columna Derecha: Canales de contacto */}
          <div className="lg:col-span-5 lg:pl-4 xl:pl-8 pt-2 sm:pt-4">
            <div className="space-y-0 divide-y divide-[var(--text-karmax)]/15 border-t border-b border-[var(--text-karmax)]/15">
              {/* WhatsApp */}
              <div className="py-4 sm:py-5">
                <a
                  href={`https://wa.me/${cleanWhatsapp}?text=Hola,%20quisiera%20solicitar%20información%20sobre%20sus%20productos`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3.5 text-[var(--text-karmax)] hover:text-[var(--green-karmax)] transition-colors"
                >
                  <span className="text-[var(--green-karmax)] flex-shrink-0 transition-transform group-hover:scale-110">
                    <WhatsappIcon size={24} />
                  </span>
                  <span className="text-[16px] font-normal">
                    Contáctanos por <strong className="font-medium underline decoration-[var(--text-karmax)] group-hover:decoration-[var(--green-karmax)]">WhatsApp</strong>
                  </span>
                </a>
              </div>

              {/* Teléfono */}
              <div className="py-4 sm:py-5">
                <a
                  href={`tel:${cleanPhone}`}
                  className="group flex items-center gap-3.5 text-[var(--text-karmax)] hover:text-[var(--green-karmax)] transition-colors"
                >
                  <Phone className="w-6 h-6 text-[var(--green-karmax)] flex-shrink-0 transition-transform group-hover:scale-110" />
                  <span className="text-[16px] font-normal">
                    Llámanos al <span className="font-medium">{phone}</span>
                  </span>
                </a>
              </div>

              {/* Correo Electrónico */}
              <div className="py-4 sm:py-5">
                <a
                  href={`mailto:${email}`}
                  className="group flex items-center gap-3.5 text-[var(--text-karmax)] hover:text-[var(--green-karmax)] transition-colors"
                >
                  <Mail className="w-6 h-6 text-[var(--green-karmax)] flex-shrink-0 transition-transform group-hover:scale-110" />
                  <span className="text-[16px] font-normal">
                    Envíanos un mensaje a <span className="font-medium">{email}</span>
                  </span>
                </a>
              </div>

              {/* Horario */}
              <div className="py-4 sm:py-5 flex items-center gap-3.5 text-[var(--text-karmax)]">
                <Clock className="w-6 h-6 text-[var(--green-karmax)] flex-shrink-0" />
                <span className="text-[16px] font-normal">
                  {schedule}
                </span>
              </div>

              {/* Dirección */}
              <div className="py-4 sm:py-5 flex items-start gap-3.5 text-[var(--text-karmax)]">
                <MapPin className="w-6 h-6 text-[var(--green-karmax)] flex-shrink-0 mt-0.5" />
                <span className="text-[16px] font-normal leading-relaxed">
                  {address}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
