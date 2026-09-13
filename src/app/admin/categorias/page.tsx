"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Upload,
  Layers,
} from "lucide-react";

interface CategoryData {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  featured: boolean;
  orderIndex: number;
  isActive: boolean;
  productsCount: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    featured: false,
    orderIndex: 0,
    isActive: true,
  });

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/categories");
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setCategories(data.categories || []);
          }
        }
      } catch (err) {
        console.error("Error loading categories:", err);
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
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      featured: false,
      orderIndex: categories.length,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryData) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      imageUrl: cat.imageUrl || "",
      featured: Boolean(cat.featured),
      orderIndex: cat.orderIndex,
      isActive: Boolean(cat.isActive),
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug:
        !editingCategory
          ? val
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "")
          : prev.slug,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "products");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        showToast("Imagen subida con éxito");
      }
    } catch {
      showToast("Error al subir imagen");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast(
          editingCategory
            ? "Categoría actualizada con éxito"
            : "Categoría creada con éxito"
        );
        setIsModalOpen(false);
        loadCategories();
      } else {
        const errData = await res.json();
        showToast(errData.error || "Error al procesar categoría");
      }
    } catch {
      showToast("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cat: CategoryData) => {
    if (
      !confirm(
        `¿Estás seguro de eliminar la categoría "${cat.name}"? Si contiene productos, será desactivada.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Categoría eliminada / desactivada");
        loadCategories();
      }
    } catch {
      showToast("Error al eliminar categoría");
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
            <FolderTree className="w-6 h-6 text-[var(--dark-blue-karmax)]" />
            Líneas y Categorías
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona las categorías donde se agrupan los productos de KARMAX.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Imagen</th>
                <th className="px-5 py-3.5">Nombre / Slug</th>
                <th className="px-5 py-3.5 text-center">Productos</th>
                <th className="px-5 py-3.5 text-center">Destacada (Home)</th>
                <th className="px-5 py-3.5 text-center">Orden</th>
                <th className="px-5 py-3.5 text-center">Estado</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Cargando categorías...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No hay categorías registradas.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="w-12 h-12 relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                        {cat.imageUrl ? (
                          <Image
                            src={cat.imageUrl}
                            alt={cat.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Layers className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 text-sm">{cat.name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">/{cat.slug}</p>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-[var(--dark-blue-karmax)] font-bold text-xs">
                        {cat.productsCount}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {cat.featured ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
                          ★ Sí (Home)
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono text-xs text-slate-600">
                      {cat.orderIndex}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          cat.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {cat.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
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

      {/* Create / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-lg font-bold text-[var(--blue-karmax)]">
                {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
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
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Ej: Limpieza general"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 text-[var(--blue-karmax)] focus:outline-none focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20"
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
                  placeholder="ej: limpieza-general"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono text-[var(--blue-karmax)] focus:outline-none focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20"
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
                  placeholder="Breve reseña sobre los productos de esta categoría..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 text-[var(--blue-karmax)] focus:outline-none focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20"
                />
              </div>

              {/* Image Input & Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Imagen de la Categoría (Portada de la card)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                    }
                    placeholder="/images/products/... o URL externa"
                    className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 text-[var(--blue-karmax)] focus:outline-none focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-[var(--blue-karmax)] rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                {formData.imageUrl && (
                  <div className="w-20 h-20 relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                    <Image
                      src={formData.imageUrl}
                      alt="Vista previa"
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                )}
              </div>

              {/* Options: Featured, Order, Active */}
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
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 text-[var(--blue-karmax)] font-mono"
                  />
                </div>

                <div className="flex flex-col justify-center space-y-2 pt-2">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--blue-karmax)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          featured: e.target.checked,
                        }))
                      }
                      className="rounded-sm text-[var(--green-karmax)] focus:ring-[var(--green-karmax)]"
                    />
                    <span>Destacada en Home</span>
                  </label>

                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--blue-karmax)] cursor-pointer">
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

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--blue-karmax)] hover:bg-slate-100 transition-colors"
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
                    : editingCategory
                    ? "Guardar Cambios"
                    : "Crear Categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
