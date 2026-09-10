"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X } from "lucide-react";

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("register");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      if (activeTab === "login") {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMsg(res.error || "Error al iniciar sesión.");
        }
      } else {
        if (!name.trim()) {
          setErrorMsg("Ingresa tu nombre completo.");
          setIsSubmitting(false);
          return;
        }
        if (!email.trim() || !password) {
          setErrorMsg("Correo y contraseña son requeridos.");
          setIsSubmitting(false);
          return;
        }
        const res = await register({
          name,
          email,
          phone,
          companyName,
          password,
        });
        if (!res.success) {
          setErrorMsg(res.error || "Error al crear la cuenta.");
        }
      }
    } catch {
      setErrorMsg("Ocurrió un error inesperado. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-[var(--dark-blue-karmax)]">
            {activeTab === "register" ? "Crear cuenta de cliente" : "Iniciar sesión"}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {activeTab === "register"
              ? "Regístrate para guardar o enviar tu cotización"
              : "Ingresa a tu cuenta para continuar con tu cotización"}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-full mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setErrorMsg("");
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all cursor-pointer ${
              activeTab === "register"
                ? "bg-white text-[var(--dark-blue-karmax)] shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Registrarse
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setErrorMsg("");
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all cursor-pointer ${
              activeTab === "login"
                ? "bg-white text-[var(--dark-blue-karmax)] shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Iniciar sesión
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {activeTab === "register" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20 outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Empresa (opcional)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ej. Limpieza del Norte S.A."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20 outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. 81 1234 5678"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20 outline-none text-sm transition-all"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Correo electrónico *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@empresa.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20 outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contraseña *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20 outline-none text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Procesando..."
              : activeTab === "register"
              ? "Crear cuenta y continuar"
              : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};
