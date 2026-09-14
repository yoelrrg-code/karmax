"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Layers,
  Save,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Tag,
  ListOrdered,
  PhoneCall,
  Mail,
  Share2,
  ExternalLink,
  Trash2,
  Upload,
  ImageIcon,
  Loader2,
  MessageSquare,
  Users2,
} from "lucide-react";
import { Icon } from "@/components/icons";
import type { AboutUsPageData } from "@/types";

export default function AdminSectionsPage() {
  const [activeTab, setActiveTab] = useState<
    "hero" | "trust_badges" | "brands" | "quote_steps" | "prefooter_cta" | "footer_info" | "social_links" | "contact_page" | "about_us"
  >("hero");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sections State
  const [heroData, setHeroData] = useState({
    badgeText: "",
    title: "",
    description: "",
    ctaText: "",
    ctaLink: "",
    whatsappText: "",
    whatsappMessage: "",
  });

  const [trustBadges, setTrustBadges] = useState<Array<{ id: string; label: string }>>([]);
  const [brands, setBrands] = useState<Array<{ id: number; name: string; logoUrl: string }>>([]);
  const [uploadingBrandIdx, setUploadingBrandIdx] = useState<number | null>(null);
  const [quoteSteps, setQuoteSteps] = useState<
    Array<{ step: number; title: string; description: string; iconUrl: string }>
  >([]);

  const [prefooterData, setPrefooterData] = useState({
    title: "",
    description: "",
    ctaText: "",
    ctaLink: "",
    phone: "",
    phoneClean: "",
  });

  const [footerData, setFooterData] = useState({
    description: "",
    phone: "",
    email: "",
    schedule: "",
    address: "",
    facebookUrl: "",
    instagramUrl: "",
  });

  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    tiktok: "",
    linkedin: "",
    whatsapp: "",
    youtube: "",
  });

  const [contactData, setContactData] = useState({
    bannerTitle: "Contacto",
    formTitle: "Estamos para ayudarte",
    formSubtitle:
      "¿Tienes dudas sobre nuestros productos, precios o pedidos? Envíanos un mensaje y nuestro equipo se pondrá en contacto contigo lo antes posible.",
    submitButtonText: "Enviar mensaje",
    phone: "",
    email: "",
    whatsappNumber: "",
    schedule: "",
    address: "",
  });

  const [aboutUsData, setAboutUsData] = useState<AboutUsPageData>({
    bannerTitle: "Quiénes Somos",
    storyTitle: "Calidad que nace en el corazón de Nuevo León",
    storyParagraph1:
      "KARMAX es una empresa 100% mexicana con sede en Cadereyta Jiménez. Fabricamos productos de limpieza profesional con materias primas seleccionadas y estrictos controles bajo estándares internacionales de calidad, a precios accesibles, para brindar eficacia y confianza en cada uso.",
    storyParagraph2:
      "Atendemos a hogares, empresas e industrias de Nuevo León, con servicio directo y entregas en Monterrey y su área metropolitana. Nuestro compromiso es ofrecer soluciones efectivas, respaldadas por una atención cercana.",
    missionTitle: "Misión",
    missionText:
      "Fabricar y ofrecer productos de limpieza profesional de la más alta calidad, elaborados con materias primas seleccionadas y procesos certificados, a precios competitivos, para ayudar a hogares, empresas e industrias a mantener espacios limpios, seguros y saludables.",
    visionTitle: "Visión",
    visionText:
      "Ser una marca mexicana líder en productos de limpieza profesional, reconocida por su calidad, precios competitivos y excelencia en el servicio. Aspiramos a convertirnos en el proveedor de confianza de miles de hogares y empresas, tanto a nivel local como nacional.",
    mosaicImages: [
      { id: 1, imageUrl: "/images/about/1-cadereyta.jpg", alt: "Parroquia histórica de Cadereyta Jiménez, Nuevo León" },
      { id: 2, imageUrl: "/images/about/2-brand.png", alt: "Logotipo institucional de Karmax" },
      { id: 3, imageUrl: "/images/about/3-products.png", alt: "Productos y químicos de limpieza Karmax" },
      { id: 4, imageUrl: "/images/about/4-cleaner.jpg", alt: "Especialista en limpieza profesional Karmax" },
      { id: 5, imageUrl: "/images/about/5-monterrey.jpg", alt: "Vista panorámica de Monterrey y Cerro de la Silla" },
      { id: 6, imageUrl: "/images/about/6-warehouse.jpg", alt: "Almacén de distribución y logística Karmax" },
    ],
    valuesTitle: "Nuestros Valores",
    values: [
      { id: "calidad", iconName: "award", title: "Calidad", description: "Seleccionamos las mejores materias primas y mantenemos estándares internacionales en cada etapa de producción." },
      { id: "confianza", iconName: "shield", title: "Confianza", description: "Construimos relaciones duraderas con nuestros clientes basados en transparencia y resultados comprobados." },
      { id: "compromiso", iconName: "commitment", title: "Compromiso", description: "Nos dedicamos a superar las expectativas de nuestros clientes en cada interacción y producto." },
      { id: "innovacion", iconName: "lightbulb", title: "Innovación", description: "Mejoramos constantemente nuestras formulaciones y procesos para ofrecer productos más efectivos." },
      { id: "orgullo-mexicano", iconName: "flag", title: "Orgullo Mexicano", description: "Orgullosamente fabricado en México con tecnología de punta y talento nacional." },
      { id: "responsabilidad", iconName: "globe", title: "Responsabilidad", description: "Nos preocupamos por el impacto de nuestros productos en la salud y el medio ambiente." },
    ],
  });
  const [uploadingMosaicIdx, setUploadingMosaicIdx] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadSections() {
      try {
        const res = await fetch("/api/admin/sections");
        if (res.ok) {
          const data = await res.json();
          const s = data.settings || {};

          if (!ignore) {
            if (s.hero?.value) setHeroData(s.hero.value);
            if (s.trust_badges?.value) setTrustBadges(s.trust_badges.value);
            if (s.brands?.value) setBrands(s.brands.value);
            if (s.quote_steps?.value) setQuoteSteps(s.quote_steps.value);
            if (s.prefooter_cta?.value) setPrefooterData(s.prefooter_cta.value);
            if (s.footer_info?.value) setFooterData(s.footer_info.value);
            if (s.social_links?.value) {
              setSocialLinks((prev) => ({
                ...prev,
                ...s.social_links.value,
              }));
            }
            if (s.contact_page?.value) {
              setContactData((prev) => ({
                ...prev,
                ...s.contact_page.value,
              }));
            }
            if (s.about_us?.value) {
              setAboutUsData((prev) => ({
                ...prev,
                ...s.about_us.value,
              }));
            }
          }
        }
      } catch (err) {
        console.error("Error loading sections:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    loadSections();
    return () => {
      ignore = true;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveSection = async (key: string, value: unknown, label: string) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, label }),
      });
      if (res.ok) {
        showToast("Sección guardada correctamente");
      } else {
        showToast("Error al guardar sección");
      }
    } catch {
      showToast("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBrandLogoUpload = async (idx: number, file: File) => {
    setUploadingBrandIdx(idx);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "brands");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al subir la imagen");
      }

      setBrands((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], logoUrl: data.url };
        return next;
      });

      showToast("Logo subido correctamente");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al subir la imagen";
      alert(msg);
    } finally {
      setUploadingBrandIdx(null);
    }
  };

  const handleUploadMosaicImage = async (idx: number, file: File) => {
    setUploadingMosaicIdx(idx);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "about");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al subir la imagen");
      }

      setAboutUsData((prev) => {
        const currentMosaic = prev.mosaicImages ? [...prev.mosaicImages] : [];
        currentMosaic[idx] = {
          ...(currentMosaic[idx] || { id: idx + 1, alt: "" }),
          imageUrl: data.url,
        };
        return { ...prev, mosaicImages: currentMosaic };
      });

      showToast("Imagen del mosaico subida correctamente");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al subir la imagen";
      alert(msg);
    } finally {
      setUploadingMosaicIdx(null);
    }
  };

  const tabs = [
    { id: "hero", label: "Sección Hero", icon: Sparkles },
    { id: "trust_badges", label: "Propuesta de Valor", icon: ShieldCheck },
    { id: "brands", label: "Marcas Aliadas", icon: Tag },
    { id: "quote_steps", label: "Pasos de Cotización", icon: ListOrdered },
    { id: "prefooter_cta", label: "CTA Pre-Footer", icon: PhoneCall },
    { id: "footer_info", label: "Footer & Contacto", icon: Mail },
    { id: "social_links", label: "Redes Sociales", icon: Share2 },
    { id: "contact_page", label: "Página de Contacto", icon: MessageSquare },
    { id: "about_us", label: "Quiénes Somos", icon: Users2 },
  ] as const;

  if (isLoading) {
    return <div className="py-20 text-center text-slate-400">Cargando secciones...</div>;
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-[var(--dark-blue-karmax)]" />
            Contenidos y Secciones del Sitio
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Personaliza los textos, llamados a la acción, marcas y datos de contacto de la tienda.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                active
                  ? "bg-[var(--dark-blue-karmax)] text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: HERO */}
      {activeTab === "hero" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Hero Principal (Portada)
            </h3>
            <button
              type="button"
              disabled={isSaving}
              onClick={() =>
                handleSaveSection("hero", heroData, "Sección Hero Principal")
              }
              className="inline-flex items-center gap-1.5 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Distintivo Superior (Badge)
              </label>
              <input
                type="text"
                value={heroData.badgeText}
                onChange={(e) =>
                  setHeroData((prev) => ({ ...prev, badgeText: e.target.value }))
                }
                className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Titular Principal (h3)
              </label>
              <input
                type="text"
                value={heroData.title}
                onChange={(e) =>
                  setHeroData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full text-[var(--blue-karmax)] text-xs sm:text-sm font-semibold p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción / Subtítulo
              </label>
              <textarea
                rows={3}
                value={heroData.description}
                onChange={(e) =>
                  setHeroData((prev) => ({ ...prev, description: e.target.value }))
                }
                className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Texto del Botón de Catálogo
                </label>
                <input
                  type="text"
                  value={heroData.ctaText}
                  onChange={(e) =>
                    setHeroData((prev) => ({ ...prev, ctaText: e.target.value }))
                  }
                  className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enlace del Botón
                </label>
                <input
                  type="text"
                  value={heroData.ctaLink}
                  onChange={(e) =>
                    setHeroData((prev) => ({ ...prev, ctaLink: e.target.value }))
                  }
                  className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Texto Botón WhatsApp
                </label>
                <input
                  type="text"
                  value={heroData.whatsappText}
                  onChange={(e) =>
                    setHeroData((prev) => ({ ...prev, whatsappText: e.target.value }))
                  }
                  className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mensaje Predeterminado WhatsApp
                </label>
                <input
                  type="text"
                  value={heroData.whatsappMessage}
                  onChange={(e) =>
                    setHeroData((prev) => ({
                      ...prev,
                      whatsappMessage: e.target.value,
                    }))
                  }
                  className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRUST BADGES */}
      {activeTab === "trust_badges" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Propuesta de Valor (Trust Badges)
            </h3>
            <button
              type="button"
              disabled={isSaving}
              onClick={() =>
                handleSaveSection(
                  "trust_badges",
                  trustBadges,
                  "Propuesta de Valor (Trust Badges)"
                )
              }
              className="inline-flex items-center gap-1.5 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>

          <div className="space-y-3">
            {trustBadges.map((badge, idx) => (
              <div
                key={badge.id}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
              >
                <span className="w-6 text-xs font-bold text-slate-400">
                  #{idx + 1}
                </span>
                <input
                  type="text"
                  value={badge.label}
                  onChange={(e) => {
                    const next = [...trustBadges];
                    next[idx] = { ...next[idx], label: e.target.value };
                    setTrustBadges(next);
                  }}
                  className="flex-1 text-[var(--blue-karmax)] text-xs p-2 rounded-lg bg-white border border-slate-200 font-semibold"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BRANDS */}
      {activeTab === "brands" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Marcas Aliadas
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Logotipos de marcas destacadas mostradas en la franja de inicio
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setBrands((prev) => [
                    ...prev,
                    {
                      id: Date.now(),
                      name: "Nueva Marca",
                      logoUrl: "/images/brands/l-karmax.svg",
                    },
                  ])
                }
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--dark-blue-karmax)] hover:underline"
              >
                <span>+ Agregar Marca</span>
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() =>
                  handleSaveSection("brands", brands, "Marcas Aliadas")
                }
                className="inline-flex items-center gap-1.5 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {brands.map((b, idx) => (
              <div
                key={b.id}
                className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors"
              >
                {/* Logo Preview */}
                <div className="relative w-16 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                  {b.logoUrl ? (
                    <Image
                      src={b.logoUrl}
                      alt={b.name || "Logo"}
                      fill
                      className="object-contain p-1"
                      unoptimized
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-slate-300" />
                  )}
                </div>

                {/* Brand Name Input */}
                <div className="w-full md:w-1/3">
                  <input
                    type="text"
                    value={b.name}
                    onChange={(e) => {
                      const next = [...brands];
                      next[idx] = { ...next[idx], name: e.target.value };
                      setBrands(next);
                    }}
                    placeholder="Nombre de la marca"
                    className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-lg bg-white border border-slate-200 font-semibold focus:outline-none focus:border-[var(--green-karmax)]"
                  />
                </div>

                {/* Logo URL Input + Upload Button */}
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={b.logoUrl}
                    onChange={(e) => {
                      const next = [...brands];
                      next[idx] = { ...next[idx], logoUrl: e.target.value };
                      setBrands(next);
                    }}
                    placeholder="/images/brands/l-brand.svg"
                    className="flex-1 text-[var(--blue-karmax)] text-xs p-2.5 rounded-lg bg-white border border-slate-200 font-mono focus:outline-none focus:border-[var(--green-karmax)]"
                  />

                  {/* Upload button */}
                  <label
                    className={`inline-flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs shrink-0 select-none ${
                      uploadingBrandIdx === idx ? "opacity-60 pointer-events-none" : ""
                    }`}
                  >
                    {uploadingBrandIdx === idx ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--dark-blue-karmax)]" />
                        <span className="hidden sm:inline">Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Subir Imagen</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/svg+xml,image/png,image/jpeg,image/webp"
                      className="hidden"
                      disabled={uploadingBrandIdx === idx}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleBrandLogoUpload(idx, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() =>
                    setBrands((prev) => prev.filter((_, i) => i !== idx))
                  }
                  title="Eliminar marca"
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors self-end md:self-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: QUOTE STEPS */}
      {activeTab === "quote_steps" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Pasos del Proceso de Cotización
            </h3>
            <button
              type="button"
              disabled={isSaving}
              onClick={() =>
                handleSaveSection(
                  "quote_steps",
                  quoteSteps,
                  "Pasos de Cotización (3 Pasos)"
                )
              }
              className="inline-flex items-center gap-1.5 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>

          <div className="space-y-4">
            {quoteSteps.map((step, idx) => (
              <div
                key={step.step}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--dark-blue-karmax)] uppercase tracking-wider">
                    Paso {step.step}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const next = [...quoteSteps];
                      next[idx] = { ...next[idx], title: e.target.value };
                      setQuoteSteps(next);
                    }}
                    className="w-full text-[var(--blue-karmax)] text-xs p-2 rounded-lg bg-white border border-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={2}
                    value={step.description}
                    onChange={(e) => {
                      const next = [...quoteSteps];
                      next[idx] = { ...next[idx], description: e.target.value };
                      setQuoteSteps(next);
                    }}
                    className="w-full text-[var(--blue-karmax)] text-xs p-2 rounded-lg bg-white border border-slate-200"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PREFOOTER CTA */}
      {activeTab === "prefooter_cta" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Llamado a la Acción Pre-Footer
            </h3>
            <button
              type="button"
              disabled={isSaving}
              onClick={() =>
                handleSaveSection(
                  "prefooter_cta",
                  prefooterData,
                  "Llamado a la Acción Pre-Footer"
                )
              }
              className="inline-flex items-center gap-1.5 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título
              </label>
              <input
                type="text"
                value={prefooterData.title}
                onChange={(e) =>
                  setPrefooterData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción
              </label>
              <textarea
                rows={2}
                value={prefooterData.description}
                onChange={(e) =>
                  setPrefooterData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Texto del Botón
                </label>
                <input
                  type="text"
                  value={prefooterData.ctaText}
                  onChange={(e) =>
                    setPrefooterData((prev) => ({
                      ...prev,
                      ctaText: e.target.value,
                    }))
                  }
                  className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono de Atención
                </label>
                <input
                  type="text"
                  value={prefooterData.phone}
                  onChange={(e) =>
                    setPrefooterData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                      phoneClean: e.target.value.replace(/[^0-9]/g, ""),
                    }))
                  }
                  className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: FOOTER & CONTACT */}
      {activeTab === "footer_info" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Información del Footer y Contacto
            </h3>
            <button
              type="button"
              disabled={isSaving}
              onClick={() =>
                handleSaveSection(
                  "footer_info",
                  footerData,
                  "Información del Footer y Contacto"
                )
              }
              className="inline-flex items-center gap-1.5 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción Institucional
              </label>
              <textarea
                rows={2}
                value={footerData.description}
                onChange={(e) =>
                  setFooterData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono Principal
                </label>
                <input
                  type="text"
                  value={footerData.phone}
                  onChange={(e) =>
                    setFooterData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="text"
                  value={footerData.email}
                  onChange={(e) =>
                    setFooterData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Horario de Atención
              </label>
              <input
                type="text"
                value={footerData.schedule}
                onChange={(e) =>
                  setFooterData((prev) => ({ ...prev, schedule: e.target.value }))
                }
                className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dirección Física
              </label>
              <input
                type="text"
                value={footerData.address}
                onChange={(e) =>
                  setFooterData((prev) => ({ ...prev, address: e.target.value }))
                }
                className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: REDES SOCIALES */}
      {activeTab === "social_links" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[var(--green-karmax)]" />
                Redes Sociales del Footer
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configura los enlaces oficiales a tus redes sociales. Solo se mostrarán en el pie de página las que tengan una URL definida.
              </p>
            </div>
            <button
              type="button"
              disabled={isSaving}
              onClick={() =>
                handleSaveSection(
                  "social_links",
                  socialLinks,
                  "Redes Sociales del Footer"
                )
              }
              className="inline-flex items-center gap-1.5 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-xs transition-all cursor-pointer w-fit"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Facebook */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="facebook" size={24} />
                  <label className="text-xs font-bold text-slate-800">Facebook</label>
                </div>
                {socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[var(--blue-karmax)] hover:underline font-medium"
                  >
                    <span>Probar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                placeholder="https://facebook.com/tu-pagina"
                value={socialLinks.facebook}
                onChange={(e) =>
                  setSocialLinks((prev) => ({ ...prev, facebook: e.target.value }))
                }
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
              />
            </div>

            {/* Instagram */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="instagram" size={24} />
                  <label className="text-xs font-bold text-slate-800">Instagram</label>
                </div>
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[var(--blue-karmax)] hover:underline font-medium"
                  >
                    <span>Probar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                placeholder="https://instagram.com/tu-perfil"
                value={socialLinks.instagram}
                onChange={(e) =>
                  setSocialLinks((prev) => ({ ...prev, instagram: e.target.value }))
                }
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
              />
            </div>

            {/* TikTok */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="tiktok" size={24} />
                  <label className="text-xs font-bold text-slate-800">TikTok</label>
                </div>
                {socialLinks.tiktok && (
                  <a
                    href={socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[var(--blue-karmax)] hover:underline font-medium"
                  >
                    <span>Probar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                placeholder="https://tiktok.com/@tu-cuenta"
                value={socialLinks.tiktok}
                onChange={(e) =>
                  setSocialLinks((prev) => ({ ...prev, tiktok: e.target.value }))
                }
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
              />
            </div>

            {/* LinkedIn */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="linkedin" size={24} />
                  <label className="text-xs font-bold text-slate-800">LinkedIn</label>
                </div>
                {socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[var(--blue-karmax)] hover:underline font-medium"
                  >
                    <span>Probar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                placeholder="https://linkedin.com/company/tu-empresa"
                value={socialLinks.linkedin}
                onChange={(e) =>
                  setSocialLinks((prev) => ({ ...prev, linkedin: e.target.value }))
                }
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
              />
            </div>

            {/* WhatsApp */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="whatsapp" size={24} />
                  <label className="text-xs font-bold text-slate-800">WhatsApp</label>
                </div>
                {socialLinks.whatsapp && (
                  <a
                    href={socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[var(--blue-karmax)] hover:underline font-medium"
                  >
                    <span>Probar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                placeholder="https://wa.me/528186590941"
                value={socialLinks.whatsapp}
                onChange={(e) =>
                  setSocialLinks((prev) => ({ ...prev, whatsapp: e.target.value }))
                }
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
              />
            </div>

            {/* YouTube */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="youtube" size={24} />
                  <label className="text-xs font-bold text-slate-800">YouTube (Opcional)</label>
                </div>
                {socialLinks.youtube && (
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[var(--blue-karmax)] hover:underline font-medium"
                  >
                    <span>Probar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                placeholder="https://youtube.com/@tu-canal"
                value={socialLinks.youtube}
                onChange={(e) =>
                  setSocialLinks((prev) => ({ ...prev, youtube: e.target.value }))
                }
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
              />
            </div>
          </div>

          {/* Footer Live Preview */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-[var(--light-bg-karmax)] mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Vista previa en vivo de los iconos del Footer
              </h4>
              <span className="text-[11px] text-slate-400">
                Los iconos vacíos no se mostrarán en la web pública
              </span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.facebook && (
                <div title="Facebook activo">
                  <Icon name="facebook" size={32} />
                </div>
              )}
              {socialLinks.tiktok && (
                <div title="TikTok activo">
                  <Icon name="tiktok" size={32} />
                </div>
              )}
              {socialLinks.linkedin && (
                <div title="LinkedIn activo">
                  <Icon name="linkedin" size={32} />
                </div>
              )}
              {socialLinks.instagram && (
                <div title="Instagram activo">
                  <Icon name="instagram" size={32} />
                </div>
              )}
              {socialLinks.youtube && (
                <div title="YouTube activo">
                  <Icon name="youtube" size={32} />
                </div>
              )}
              {socialLinks.whatsapp && (
                <div title="WhatsApp activo">
                  <Icon name="whatsapp" size={32} />
                </div>
              )}
              {!socialLinks.facebook &&
                !socialLinks.tiktok &&
                !socialLinks.linkedin &&
                !socialLinks.instagram &&
                !socialLinks.youtube &&
                !socialLinks.whatsapp && (
                  <span className="text-xs text-slate-400 italic">
                    No hay redes sociales configuradas actualmente.
                  </span>
                )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: CONTACT PAGE */}
      {activeTab === "contact_page" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Página de Contacto (/contacto)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configura los títulos, textos explicativos del formulario y datos de contacto directos.
              </p>
            </div>
            <button
              type="button"
              disabled={isSaving}
              onClick={() =>
                handleSaveSection("contact_page", contactData, "Página de Contacto")
              }
              className="inline-flex items-center gap-1.5 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Título del Banner Azul */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Título del Banner Superior
              </label>
              <input
                type="text"
                value={contactData.bannerTitle}
                onChange={(e) =>
                  setContactData((prev) => ({ ...prev, bannerTitle: e.target.value }))
                }
                placeholder="Contacto"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
              />
            </div>

            {/* Texto del Botón de Envío */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Texto del Botón del Formulario
              </label>
              <input
                type="text"
                value={contactData.submitButtonText}
                onChange={(e) =>
                  setContactData((prev) => ({ ...prev, submitButtonText: e.target.value }))
                }
                placeholder="Enviar mensaje"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
              />
            </div>

            {/* Título del Formulario */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-800">
                Título del Formulario
              </label>
              <input
                type="text"
                value={contactData.formTitle}
                onChange={(e) =>
                  setContactData((prev) => ({ ...prev, formTitle: e.target.value }))
                }
                placeholder="Estamos para ayudarte"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
              />
            </div>

            {/* Subtítulo / Descripción del Formulario */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-800">
                Subtítulo / Instrucciones del Formulario
              </label>
              <textarea
                rows={3}
                value={contactData.formSubtitle}
                onChange={(e) =>
                  setContactData((prev) => ({ ...prev, formSubtitle: e.target.value }))
                }
                placeholder="¿Tienes dudas sobre nuestros productos, precios o pedidos? Envíanos un mensaje..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800 resize-none"
              />
            </div>
          </div>

          {/* Información de Contacto Complementaria */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
              Canales de Contacto Directo (Opcional - Hereda de Footer si se deja vacío)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Número de WhatsApp (ej: +528186590941)
                </label>
                <input
                  type="text"
                  value={contactData.whatsappNumber}
                  onChange={(e) =>
                    setContactData((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                  }
                  placeholder="+528186590941"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Teléfono de Atención
                </label>
                <input
                  type="text"
                  value={contactData.phone}
                  onChange={(e) =>
                    setContactData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+52 81 8659 0941"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
                />
              </div>

              {/* Correo Electrónico */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Correo Electrónico de Contacto
                </label>
                <input
                  type="email"
                  value={contactData.email}
                  onChange={(e) =>
                    setContactData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="contacto@karmax.mx"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
                />
              </div>

              {/* Horario */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Horario de Atención
                </label>
                <input
                  type="text"
                  value={contactData.schedule}
                  onChange={(e) =>
                    setContactData((prev) => ({ ...prev, schedule: e.target.value }))
                  }
                  placeholder="Horario de lunes a viernes de 9:00 - 18:00 hrs"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
                />
              </div>

              {/* Dirección */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-800">
                  Dirección Física
                </label>
                <input
                  type="text"
                  value={contactData.address}
                  onChange={(e) =>
                    setContactData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="Calle Zaragoza PTE. #313, Col. Centro Cadereyta Jimenez Nuevo León, CP 67480"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: QUIÉNES SOMOS */}
      {activeTab === "about_us" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-8 animate-in fade-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Página de Quiénes Somos
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Edita la historia institucional, misión, visión, imágenes del mosaico fotográfico y valores de la empresa.
              </p>
            </div>
            <button
              type="button"
              disabled={isSaving}
              onClick={() =>
                handleSaveSection("about_us", aboutUsData, "Página Quiénes Somos")
              }
              className="inline-flex items-center gap-1.5 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>

          {/* Banner Superior */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Banner Superior
            </h4>
            <div className="space-y-1.5 max-w-md">
              <label className="text-xs font-bold text-slate-800">
                Título del Banner Azul
              </label>
              <input
                type="text"
                value={aboutUsData.bannerTitle || ""}
                onChange={(e) =>
                  setAboutUsData((prev) => ({ ...prev, bannerTitle: e.target.value }))
                }
                placeholder="Quiénes Somos"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
              />
            </div>
          </div>

          {/* Historia y Presentación */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Historia Institucional
            </h4>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Titular de la Historia
                </label>
                <input
                  type="text"
                  value={aboutUsData.storyTitle || ""}
                  onChange={(e) =>
                    setAboutUsData((prev) => ({ ...prev, storyTitle: e.target.value }))
                  }
                  placeholder="Calidad que nace en el corazón de Nuevo León"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Primer Párrafo de la Historia
                  </label>
                  <textarea
                    rows={4}
                    value={aboutUsData.storyParagraph1 || ""}
                    onChange={(e) =>
                      setAboutUsData((prev) => ({ ...prev, storyParagraph1: e.target.value }))
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Segundo Párrafo de la Historia
                  </label>
                  <textarea
                    rows={4}
                    value={aboutUsData.storyParagraph2 || ""}
                    onChange={(e) =>
                      setAboutUsData((prev) => ({ ...prev, storyParagraph2: e.target.value }))
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Misión y Visión */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Misión y Visión
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Título de Misión
                  </label>
                  <input
                    type="text"
                    value={aboutUsData.missionTitle || ""}
                    onChange={(e) =>
                      setAboutUsData((prev) => ({ ...prev, missionTitle: e.target.value }))
                    }
                    placeholder="Misión"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Texto de Misión
                  </label>
                  <textarea
                    rows={4}
                    value={aboutUsData.missionText || ""}
                    onChange={(e) =>
                      setAboutUsData((prev) => ({ ...prev, missionText: e.target.value }))
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Título de Visión
                  </label>
                  <input
                    type="text"
                    value={aboutUsData.visionTitle || ""}
                    onChange={(e) =>
                      setAboutUsData((prev) => ({ ...prev, visionTitle: e.target.value }))
                    }
                    placeholder="Visión"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Texto de Visión
                  </label>
                  <textarea
                    rows={4}
                    value={aboutUsData.visionText || ""}
                    onChange={(e) =>
                      setAboutUsData((prev) => ({ ...prev, visionText: e.target.value }))
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-1 focus:ring-[var(--green-karmax)] outline-none text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mosaico de Imágenes (6) */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Mosaico Fotográfico (2x3)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Imágenes que acompañan la historia: Parroquia Cadereyta, Distintivo Marca, Productos, Especialista de Limpieza, Monterrey/Cerro de la Silla y Almacén.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(aboutUsData.mosaicImages || []).map((img, idx) => (
                <div
                  key={img.id || idx}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Foto #{idx + 1}
                    </span>
                    {uploadingMosaicIdx === idx && (
                      <Loader2 className="w-3.5 h-3.5 text-[var(--green-karmax)] animate-spin" />
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div
                    className="relative w-full h-32 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: img.bgColor || "#ffffff" }}
                  >
                    {img.imageUrl ? (
                      <Image
                        src={img.imageUrl}
                        alt={img.alt || `Mosaico ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                  </div>

                  {/* Subir archivo */}
                  <div>
                    <label className="inline-flex items-center gap-1.5 w-full justify-center text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>{uploadingMosaicIdx === idx ? "Subiendo..." : "Cambiar imagen"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingMosaicIdx === idx}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadMosaicImage(idx, file);
                        }}
                      />
                    </label>
                  </div>

                  {/* Alt text */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">
                      Descripción (Alt)
                    </label>
                    <input
                      type="text"
                      value={img.alt || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAboutUsData((prev) => {
                          const list = prev.mosaicImages ? [...prev.mosaicImages] : [];
                          list[idx] = { ...(list[idx] || { id: idx + 1, imageUrl: "" }), alt: val };
                          return { ...prev, mosaicImages: list };
                        });
                      }}
                      className="w-full text-[11px] p-2 rounded-lg border border-slate-200 bg-white focus:border-[var(--green-karmax)] outline-none text-slate-800"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nuestros Valores */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Nuestros Valores (6 Tarjetas)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tarjetas de valor con icono delineado y descripción institucional.
                </p>
              </div>
              <div className="space-y-1 sm:w-64">
                <label className="text-xs font-bold text-slate-800">
                  Título de la Sección
                </label>
                <input
                  type="text"
                  value={aboutUsData.valuesTitle || ""}
                  onChange={(e) =>
                    setAboutUsData((prev) => ({ ...prev, valuesTitle: e.target.value }))
                  }
                  placeholder="Nuestros Valores"
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] outline-none text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(aboutUsData.values || []).map((val, idx) => (
                <div
                  key={val.id || idx}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Valor #{idx + 1}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {val.iconName}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">
                      Icono
                    </label>
                    <select
                      value={val.iconName}
                      onChange={(e) => {
                        const newIcon = e.target.value;
                        setAboutUsData((prev) => {
                          const list = prev.values ? [...prev.values] : [];
                          list[idx] = { ...list[idx], iconName: newIcon };
                          return { ...prev, values: list };
                        });
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:border-[var(--green-karmax)] outline-none text-slate-800"
                    >
                      <option value="award">Premio / Calidad (Award)</option>
                      <option value="shield">Escudo / Confianza (Shield)</option>
                      <option value="commitment">Alianza / Compromiso (HeartHandshake)</option>
                      <option value="lightbulb">Bombilla / Innovación (Lightbulb)</option>
                      <option value="flag">Bandera / Orgullo Mexicano (Flag)</option>
                      <option value="globe">Planeta / Responsabilidad (Globe)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">
                      Título
                    </label>
                    <input
                      type="text"
                      value={val.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setAboutUsData((prev) => {
                          const list = prev.values ? [...prev.values] : [];
                          list[idx] = { ...list[idx], title: newTitle };
                          return { ...prev, values: list };
                        });
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:border-[var(--green-karmax)] outline-none text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">
                      Descripción
                    </label>
                    <textarea
                      rows={3}
                      value={val.description}
                      onChange={(e) => {
                        const newDesc = e.target.value;
                        setAboutUsData((prev) => {
                          const list = prev.values ? [...prev.values] : [];
                          list[idx] = { ...list[idx], description: newDesc };
                          return { ...prev, values: list };
                        });
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:border-[var(--green-karmax)] outline-none text-slate-800"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
