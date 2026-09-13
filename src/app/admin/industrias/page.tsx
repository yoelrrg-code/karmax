"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Factory,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Upload,
} from "lucide-react";

interface IndustryData {
  id: number;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  iconUrl: string | null;
  orderIndex: number;
  isActive: boolean;
  productsCount: number;
}

export default function AdminIndustriesPage() {
  const [industries, setIndustries] = useState<IndustryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<IndustryData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    iconName: "Building2",
    iconUrl: "",
    orderIndex: 0,
    isActive: true,
  });

  const loadIndustries = async () => {
    try {
      const res = await fetch("/api/admin/industries");
      if (res.ok) {
        const data = await res.json();
        setIndustries(data.industries || []);
      }
    } catch (err) {
      console.error("Error loading industries:", err);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/industries");
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setIndustries(data.industries || []);
          }
        }
      } catch (err) {
        console.error("Error loading industries:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingIndustry(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      iconName: "Building2",
      iconUrl: "",
      orderIndex: industries.length,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ind: IndustryData) => {
    setEditingIndustry(ind);
    setFormData({
      name: ind.name,
      slug: ind.slug,
      description: ind.description || "",
      iconName: ind.iconName || "Building2",
      iconUrl: ind.iconUrl || "",
      orderIndex: ind.orderIndex,
      isActive: Boolean(ind.isActive),
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug:
        !editingIndustry
          ? val
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "")
          : prev.slug,
    }));
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setFormData((prev) => ({ ...prev, iconUrl: data.url }));
        showToast("Ícono subido con éxito");
      }
    } catch {
      showToast("Error al subir ícono");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      const url = editingIndustry
        ? `/api/admin/industries/${editingIndustry.id}`
        : "/api/admin/industries";
      const method = editingIndustry ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast(
          editingIndustry
            ? "Industria actualizada con éxito"
            : "Industria creada con éxito"
        );
        setIsModalOpen(false);
        loadIndustries();
      } else {
        const errData = await res.json();
        showToast(errData.error || "Error al procesar industria");
      }
    } catch {
      showToast("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (ind: IndustryData) => {
    if (
      !confirm(
        `¿Estás seguro de eliminar la industria "${ind.name}"? Si contiene productos asociados, será desactivada.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/industries/${ind.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Industria eliminada / desactivada");
        loadIndustries();
      }
    } catch {
      showToast("Error al eliminar industria");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
            <Factory className="w-6 h-6 text-[var(--dark-blue-karmax)]" />
            Sectores Industriales
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Configura los sectores e industrias atendidos por KARMAX.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Industria</span>
        </button>
      </div>

      {/* Industries Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Ícono</th>
                <th className="px-5 py-3.5">Nombre / Slug</th>
                <th className="px-5 py-3.5">Descripción</th>
                <th className="px-5 py-3.5 text-center">Productos</th>
                <th className="px-5 py-3.5 text-center">Orden</th>
                <th className="px-5 py-3.5 text-center">Estado</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Cargando industrias...
                  </td>
                </tr>
              ) : industries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No hay industrias registradas.
                  </td>
                </tr>
              ) : (
                industries.map((ind) => (
                  <tr key={ind.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="w-10 h-10 relative bg-slate-100 rounded-xl p-1.5 flex items-center justify-center border border-slate-200">
                        {ind.iconUrl ? (
                          <Image
                            src={ind.iconUrl}
                            alt={ind.name}
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        ) : (
                          <Factory className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 text-sm">{ind.name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">/{ind.slug}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 max-w-xs line-clamp-2">
                      {ind.description}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-xs">
                        {ind.productsCount}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono text-xs text-slate-600">
                      {ind.orderIndex}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          ind.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {ind.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(ind)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(ind)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                {editingIndustry ? "Editar Industria" : "Nueva Industria"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Sector / Industria *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Ej: Hoteles y hospitalidad"
                  className="w-full text-xs p-2.5 rounded-xl text-[var(--blue-karmax)] border border-slate-200 focus:outline-none focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Slug (URL amigable) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="ej: hoteles-y-hospitalidad"
                  className="w-full text-xs p-2.5 rounded-xl text-[var(--blue-karmax)] border border-slate-200 font-mono text-slate-700 focus:outline-none focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Soluciones orientadas a este sector..."
                  className="w-full text-xs p-2.5 rounded-xl text-[var(--blue-karmax)] border border-slate-200 focus:outline-none focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ícono SVG de la Industria
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.iconUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, iconUrl: e.target.value }))
                    }
                    placeholder="/icons/ico-hoteles.svg o URL"
                    className="flex-1 text-xs p-2.5 rounded-xl text-[var(--blue-karmax)] border border-slate-200 focus:outline-none focus:border-[var(--green-karmax)]"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir</span>
                    <input
                      type="file"
                      accept=".svg,image/*"
                      className="hidden"
                      onChange={handleIconUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    value={formData.orderIndex}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        orderIndex: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full text-xs p-2.5 rounded-xl text-[var(--blue-karmax)] border border-slate-200 font-mono"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      className="rounded-sm text-[var(--green-karmax)] focus:ring-[var(--green-karmax)]"
                    />
                    <span>Activa</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white shadow-xs transition-all cursor-pointer"
                >
                  {isSaving
                    ? "Guardando..."
                    : editingIndustry
                    ? "Guardar Cambios"
                    : "Crear Industria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
