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
  Percent,
  Calculator,
  RefreshCw,
  FileSpreadsheet,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  History,
  ListFilter,
  Calendar,
  ArrowRight,
  Trash2,
  XCircle,
  Tag,
  PackageCheck,
  X,
  Layers,
} from "lucide-react";
import {
  SeoSettings,
  TaxSettings,
  PriceSyncSettings,
  PriceSyncLogItem,
  DEFAULT_SHEET_URL,
} from "@/types";
import { sileo } from "sileo";

export default function AdminSettingsPage() {
  const [notificationEmail, setNotificationEmail] = useState("");
  const [defaultEnvEmail, setDefaultEnvEmail] = useState("");
  const [taxSettings, setTaxSettings] = useState<TaxSettings>({
    enabled: true,
    rate: 16,
  });
  const [priceSyncSettings, setPriceSyncSettings] = useState<PriceSyncSettings>({
    enabled: true,
    sheetUrl: DEFAULT_SHEET_URL,
    syncHour: "03:00",
    lastSyncAt: null,
    lastSyncStatus: null,
    lastSyncReport: null,
  });
  const [isSyncingPrices, setIsSyncingPrices] = useState(false);
  const [showNotFoundSkus, setShowNotFoundSkus] = useState(false);
  const [mexicoClock, setMexicoClock] = useState("");
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    if (msg.toLowerCase().includes("error") || msg.toLowerCase().includes("falló")) {
      sileo.error({ title: "Error", description: msg });
    } else {
      sileo.success({ title: "Ajustes", description: msg });
    }
  };

  // Estados de Logs de Sincronización
  const [syncLogs, setSyncLogs] = useState<PriceSyncLogItem[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [logsFilter, setLogsFilter] = useState<"all" | "success" | "error">("all");
  const [selectedLogDetail, setSelectedLogDetail] = useState<PriceSyncLogItem | null>(null);
  const [skuSearchInLog, setSkuSearchInLog] = useState("");

  const fetchLogs = async (page = 1) => {
    setLogsLoading(true);
    try {
      const res = await fetch(`/api/admin/price-sync-logs?page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setSyncLogs(data.logs || []);
        setTotalLogs(data.total || 0);
        setLogsPage(page);
      }
    } catch (err) {
      console.error("Error al cargar logs de sincronización:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm("¿Estás seguro de que deseas vaciar el historial de registros de sincronización?")) {
      return;
    }
    try {
      const res = await fetch("/api/admin/price-sync-logs", { method: "DELETE" });
      if (res.ok) {
        showToast("Historial de logs vaciado con éxito.");
        fetchLogs(1);
        if (selectedLogDetail) setSelectedLogDetail(null);
      }
    } catch {
      showToast("Error al limpiar los logs.");
    }
  };
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return "hace un momento";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `hace ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `hace ${diffHours} h`;
      const diffDays = Math.floor(diffHours / 24);
      return `hace ${diffDays} d`;
    } catch {
      return "";
    }
  };

  const formatDateCdmx = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("es-MX", {
        timeZone: "America/Mexico_City",
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return dateStr;
    }
  };

  const filteredLogs = syncLogs.filter((log) => {
    if (logsFilter === "all") return true;
    return log.status === logsFilter;
  });

  const updatedSkusFiltered = (selectedLogDetail?.details?.updatedSkus || []).filter((item) => {
    if (!skuSearchInLog.trim()) return true;
    const q = skuSearchInLog.toLowerCase().trim();
    return (
      item.sku.toLowerCase().includes(q) ||
      (item.name && item.name.toLowerCase().includes(q))
    );
  });

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
            if (data.taxSettings) {
              setTaxSettings({
                enabled: Boolean(data.taxSettings.enabled),
                rate: Number(data.taxSettings.rate) || 0,
              });
            }
            if (data.priceSyncSettings) {
              setPriceSyncSettings(data.priceSyncSettings);
            }
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
    fetchLogs(1);

    // Actualizar reloj en vivo de México (America/Mexico_City)
    const updateClock = () => {
      try {
        const timeStr = new Intl.DateTimeFormat("es-MX", {
          timeZone: "America/Mexico_City",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date());
        setMexicoClock(timeStr);
      } catch {
        // ignore
      }
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    return () => {
      ignore = true;
      clearInterval(clockInterval);
    };
  }, []);


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
          taxSettings,
          priceSyncSettings,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo guardar la configuración.");
      }

      showToast("Configuración general guardada exitosamente.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar.";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncPricesNow = async () => {
    setIsSyncingPrices(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/general-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync_prices_now",
          priceSyncSettings,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Error al sincronizar precios.");
      }

      if (data.priceSyncSettings) {
        setPriceSyncSettings(data.priceSyncSettings);
      }

      showToast(data.message || "Precios sincronizados con éxito desde Google Sheets.");
      fetchLogs(1);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al sincronizar precios.";
      setErrorMessage(msg);
      showToast("Error en sincronización de precios.");
    } finally {
      setIsSyncingPrices(false);
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

        {/* Card: Configuración de Impuestos (I.V.A.) del Cotizador */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Impuestos y Porcentaje de I.V.A. (Cotizador)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configura el porcentaje de I.V.A. a desglosar en el cotizador del sitio web o establece precios exentos / sin I.V.A.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Modo de IVA: Con porcentaje vs Sin IVA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setTaxSettings((prev) => ({ ...prev, enabled: true }))}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                  taxSettings.enabled
                    ? "border-[var(--green-karmax)] bg-emerald-50/40 shadow-xs ring-1 ring-[var(--green-karmax)]/30"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                    taxSettings.enabled
                      ? "border-[var(--green-karmax)] bg-[var(--green-karmax)]"
                      : "border-slate-300"
                  }`}
                >
                  {taxSettings.enabled && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Aplicar Porcentaje de I.V.A.</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Calcula y desglosa el I.V.A. sobre el subtotal según el porcentaje configurado.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTaxSettings((prev) => ({ ...prev, enabled: false }))}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                  !taxSettings.enabled
                    ? "border-[var(--green-karmax)] bg-emerald-50/40 shadow-xs ring-1 ring-[var(--green-karmax)]/30"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                    !taxSettings.enabled
                      ? "border-[var(--green-karmax)] bg-[var(--green-karmax)]"
                      : "border-slate-300"
                  }`}
                >
                  {!taxSettings.enabled && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Sin I.V.A. (Exento / 0%)</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Muestra &quot;Sin IVA&quot; ($0.00) en el cotizador y calcula el total idéntico al subtotal.
                  </p>
                </div>
              </button>
            </div>

            {/* Input para especificar porcentaje cuando está activo */}
            {taxSettings.enabled && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label htmlFor="taxRate" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Porcentaje de I.V.A. a aplicar
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Ingresa un valor entre 0 y 100%
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-36">
                    <input
                      id="taxRate"
                      type="number"
                      min={0}
                      max={100}
                      step="any"
                      value={taxSettings.rate}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setTaxSettings((prev) => ({
                          ...prev,
                          rate: isNaN(val) ? 0 : Math.max(0, Math.min(100, val)),
                        }));
                      }}
                      className="w-full text-sm font-semibold p-2.5 pr-8 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20 outline-none text-slate-800 transition-all font-mono"
                    />
                    <span className="absolute right-3 top-2.5 text-sm font-bold text-slate-400 pointer-events-none">
                      %
                    </span>
                  </div>

                  {/* Botones de selección rápida */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTaxSettings((prev) => ({ ...prev, rate: 16 }))}
                      className={`text-xs px-3 py-2 rounded-lg font-medium border transition-colors cursor-pointer ${
                        taxSettings.rate === 16
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      16% (General México)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaxSettings((prev) => ({ ...prev, rate: 8 }))}
                      className={`text-xs px-3 py-2 rounded-lg font-medium border transition-colors cursor-pointer ${
                        taxSettings.rate === 8
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      8% (Zona Fronteriza)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Simulación en vivo del Cotizador */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Simulación del Desglose en Cotizaciones (Ejemplo Base: $1,000.00 MXN)
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">$1,000.00 MXN</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1.5 border-t border-slate-200">
                  <span>
                    {taxSettings.enabled && taxSettings.rate > 0
                      ? `IVA (${taxSettings.rate}%):`
                      : "IVA (Sin IVA):"}
                  </span>
                  <span className="font-semibold text-slate-800">
                    ${(taxSettings.enabled ? 1000 * (taxSettings.rate / 100) : 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-300">
                  <span>Total Estimado:</span>
                  <span className="text-[var(--green-karmax)]">
                    ${(1000 + (taxSettings.enabled ? 1000 * (taxSettings.rate / 100) : 0)).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-2">
                Este cálculo se aplica automáticamente en el cotizador del cliente, carrito lateral, confirmación por email y panel de administración.
              </p>
            </div>
          </div>
        </div>

        {/* Card: Sincronización de Precios desde Google Sheets */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[var(--green-karmax)] flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Sincronización Automática de Precios (Google Sheets)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Actualiza los precios de productos y presentaciones por SKU a la hora programada en hora de México.
                </p>
              </div>
            </div>

            {mexicoClock && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-medium border border-slate-200 self-start sm:self-auto">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>CDMX: <strong>{mexicoClock}</strong></span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* 1. Toggle Activar / Desactivar Sincronización Automática */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Sincronización Automática Diaria</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {priceSyncSettings.enabled
                    ? `El cron del sistema actualizará los precios diariamente a las ${priceSyncSettings.syncHour} (hora de México).`
                    : "La sincronización automática está pausada. Solo se ejecutarán actualizaciones manuales."}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPriceSyncSettings((prev) => ({
                    ...prev,
                    enabled: !prev.enabled,
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                  priceSyncSettings.enabled ? "bg-[var(--green-karmax)]" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    priceSyncSettings.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* 2. URL del Google Sheet */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label
                  htmlFor="sheetUrl"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  URL de Google Sheets (Publicada en CSV o Web)
                </label>
                <div className="flex items-center gap-3 text-xs">
                  {priceSyncSettings.sheetUrl && (
                    <a
                      href={priceSyncSettings.sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--blue-karmax)] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Abrir enlace</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setPriceSyncSettings((prev) => ({
                        ...prev,
                        sheetUrl: DEFAULT_SHEET_URL,
                      }))
                    }
                    className="text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Restaurar URL original
                  </button>
                </div>
              </div>

              <input
                id="sheetUrl"
                type="url"
                required
                value={priceSyncSettings.sheetUrl}
                onChange={(e) =>
                  setPriceSyncSettings((prev) => ({
                    ...prev,
                    sheetUrl: e.target.value,
                  }))
                }
                placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?gid=...&output=csv"
                className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20 outline-none text-slate-800 transition-all shadow-2xs"
              />

              <p className="text-[11px] text-slate-500 leading-relaxed">
                El sistema lee las columnas <strong>&quot;sku&quot;</strong> y <strong>&quot;Precio Lista Web (sin IVA)&quot;</strong>. Si cambias de pestaña o de archivo, asegúrate de publicarlo en <em>Archivo &gt; Compartir &gt; Publicar en la web &gt; Valores separados por comas (.csv)</em>.
              </p>
            </div>

            {/* 3. Selector de Hora de Ejecución (Hora de México) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label
                  htmlFor="syncHour"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
                >
                  Hora de Ejecución Diaria (Hora de México)
                </label>
                <select
                  id="syncHour"
                  value={priceSyncSettings.syncHour}
                  onChange={(e) =>
                    setPriceSyncSettings((prev) => ({
                      ...prev,
                      syncHour: e.target.value,
                    }))
                  }
                  className="w-full text-sm font-semibold p-3 rounded-xl border border-slate-200 bg-white focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20 outline-none text-slate-800 transition-all cursor-pointer shadow-2xs font-mono"
                >
                  {Array.from({ length: 24 }).map((_, i) => {
                    const h = String(i).padStart(2, "0");
                    const val = `${h}:00`;
                    const label = `${val} hrs ${i === 3 ? "(Recomendado de madrugada)" : ""}`;
                    return (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Zona horaria configurada: <code>America/Mexico_City</code> (UTC-6).
                </p>
              </div>

              {/* Botón de Sincronización Manual */}
              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  disabled={isSyncingPrices}
                  onClick={handleSyncPricesNow}
                  className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold p-3 rounded-xl shadow-xs transition-all duration-200 active:scale-98 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isSyncingPrices ? "animate-spin text-emerald-400" : ""}`}
                  />
                  <span>
                    {isSyncingPrices ? "Sincronizando Precios..." : "Sincronizar Precios Ahora"}
                  </span>
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-1">
                  Prueba inmediata sin esperar a la hora programada.
                </p>
              </div>
            </div>

            {/* 4. Panel de Estado y Último Reporte */}
            {priceSyncSettings.lastSyncAt && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        priceSyncSettings.lastSyncStatus === "success"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          priceSyncSettings.lastSyncStatus === "success"
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }`}
                      />
                      {priceSyncSettings.lastSyncStatus === "success"
                        ? "Última Sincronización Exitosa"
                        : "Error en Última Sincronización"}
                    </span>

                    <span className="text-xs text-slate-500">
                      {new Date(priceSyncSettings.lastSyncAt).toLocaleString("es-MX", {
                        timeZone: "America/Mexico_City",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}{" "}
                      (Hora CDMX)
                    </span>
                  </div>

                  {priceSyncSettings.lastSyncReport?.durationMs !== undefined && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      Tiempo: {priceSyncSettings.lastSyncReport.durationMs}ms
                    </span>
                  )}
                </div>

                {priceSyncSettings.lastSyncReport && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div className="bg-white p-3 rounded-lg border border-slate-200/70 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Filas en Excel
                      </span>
                      <p className="text-lg font-bold text-slate-900 mt-0.5">
                        {priceSyncSettings.lastSyncReport.totalRows}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200/70 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Productos Web
                      </span>
                      <p className="text-lg font-bold text-emerald-600 mt-0.5">
                        {priceSyncSettings.lastSyncReport.updatedProducts}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200/70 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Presentaciones
                      </span>
                      <p className="text-lg font-bold text-purple-600 mt-0.5">
                        {priceSyncSettings.lastSyncReport.updatedAttributes}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200/70 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        SKUs No Hallados
                      </span>
                      <p className="text-lg font-bold text-amber-600 mt-0.5">
                        {priceSyncSettings.lastSyncReport.notFoundCount}
                      </p>
                    </div>
                  </div>
                )}

                {/* SKUs no encontrados desplegable */}
                {priceSyncSettings.lastSyncReport &&
                  priceSyncSettings.lastSyncReport.notFoundCount > 0 &&
                  priceSyncSettings.lastSyncReport.sampleNotFound && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => setShowNotFoundSkus((prev) => !prev)}
                        className="text-xs text-amber-700 hover:text-amber-900 font-medium inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>
                          {showNotFoundSkus ? "Ocultar" : "Ver"} SKUs del Excel sin producto asociado en la web ({priceSyncSettings.lastSyncReport.notFoundCount})
                        </span>
                        {showNotFoundSkus ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {showNotFoundSkus && (
                        <div className="mt-2 p-2.5 rounded-lg bg-white border border-amber-200/80 text-xs font-mono text-slate-700 space-y-1">
                          <p className="text-[11px] text-slate-500 font-sans mb-1">
                            Estos códigos existen en el Google Sheet pero aún no tienen un producto o presentación dada de alta en el catálogo:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {priceSyncSettings.lastSyncReport.sampleNotFound.map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 bg-amber-50 text-amber-900 rounded border border-amber-200 text-[11px]"
                              >
                                {s}
                              </span>
                            ))}
                            {priceSyncSettings.lastSyncReport.notFoundCount >
                              priceSyncSettings.lastSyncReport.sampleNotFound.length && (
                              <span className="px-2 py-0.5 text-slate-400 text-[11px]">
                                y{" "}
                                {priceSyncSettings.lastSyncReport.notFoundCount -
                                  priceSyncSettings.lastSyncReport.sampleNotFound.length}{" "}
                                más...
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* Card: Historial y Auditoría de Sincronizaciones */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--blue-karmax)] flex items-center justify-center flex-shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Historial y Auditoría de Sincronizaciones
                  </h3>
                  {totalLogs > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                      {totalLogs} {totalLogs === 1 ? "registro" : "registros"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registro detallado de cada ejecución automática o manual: momento, productos, SKUs actualizados, errores y duración.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {totalLogs > 0 && (
                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 text-xs font-medium transition-colors cursor-pointer"
                  title="Vaciar todo el historial"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Vaciar</span>
                </button>
              )}
              <button
                type="button"
                disabled={logsLoading}
                onClick={() => fetchLogs(logsPage)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-slate-500 ${logsLoading ? "animate-spin" : ""}`}
                />
                <span>Actualizar</span>
              </button>
            </div>
          </div>

          {/* Filtros de estado */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
              <button
                type="button"
                onClick={() => setLogsFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  logsFilter === "all"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Todos ({totalLogs})
              </button>
              <button
                type="button"
                onClick={() => setLogsFilter("success")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  logsFilter === "success"
                    ? "bg-white text-emerald-700 shadow-2xs"
                    : "text-slate-600 hover:text-emerald-700"
                }`}
              >
                Exitosos
              </button>
              <button
                type="button"
                onClick={() => setLogsFilter("error")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  logsFilter === "error"
                    ? "bg-white text-red-700 shadow-2xs"
                    : "text-slate-600 hover:text-red-700"
                }`}
              >
                Fallidos
              </button>
            </div>
          </div>

          {/* Lista de Registros */}
          {logsLoading && syncLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--blue-karmax)]" />
              <p className="text-xs">Cargando registros de auditoría...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Sin ejecuciones registradas</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Las sincronizaciones automáticas diarias o manuales quedarán auditadas aquí con el detalle de cada SKU actualizado.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const totalUpdated =
                  log.updatedProducts + log.updatedAttributes + log.updatedVariants;
                const isSuccess = log.status === "success";

                return (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-2xs transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Estado */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isSuccess
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSuccess ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                          {isSuccess ? "Exitosa" : "Error"}
                        </span>

                        {/* Disparador */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            log.triggerType === "manual"
                              ? "bg-blue-50 text-blue-700 border-blue-200/80"
                              : "bg-purple-50 text-purple-700 border-purple-200/80"
                          }`}
                        >
                          {log.triggerType === "manual" ? "Manual (Admin)" : "Automática (Cron)"}
                        </span>

                        {/* Momento */}
                        <span className="text-xs text-slate-600 font-medium">
                          {formatDateCdmx(log.executedAt)} (CDMX)
                        </span>

                        <span className="text-xs text-slate-400">
                          • {formatTimeAgo(log.executedAt)}
                        </span>
                      </div>

                      {/* Duración */}
                      <span className="text-[11px] font-mono text-slate-400 self-start sm:self-auto">
                        {log.durationMs}ms
                      </span>
                    </div>

                    {/* Resumen / Métricas */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span>
                          Filas: <strong className="text-slate-800">{log.totalRows}</strong>
                        </span>
                        <span>
                          Productos:{" "}
                          <strong className="text-emerald-600">{log.updatedProducts}</strong>
                        </span>
                        <span>
                          Presentaciones:{" "}
                          <strong className="text-purple-600">{log.updatedAttributes}</strong>
                        </span>
                        <span>
                          Variantes:{" "}
                          <strong className="text-indigo-600">{log.updatedVariants}</strong>
                        </span>
                        {log.notFoundCount > 0 && (
                          <span>
                            No hallados:{" "}
                            <strong className="text-amber-600">{log.notFoundCount}</strong>
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLogDetail(log);
                          setSkuSearchInLog("");
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--blue-karmax)] hover:text-blue-800 transition-colors cursor-pointer self-end sm:self-auto"
                      >
                        <span>Ver Detalle</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Mensaje o Error */}
                    {log.message && (
                      <p
                        className={`text-xs leading-relaxed truncate ${
                          isSuccess ? "text-slate-500" : "text-red-600 font-medium"
                        }`}
                      >
                        {log.message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginación simple */}
          {totalLogs > 10 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span>
                Página {logsPage} de {Math.ceil(totalLogs / 10) || 1}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={logsPage <= 1 || logsLoading}
                  onClick={() => fetchLogs(logsPage - 1)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={logsPage >= Math.ceil(totalLogs / 10) || logsLoading}
                  onClick={() => fetchLogs(logsPage + 1)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
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

      {/* Modal: Detalle de Ejecución de Sincronización */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    selectedLogDetail.status === "success"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedLogDetail.status === "success" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Auditoría de Sincronización #{selectedLogDetail.id}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{formatDateCdmx(selectedLogDetail.executedAt)} (CDMX)</span>
                    <span>•</span>
                    <span>{formatTimeAgo(selectedLogDetail.executedAt)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLogDetail(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Badges de Estado y Disparador */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold ${
                      selectedLogDetail.status === "success"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedLogDetail.status === "success"
                      ? "Completado con Éxito"
                      : "Ejecución con Fallos"}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium border ${
                      selectedLogDetail.triggerType === "manual"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-purple-50 text-purple-700 border-purple-200"
                    }`}
                  >
                    Disparador:{" "}
                    {selectedLogDetail.triggerType === "manual"
                      ? "Manual (Admin)"
                      : "Automático (Cron)"}
                  </span>
                </div>

                <span className="font-mono text-slate-500">
                  Duración: <strong>{selectedLogDetail.durationMs}ms</strong>
                </span>
              </div>

              {/* Mensaje / Error */}
              {selectedLogDetail.message && (
                <div
                  className={`p-3.5 rounded-xl border ${
                    selectedLogDetail.status === "success"
                      ? "bg-emerald-50/50 border-emerald-200/80 text-emerald-900"
                      : "bg-red-50/70 border-red-200 text-red-900"
                  }`}
                >
                  <p className="font-medium">{selectedLogDetail.message}</p>
                  {selectedLogDetail.errorDetails && (
                    <pre className="mt-2 p-2 bg-white/80 rounded border border-red-200 text-[11px] font-mono text-red-800 overflow-x-auto whitespace-pre-wrap">
                      {selectedLogDetail.errorDetails}
                    </pre>
                  )}
                </div>
              )}

              {/* Métricas clave */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Filas Leídas</span>
                  <p className="text-base font-bold text-slate-800 mt-0.5">
                    {selectedLogDetail.totalRows}
                  </p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Productos</span>
                  <p className="text-base font-bold text-emerald-600 mt-0.5">
                    {selectedLogDetail.updatedProducts}
                  </p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Presentaciones</span>
                  <p className="text-base font-bold text-purple-600 mt-0.5">
                    {selectedLogDetail.updatedAttributes}
                  </p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400">No Hallados</span>
                  <p className="text-base font-bold text-amber-600 mt-0.5">
                    {selectedLogDetail.notFoundCount}
                  </p>
                </div>
              </div>

              {/* URL utilizada */}
              {selectedLogDetail.sheetUrl && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    URL de Google Sheets utilizada
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-mono text-slate-600 truncate">
                      {selectedLogDetail.sheetUrl}
                    </p>
                    <a
                      href={selectedLogDetail.sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--blue-karmax)] hover:underline inline-flex items-center gap-1 text-xs flex-shrink-0"
                    >
                      <span>Abrir</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Detalle de SKUs Actualizados */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                    <span>
                      SKUs y Precios Modificados (
                      {selectedLogDetail.details?.updatedSkus?.length || 0})
                    </span>
                  </h5>

                  {selectedLogDetail.details?.updatedSkus &&
                    selectedLogDetail.details.updatedSkus.length > 5 && (
                      <div className="relative">
                        <input
                          type="text"
                          value={skuSearchInLog}
                          onChange={(e) => setSkuSearchInLog(e.target.value)}
                          placeholder="Buscar SKU o producto..."
                          className="text-xs pl-2.5 pr-2 py-1 rounded-lg border border-slate-200 bg-white focus:border-[var(--green-karmax)] outline-none w-48"
                        />
                      </div>
                    )}
                </div>

                {selectedLogDetail.details?.updatedSkus &&
                selectedLogDetail.details.updatedSkus.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold sticky top-0">
                        <tr>
                          <th className="p-2.5">SKU</th>
                          <th className="p-2.5">Producto / Presentación</th>
                          <th className="p-2.5">Tipo</th>
                          <th className="p-2.5 text-right">Variación de Precio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {updatedSkusFiltered.map((item, idx) => (
                          <tr key={`${item.sku}-${idx}`} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-mono font-bold text-slate-800">
                              {item.sku}
                            </td>
                            <td className="p-2.5 text-slate-700 truncate max-w-xs">
                              {item.name || "—"}
                            </td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                                {item.target === "product"
                                  ? "Producto"
                                  : item.target === "attribute"
                                  ? "Presentación"
                                  : "Variante"}
                              </span>
                            </td>
                            <td className="p-2.5 text-right font-mono">
                              {item.oldPrice ? (
                                <div className="inline-flex items-center gap-1">
                                  <span className="line-through text-slate-400">
                                    ${item.oldPrice}
                                  </span>
                                  <ArrowRight className="w-3 h-3 text-slate-400" />
                                  <strong className="text-emerald-600">${item.newPrice}</strong>
                                </div>
                              ) : (
                                <strong className="text-emerald-600">${item.newPrice}</strong>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-500 text-center">
                    <p>
                      No hubo variaciones de precio en esta ejecución (todos los precios en el
                      catálogo ya coincidían con el Google Sheet).
                    </p>
                  </div>
                )}
              </div>

              {/* Detalle de SKUs No Encontrados */}
              {selectedLogDetail.notFoundCount > 0 &&
                selectedLogDetail.details?.notFoundSkus &&
                selectedLogDetail.details.notFoundSkus.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h5 className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-amber-600" />
                      <span>
                        SKUs del Google Sheet sin correspondencia en la web (
                        {selectedLogDetail.notFoundCount})
                      </span>
                    </h5>
                    <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {selectedLogDetail.details.notFoundSkus.map((sku) => (
                        <span
                          key={sku}
                          className="px-2 py-0.5 bg-white text-amber-900 rounded border border-amber-200 text-[11px] font-mono"
                        >
                          {sku}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLogDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
