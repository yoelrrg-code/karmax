"use client";

import React, { useState, useEffect } from "react";
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
  Plus,
  Trash2,
} from "lucide-react";

export default function AdminSectionsPage() {
  const [activeTab, setActiveTab] = useState<
    "hero" | "trust_badges" | "brands" | "quote_steps" | "prefooter_cta" | "footer_info"
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

  const tabs = [
    { id: "hero", label: "Sección Hero", icon: Sparkles },
    { id: "trust_badges", label: "Propuesta de Valor", icon: ShieldCheck },
    { id: "brands", label: "Marcas Aliadas", icon: Tag },
    { id: "quote_steps", label: "Pasos de Cotización", icon: ListOrdered },
    { id: "prefooter_cta", label: "CTA Pre-Footer", icon: PhoneCall },
    { id: "footer_info", label: "Footer & Contacto", icon: Mail },
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
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
              >
                <input
                  type="text"
                  value={b.name}
                  onChange={(e) => {
                    const next = [...brands];
                    next[idx] = { ...next[idx], name: e.target.value };
                    setBrands(next);
                  }}
                  placeholder="Nombre de la marca"
                  className="w-1/3 text-[var(--blue-karmax)] text-xs p-2 rounded-lg bg-white border border-slate-200 font-semibold"
                />
                <input
                  type="text"
                  value={b.logoUrl}
                  onChange={(e) => {
                    const next = [...brands];
                    next[idx] = { ...next[idx], logoUrl: e.target.value };
                    setBrands(next);
                  }}
                  placeholder="/images/brands/l-brand.svg"
                  className="flex-1 text-[var(--blue-karmax)] text-xs p-2 rounded-lg bg-white border border-slate-200 font-mono"
                />
                <button
                  type="button"
                  onClick={() =>
                    setBrands((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="p-1.5 text-slate-400 hover:text-rose-600"
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
    </div>
  );
}
