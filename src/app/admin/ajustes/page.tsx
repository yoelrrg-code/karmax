"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Settings,
  Mail,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  Globe,
  Search,
  Upload,
} from "lucide-react";
import { SeoSettings } from "@/types";

export default function AdminSettingsPage() {
  const [notificationEmail, setNotificationEmail] = useState("");
  const [defaultEnvEmail, setDefaultEnvEmail] = useState("");
  const [seoForm, setSeoForm] = useState<SeoSettings>({
    siteUrl: "https://karmax.mx",
    metaTitleDefault: "KARMAX | Soluciones Químicas de Alta Calidad",
    metaDescriptionDefault: "Fabricación y distribución de soluciones químicas para limpieza, mantenimiento institucional e industrial con cobertura nacional.",
    metaKeywordsDefault: "quimicos industriales, productos de limpieza, solventes, desengrasantes, karmax mexico",
    ogImageUrlDefault: "/images/hero/hero-bg.jpg",
    companyName: "KARMAX Soluciones Químicas",
    telephone: "+52 55 1234 5678",
    address: "Ciudad de México, México",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/general-settings");
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setNotificationEmail(data.notificationEmail || "");
            setDefaultEnvEmail(data.defaultEnvEmail || "");
            if (data.seoSettings) {
              setSeoForm((prev) => ({
                ...prev,
                ...data.seoSettings,
              }));
            }
          }
        }
      } catch (err) {
        console.error("Error al cargar ajustes generales:", err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadSettings();
    return () => {
      ignore = true;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "uploads");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setSeoForm((prev) => ({ ...prev, ogImageUrlDefault: data.url }));
        showToast("Imagen OpenGraph subida con éxito");
      }
    } catch {
      showToast("Error al subir imagen");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/general-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationEmail,
          seoSettings: seoForm,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo guardar la configuración.");
      }

      showToast("Configuración y SEO guardados exitosamente.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar.";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[var(--blue-karmax)]" />
        <p className="text-sm">Cargando ajustes generales...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-[var(--dark-blue-karmax)]" />
          Ajustes Generales
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Configuración global del sistema, correos de notificación institucional y parámetros del sitio.
        </p>
      </div>

      {/* Formulario de Ajustes */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Card: Notificaciones por Correo */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--blue-karmax)] flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Notificaciones por Correo Electrónico
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dirección institucional donde Karmax recibe avisos de nuevas cotizaciones y mensajes del formulario de contacto.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label
                htmlFor="notificationEmail"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                Correo de Notificaciones (KARMAX_NOTIFICATION_EMAIL)
              </label>
              <input
                id="notificationEmail"
                type="email"
                required
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                placeholder="ventas@karmax.mx"
                className="w-full sm:max-w-md text-sm p-3 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20 outline-none text-slate-800 transition-all shadow-2xs font-medium"
              />
            </div>

            {/* Banner Informativo */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 leading-relaxed">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p>
                  El valor configurado aquí reemplaza dinámicamente la variable de entorno{" "}
                  <code className="bg-slate-200/60 px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-700">
                    KARMAX_NOTIFICATION_EMAIL
                  </code>
                  {defaultEnvEmail && (
                    <>
                      {" "}
                      (valor actual en <code className="text-[11px] font-mono">.env.local</code>:{" "}
                      <strong>{defaultEnvEmail}</strong>)
                    </>
                  )}
                  .
                </p>
                <p className="mt-1 text-slate-500">
                  Cada vez que un usuario envíe una solicitud en la página <strong>/contacto</strong> o guarde una cotización, se despachará una alerta por correo a esta dirección.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card: Configuración SEO Global y Rich Snippets */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[var(--green-karmax)] flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Configuración Global de SEO y Metadatos
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Controla los metadatos globales, Open Graph por defecto, dominio canónico y datos estructurados Schema.org.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Site URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Dominio Base / Canónico (siteUrl)
              </label>
              <input
                type="url"
                value={seoForm.siteUrl || ""}
                onChange={(e) => setSeoForm((prev) => ({ ...prev, siteUrl: e.target.value }))}
                placeholder="https://karmax.mx"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20 outline-none text-slate-800 transition-all font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Utilizado para generar canonical tags y el sitemap.xml dinámico.</p>
            </div>

            {/* Default Meta Title */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Título Meta por Defecto
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {(seoForm.metaTitleDefault || "").length}/60
                </span>
              </div>
              <input
                type="text"
                maxLength={70}
                value={seoForm.metaTitleDefault || ""}
                onChange={(e) => setSeoForm((prev) => ({ ...prev, metaTitleDefault: e.target.value }))}
                placeholder="KARMAX | Soluciones Químicas de Alta Calidad"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20 outline-none text-slate-800 transition-all"
              />
            </div>

            {/* Default Meta Description */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Meta Descripción por Defecto
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {(seoForm.metaDescriptionDefault || "").length}/160
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={170}
                value={seoForm.metaDescriptionDefault || ""}
                onChange={(e) => setSeoForm((prev) => ({ ...prev, metaDescriptionDefault: e.target.value }))}
                placeholder="Descripción concisa y persuasiva que aparecerá en los resultados de Google..."
                className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20 outline-none text-slate-800 transition-all resize-none"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Palabras Clave (Meta Keywords)
              </label>
              <input
                type="text"
                value={seoForm.metaKeywordsDefault || ""}
                onChange={(e) => setSeoForm((prev) => ({ ...prev, metaKeywordsDefault: e.target.value }))}
                placeholder="quimicos industriales, desengrasantes, solventes..."
                className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20 outline-none text-slate-800 transition-all"
              />
            </div>

            {/* Default OG Image */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Imagen Open Graph por Defecto (Redes Sociales)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={seoForm.ogImageUrlDefault || ""}
                  onChange={(e) => setSeoForm((prev) => ({ ...prev, ogImageUrlDefault: e.target.value }))}
                  placeholder="/images/hero/hero-bg.jpg o URL"
                  className="flex-1 text-sm p-3 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20 outline-none text-slate-800 transition-all font-mono"
                />
                <label className="inline-flex items-center gap-1.5 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Subir</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleOgImageUpload}
                  />
                </label>
              </div>
              {seoForm.ogImageUrlDefault && (
                <div className="mt-2 w-32 h-16 relative bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                  <Image
                    src={seoForm.ogImageUrlDefault}
                    alt="OpenGraph preview"
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Schema.org Company Info */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Datos Institucionales para Schema.org (Organization & LocalBusiness)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  value={seoForm.companyName}
                  onChange={(e) => setSeoForm((prev) => ({ ...prev, companyName: e.target.value }))}
                  placeholder="KARMAX Soluciones Químicas"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] outline-none text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Teléfono Institucional</label>
                <input
                  type="text"
                  value={seoForm.telephone}
                  onChange={(e) => setSeoForm((prev) => ({ ...prev, telephone: e.target.value }))}
                  placeholder="+52 55 1234 5678"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] outline-none text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Dirección / Sede</label>
                <input
                  type="text"
                  value={seoForm.address}
                  onChange={(e) => setSeoForm((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Ciudad de México, México"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] outline-none text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* SERP Live Preview */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Simulador de Búsqueda de Google (Página de Inicio)
              </span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 max-w-xl">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="text-[12px]">🌐</span>
                <span className="truncate">{seoForm.siteUrl || "https://karmax.mx"}</span>
              </div>
              <p className="text-[#1a0dab] hover:underline text-base font-medium leading-snug cursor-pointer line-clamp-1">
                {seoForm.metaTitleDefault || "KARMAX | Soluciones Químicas de Alta Calidad"}
              </p>
              <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                {seoForm.metaDescriptionDefault || "Fabricación y distribución de soluciones químicas para limpieza, mantenimiento institucional e industrial con cobertura nacional."}
              </p>
            </div>
          </div>

          {/* Unified Save Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-sm font-semibold py-2.5 px-6 rounded-xl shadow-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Todos los Ajustes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
