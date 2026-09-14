"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Mail,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [notificationEmail, setNotificationEmail] = useState("");
  const [defaultEnvEmail, setDefaultEnvEmail] = useState("");
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/general-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo guardar la configuración.");
      }

      showToast("Configuración guardada exitosamente.");
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

          {/* Botón Guardar */}
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
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
