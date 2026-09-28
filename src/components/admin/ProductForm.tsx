"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Save,
  Star,
  FileText,
  Globe,
  Layers,
  Plus,
  RefreshCw,
} from "lucide-react";
import { sileo } from "sileo";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

interface CategoryOption {
  id: number;
  name: string;
}

interface IndustryOption {
  id: number;
  name: string;
}

interface ImageItem {
  id?: number;
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

interface AttributeItem {
  id?: number;
  name: string;
  value: string;
  sku?: string;
  attrPrice?: string | number;
}

export interface VariantItem {
  id?: number;
  sku: string;
  price?: string | number;
  stockStatus: string;
  attributes: Record<string, string>;
}

export interface ProductOption {
  name: string;
  values: string;
}

interface DocumentItem {
  id?: number;
  title: string;
  fileUrl: string;
  fileType?: string;
}

interface ProductFormProps {
  initialProductId?: number;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialProductId }) => {
  const router = useRouter();
  const isEditing = Boolean(initialProductId);

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [industries, setIndustries] = useState<IndustryOption[]>([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [brand, setBrand] = useState("");
  const [unit, setUnit] = useState("Pieza");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stockStatus, setStockStatus] = useState("instock");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState("");

  // SEO State
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedIndustryIds, setSelectedIndustryIds] = useState<number[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [attributes, setAttributes] = useState<AttributeItem[]>([]);
  const [variants, setVariants] = useState<VariantItem[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  // Load categories and industries
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catsRes, indsRes] = await Promise.all([
          fetch("/api/admin/categories"),
          fetch("/api/admin/industries"),
        ]);
        if (catsRes.ok) {
          const cData = await catsRes.json();
          setCategories(cData.categories || []);
        }
        if (indsRes.ok) {
          const iData = await indsRes.json();
          setIndustries(iData.industries || []);
        }
      } catch (err) {
        console.error("Error loading options:", err);
      }
    }
    loadMeta();
  }, []);

  // Load existing product if editing
  useEffect(() => {
    let ignore = false;
    async function loadProduct() {
      if (!initialProductId) return;
      try {
        const res = await fetch(`/api/admin/products/${initialProductId}`);
        if (res.ok) {
          const data = await res.json();
          const p = data.product;
          if (!ignore && p) {
            setName(p.name || "");
            setSlug(p.slug || "");
            setSku(p.sku || "");
            setBrand(p.brand || "");
            setUnit(p.unit || "Pieza");
            setCategoryId(p.categoryId || "");
            setRegularPrice(p.regularPrice ? String(p.regularPrice) : "");
            setSalePrice(p.salePrice ? String(p.salePrice) : "");
            setStockStatus(p.stockStatus || "instock");
            setIsFeatured(Boolean(p.isFeatured));
            setIsActive(Boolean(p.isActive));
            setShortDescription(p.shortDescription || "");
            setDescription(p.description || "");
            setDeliveryInfo(p.deliveryInfo || "");
            setMetaTitle(p.metaTitle || "");
            setMetaDescription(p.metaDescription || "");
            setMetaKeywords(p.metaKeywords || "");

            const loadedCats = Array.from(
              new Set([
                ...(data.categoryIds || []),
                ...(p.categoryId ? [Number(p.categoryId)] : []),
              ])
            ).filter(Boolean);
            setSelectedCategoryIds(loadedCats);
            setCategoryId(p.categoryId ? Number(p.categoryId) : (loadedCats[0] || ""));
            setSelectedIndustryIds(data.industryIds || []);
            if (data.images && data.images.length > 0) {
              const explicitPrimaryIndex = data.images.findIndex((i: ImageItem) => Boolean(i.isPrimary));
              const primaryIdx = explicitPrimaryIndex >= 0 ? explicitPrimaryIndex : 0;
              setImages(
                data.images.map((img: ImageItem, idx: number) => ({
                  ...img,
                  isPrimary: idx === primaryIdx,
                }))
              );
            } else if (p.imageUrl) {
              setImages([{ url: p.imageUrl, isPrimary: true }]);
            } else {
              setImages([]);
            }
            setAttributes(data.attributes || []);
            setDocuments(data.documents || []);

            if (data.variants && data.variants.length > 0) {
              const loadedVariants: VariantItem[] = data.variants.map((v: any) => ({
                id: v.id,
                sku: v.sku || "",
                price: v.price || "",
                stockStatus: v.stockStatus || "instock",
                attributes:
                  typeof v.attributes === "string"
                    ? JSON.parse(v.attributes)
                    : v.attributes || {},
              }));
              setVariants(loadedVariants);

              const optMap: Record<string, Set<string>> = {};
              for (const v of loadedVariants) {
                if (v.attributes && typeof v.attributes === "object") {
                  for (const [k, val] of Object.entries(v.attributes)) {
                    if (!optMap[k]) optMap[k] = new Set();
                    if (val) optMap[k].add(String(val));
                  }
                }
              }
              setProductOptions(
                Object.entries(optMap).map(([name, set]) => ({
                  name,
                  values: Array.from(set).join(", "),
                }))
              );
            } else if (data.attributes && data.attributes.length > 0) {
              const convertedVariants: VariantItem[] = data.attributes.map(
                (attr: AttributeItem, idx: number) => ({
                  sku: attr.sku || "",
                  price: attr.attrPrice || "",
                  stockStatus: "instock",
                  attributes: { [attr.name || "Presentación"]: attr.value },
                })
              );
              setVariants(convertedVariants);

              const optMap: Record<string, Set<string>> = {};
              for (const a of data.attributes) {
                const key = a.name || "Presentación";
                if (!optMap[key]) optMap[key] = new Set();
                if (a.value) optMap[key].add(a.value);
              }
              setProductOptions(
                Object.entries(optMap).map(([name, set]) => ({
                  name,
                  values: Array.from(set).join(", "),
                }))
              );
            }
          }
        }
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    if (initialProductId) {
      loadProduct();
    }
    return () => {
      ignore = true;
    };
  }, [initialProductId]);


  const handleToggleCategory = (catId: number, isChecked: boolean) => {
    if (isChecked) {
      setSelectedCategoryIds((prev) => {
        const next = [...prev, catId];
        if (!categoryId) {
          setCategoryId(catId);
        }
        return next;
      });
    } else {
      setSelectedCategoryIds((prev) => {
        const next = prev.filter((id) => id !== catId);
        if (Number(categoryId) === catId) {
          setCategoryId(next.length > 0 ? next[0] : "");
        }
        return next;
      });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isEditing) {
      const generated = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
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
        setImages((prev) => [
          ...prev,
          { url: data.url, alt: name, isPrimary: prev.length === 0 },
        ]);
        sileo.success({ title: "Imagen subida", description: "Imagen subida exitosamente" });
      }
    } catch {
      sileo.error({ title: "Error", description: "Error al subir imagen" });
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      }))
    );
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (updated.length > 0 && !updated.some((i) => i.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  // Attributes / Variations Management
  const handleAddAttribute = () => {
    setAttributes((prev) => [
      ...prev,
      {
        name: "Presentaciones",
        value: "",
        sku: sku ? `${sku}-${prev.length + 1}` : "",
        attrPrice: regularPrice || "",
      },
    ]);
  };

  const handleUpdateAttribute = (
    index: number,
    field: keyof AttributeItem,
    val: string | number
  ) => {
    setAttributes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Documents Management
  const handleAddDocument = () => {
    setDocuments((prev) => [
      ...prev,
      { title: "Ficha Técnica", fileUrl: "", fileType: "pdf" },
    ]);
  };

  const handleUpdateDocument = (
    index: number,
    field: keyof DocumentItem,
    val: string
  ) => {
    setDocuments((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
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
        handleUpdateDocument(index, "fileUrl", data.url);
        sileo.success({ title: "Documento subido", description: "Documento subido con éxito" });
      }
    } catch {
      sileo.error({ title: "Error", description: "Error al subir archivo" });
    }
  };

  // Variations & Options Management
  const handleAddOption = () => {
    setProductOptions((prev) => [...prev, { name: "", values: "" }]);
  };

  const handleUpdateOption = (
    index: number,
    field: keyof ProductOption,
    value: string
  ) => {
    setProductOptions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveOption = (index: number) => {
    setProductOptions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleGenerateVariantsFromOptions = () => {
    const validOptions = productOptions
      .map((opt) => ({
        name: opt.name.trim(),
        values: opt.values.split(",").map((v) => v.trim()).filter(Boolean),
      }))
      .filter((opt) => opt.name && opt.values.length > 0);

    if (validOptions.length === 0) {
      sileo.error({
        title: "Opciones incompletas",
        description: "Ingresa al menos una opción (ej: Presentación) con valores separados por coma.",
      });
      return;
    }

    // Calcular producto cartesiano
    const combinations: Record<string, string>[] = validOptions.reduce<Record<string, string>[]>(
      (acc, opt) => {
        if (acc.length === 0) {
          return opt.values.map((val) => ({ [opt.name]: val }));
        }
        const next: Record<string, string>[] = [];
        for (const existingComb of acc) {
          for (const val of opt.values) {
            next.push({ ...existingComb, [opt.name]: val });
          }
        }
        return next;
      },
      []
    );

    // Fusionar con variantes existentes para preservar SKUs y precios ya ingresados
    const newVariants: VariantItem[] = combinations.map((comb) => {
      const matched = variants.find((v) =>
        Object.entries(comb).every(([k, val]) => v.attributes[k] === val)
      );

      if (matched) return matched;

      const basePrefix = sku ? sku.trim() : "SKU";
      const tags = Object.values(comb)
        .map((v) => v.replace(/\s+/g, "").toUpperCase().slice(0, 3))
        .join("-");

      return {
        sku: `${basePrefix}-${tags}`,
        price: regularPrice || "",
        stockStatus: "instock",
        attributes: comb,
      };
    });

    setVariants(newVariants);
    sileo.success({
      title: "Matriz generada",
      description: `Se calcularon ${newVariants.length} combinaciones de variantes.`,
    });
  };

  const handleAddManualVariant = () => {
    const defaultAttrs: Record<string, string> = {};
    for (const opt of productOptions) {
      if (opt.name.trim()) {
        const firstVal = opt.values.split(",")[0]?.trim();
        if (firstVal) defaultAttrs[opt.name.trim()] = firstVal;
      }
    }
    if (Object.keys(defaultAttrs).length === 0) {
      defaultAttrs["Presentación"] = "";
    }

    setVariants((prev) => [
      ...prev,
      {
        sku: sku ? `${sku}-${prev.length + 1}` : "",
        price: regularPrice || "",
        stockStatus: "instock",
        attributes: defaultAttrs,
      },
    ]);
  };

  const handleUpdateVariant = (
    index: number,
    field: keyof VariantItem,
    value: any
  ) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      sileo.warning({ title: "Campo requerido", description: "El nombre del producto es obligatorio" });
      return;
    }
    if (selectedCategoryIds.length === 0) {
      sileo.warning({ title: "Categoría requerida", description: "Selecciona al menos una categoría para el producto" });
      return;
    }
    if (!categoryId || !selectedCategoryIds.includes(Number(categoryId))) {
      sileo.warning({ title: "Categoría inválida", description: "Selecciona la categoría principal entre las seleccionadas" });
      return;
    }

    setIsSaving(true);
    try {
      const primaryImg = images.find((i) => i.isPrimary)?.url || images[0]?.url || "";

      // Derivar atributos planos para consumidores legados
      const derivedAttributes: AttributeItem[] = [];
      for (const v of variants) {
        if (v.attributes && typeof v.attributes === "object") {
          for (const [attrName, value] of Object.entries(v.attributes)) {
            if (!derivedAttributes.some((a) => a.name === attrName && a.value === value)) {
              derivedAttributes.push({
                name: attrName,
                value,
                sku: v.sku,
                attrPrice: v.price,
              });
            }
          }
        }
      }

      const payload = {
        name,
        slug,
        sku,
        brand: brand.trim() || null,
        unit,
        categoryId: Number(categoryId),
        regularPrice: regularPrice || null,
        salePrice: salePrice || null,
        stockStatus,
        isFeatured,
        isActive,
        shortDescription,
        description,
        deliveryInfo,
        metaTitle: metaTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
        metaKeywords: metaKeywords.trim() || null,
        imageUrl: primaryImg,
        categoryIds: selectedCategoryIds,
        industryIds: selectedIndustryIds,
        images,
        attributes: derivedAttributes.length > 0 ? derivedAttributes : attributes,
        variants,
        documents,
      };

      const url = isEditing
        ? `/api/admin/products/${initialProductId}`
        : "/api/admin/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        sileo.success({
          title: isEditing ? "Cambios guardados" : "Producto creado",
          description: isEditing
            ? "Los cambios se guardaron exitosamente"
            : "El producto se ha creado correctamente",
        });
        router.refresh();

        // Si se acaba de crear un nuevo producto, redirigir a su formulario de edición
        if (!isEditing && data?.productId) {
          setTimeout(() => {
            router.push(`/admin/productos/${data.productId}`);
          }, 800);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        sileo.error({
          title: "Error al guardar",
          description: errData.error || "No se pudo procesar el producto",
        });
      }
    } catch {
      sileo.error({
        title: "Error de conexión",
        description: "Ocurrió un problema de red al guardar el producto",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-slate-400">Cargando producto...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">

      {/* Header Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/productos"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              {isEditing ? `Editar: ${name}` : "Nuevo Producto"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Completa los datos del producto, sus imágenes y variaciones
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/productos"
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-xs font-semibold py-2.5 px-5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Guardando..." : isEditing ? "Guardar Cambios" : "Publicar Producto"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Basic Info, Prices, Attributes, Gallery (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Datos Básicos */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3">
              Información General
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="Ej: Limpiador multiusos"
                className="w-full text-xs sm:text-sm p-3 rounded-xl text-[var(--blue-karmax)] border border-slate-200 focus:outline-none focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="limpiador-multiusos"
                  className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200 font-mono text-slate-600 focus:outline-none focus:border-[var(--green-karmax)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SKU Base
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="KMX-0001"
                  className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 uppercase focus:outline-none focus:border-[var(--green-karmax)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Marca
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ej: KARMAX (opcional)"
                  className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200 uppercase focus:outline-none focus:border-[var(--green-karmax)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción Corta
              </label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Resumen para tarjetas de producto y metadatos..."
                className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[var(--green-karmax)]"
              />
            </div>

            <div>
              <RichTextEditor
                label="Descripción Detallada (Rich Text)"
                value={description}
                onChange={setDescription}
                placeholder="Escribe la descripción completa del producto, especificaciones, modo de empleo..."
                minHeight="220px"
                helperText="Formato enriquecido: negrita, viñetas, títulos y enlaces compatibles con el frontend."
              />
            </div>

            <div>
              <RichTextEditor
                label="Información de Entrega y Logística (Rich Text)"
                value={deliveryInfo}
                onChange={setDeliveryInfo}
                placeholder="Escribe la información de envíos, tiempos de entrega, cobertura (ej. lista con viñetas)..."
                minHeight="140px"
                helperText="Usa listas con viñetas para que se muestren automáticamente con iconos de verificación en el frontend."
              />
            </div>
          </div>

          {/* Card 2: Precios e Inventario */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3">
              Precios e Inventario Base
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Precio Regular ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={regularPrice}
                  onChange={(e) => setRegularPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-[var(--green-karmax)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Precio de Oferta / Sale ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="0.00 (opcional)"
                  className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-[var(--green-karmax)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unidad de Medida
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Pieza, Litro, Galón..."
                  className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[var(--green-karmax)]"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Variaciones y SKUs (Matriz de Variantes) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[var(--green-karmax)]" />
                  Variantes y Opciones del Producto
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gestiona dimensiones (ej: Aroma, Presentación) y asigna SKU y precio específico a cada combinación.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                {variants.length} {variants.length === 1 ? "variante" : "variantes"}
              </span>
            </div>

            {/* Sub-sección 1: Ejes / Opciones del Producto (ej: Aroma, Presentación) */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  1. Opciones y Atributos (Ejes)
                </span>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--green-karmax)] hover:text-[var(--green-hover-karmax)] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Opción (ej. Aroma)</span>
                </button>
              </div>

              {productOptions.length === 0 ? (
                <p className="text-xs text-slate-400 py-1">
                  No has definido opciones cruzadas. Agrega una opción (ej: Presentación o Aroma) para generar variantes automáticas, o añade variantes manualmente abajo.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {productOptions.map((opt, oIdx) => (
                    <div key={oIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          value={opt.name}
                          onChange={(e) => handleUpdateOption(oIdx, "name", e.target.value)}
                          placeholder="Nombre (ej: Aroma o Presentación)"
                          className="w-full text-xs p-2.5 text-[var(--blue-karmax)] rounded-lg bg-white border border-slate-200 font-medium focus:outline-none focus:border-[var(--green-karmax)]"
                        />
                      </div>
                      <div className="sm:col-span-7">
                        <input
                          type="text"
                          value={opt.values}
                          onChange={(e) => handleUpdateOption(oIdx, "values", e.target.value)}
                          placeholder="Valores separados por coma (ej: Lavanda, Mar fresco, Primaveral)"
                          className="w-full text-xs p-2.5 text-[var(--blue-karmax)] rounded-lg bg-white border border-slate-200 focus:outline-none focus:border-[var(--green-karmax)]"
                        />
                      </div>
                      <div className="sm:col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(oIdx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                          title="Eliminar opción"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleGenerateVariantsFromOptions}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Generar / Actualizar Matriz de Variantes</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sub-sección 2: Tabla de Variantes (Matriz con SKU, Precio, Stock) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Matriz de Variantes y SKUs ({variants.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddManualVariant}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--dark-blue-karmax)] hover:text-[var(--blue-karmax)] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Variante Manual</span>
                </button>
              </div>

              {variants.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-xl">
                  Este producto no tiene variantes configuradas (se usará el precio y SKU base).
                </p>
              ) : (
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  <div className="hidden sm:grid grid-cols-12 gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    <span className="col-span-4">Combinación / Atributos</span>
                    <span className="col-span-3">SKU Independiente</span>
                    <span className="col-span-2 text-right">Precio ($)</span>
                    <span className="col-span-2">Stock</span>
                    <span className="col-span-1 text-center">Quitar</span>
                  </div>

                  {variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 items-center hover:border-slate-300 transition-colors"
                    >
                      {/* Atributos / Badges */}
                      <div className="sm:col-span-4 flex flex-wrap gap-1 items-center">
                        {Object.entries(v.attributes || {}).map(([attrName, val]) => (
                          <span
                            key={attrName}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-white border border-slate-200 text-[var(--dark-blue-karmax)] shadow-3xs"
                          >
                            <span className="text-slate-400 mr-1">{attrName}:</span>
                            <span className="font-semibold text-[var(--blue-karmax)]">{val}</span>
                          </span>
                        ))}
                      </div>

                      {/* SKU */}
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => handleUpdateVariant(idx, "sku", e.target.value)}
                          placeholder="Ej: KMX-MUS-MAR-20L-N"
                          className="w-full text-[var(--blue-karmax)] text-xs p-2 rounded-lg bg-white border border-slate-200 font-mono uppercase focus:outline-none focus:border-[var(--green-karmax)]"
                        />
                      </div>

                      {/* Precio */}
                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          value={v.price ?? ""}
                          onChange={(e) => handleUpdateVariant(idx, "price", e.target.value)}
                          placeholder="0.00"
                          className="w-full text-[var(--blue-karmax)] text-xs p-2 rounded-lg bg-white border border-slate-200 font-mono text-right focus:outline-none focus:border-[var(--green-karmax)]"
                        />
                      </div>

                      {/* Stock */}
                      <div className="sm:col-span-2">
                        <select
                          value={v.stockStatus || "instock"}
                          onChange={(e) => handleUpdateVariant(idx, "stockStatus", e.target.value)}
                          className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200 text-slate-700 focus:outline-none focus:border-[var(--green-karmax)]"
                        >
                          <option value="instock">En Stock</option>
                          <option value="outofstock">Agotado</option>
                        </select>
                      </div>

                      {/* Quitar */}
                      <div className="sm:col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                          title="Eliminar variante"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Galería de Imágenes */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Galería de Fotos ({images.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Haz clic en la estrella para definir la foto principal del catálogo.
                </p>
              </div>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--dark-blue-karmax)] hover:bg-[var(--blue-karmax)] text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-2xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Subir Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            {images.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No hay imágenes asignadas. Se mostrará el placeholder corporativo.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border p-2 flex items-center justify-center group ${
                      img.isPrimary
                        ? "border-2 border-[var(--green-karmax)] shadow-xs"
                        : "border-slate-200"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || "Producto"}
                      fill
                      className="object-contain p-2"
                      sizes="150px"
                    />

                    {/* Primary Badge */}
                    {img.isPrimary && (
                      <span className="absolute top-2 left-2 bg-[var(--green-karmax)] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        Principal
                      </span>
                    )}

                    {/* Action Hover Controls */}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        title="Marcar como foto principal"
                        className="p-2 bg-white rounded-full text-amber-500 hover:scale-110 transition-transform"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="Eliminar foto"
                        className="p-2 bg-white rounded-full text-rose-600 hover:scale-110 transition-transform"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 5: Documentos Técnicos (PDFs) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Fichas Técnicas y Hojas de Seguridad
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adjunta documentos PDF descargables para clientes institucionales.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddDocument}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--green-karmax)] hover:text-[var(--green-hover-karmax)] cursor-pointer"
              >
                <span>+ Agregar Documento</span>
              </button>
            </div>

            {documents.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No hay documentos adjuntos a este producto.
              </p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60"
                  >
                    <FileText className="w-6 h-6 text-rose-500 flex-shrink-0" />
                    <input
                      type="text"
                      value={doc.title}
                      onChange={(e) =>
                        handleUpdateDocument(idx, "title", e.target.value)
                      }
                      placeholder="Título (ej: Ficha Técnica)"
                      className="w-full sm:w-1/3 text-xs p-2 text-[var(--blue-karmax)] rounded-lg bg-white border border-slate-200"
                    />
                    <input
                      type="text"
                      value={doc.fileUrl}
                      onChange={(e) =>
                        handleUpdateDocument(idx, "fileUrl", e.target.value)
                      }
                      placeholder="URL del PDF o sube uno ->"
                      className="w-full sm:flex-1 text-xs p-2 text-[var(--blue-karmax)] rounded-lg bg-white border border-slate-200 font-mono"
                    />
                    <label className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 text-xs font-semibold cursor-pointer transition-colors flex-shrink-0">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => handleDocumentUpload(e, idx)}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Eliminar documento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 6: Optimización SEO & Google SERP Preview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[var(--blue-karmax)]" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                    Optimización SEO (Google y Redes Sociales)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Personaliza cómo aparece este producto en Google y al compartir enlaces.
                  </p>
                </div>
              </div>
            </div>

            {/* Vista Previa SERP Google */}
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Vista previa en Google Search (SERP)
              </span>
              <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/70 font-sans space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                  <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">K</span>
                  <span>karmax.mx</span>
                  <span>›</span>
                  <span className="text-slate-400 truncate">productos › {slug || "producto"}</span>
                </div>
                <h4 className="text-base sm:text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-1">
                  {metaTitle || (name ? `${name} | KARMAX` : "Nombre del Producto | KARMAX")}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {metaDescription || shortDescription || description?.slice(0, 155) || "Explora las características, presentaciones y cotiza este producto químico y de limpieza profesional en KARMAX México."}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {/* Meta Título */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Meta Título SEO
                  </label>
                  <span className={`text-[11px] font-mono ${metaTitle.length > 60 ? "text-amber-600 font-semibold" : "text-slate-400"}`}>
                    {metaTitle.length}/60 caracteres {metaTitle.length > 60 ? "(se truncará en Google)" : "(óptimo: 50-60)"}
                  </span>
                </div>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={name ? `${name} | Químicos KARMAX` : "Título optimizado para Google"}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl text-[var(--blue-karmax)] border border-slate-200 focus:outline-none focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20"
                />
              </div>

              {/* Meta Descripción */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Meta Descripción SEO
                  </label>
                  <span className={`text-[11px] font-mono ${metaDescription.length > 160 ? "text-amber-600 font-semibold" : "text-slate-400"}`}>
                    {metaDescription.length}/160 caracteres {metaDescription.length > 160 ? "(se truncará en Google)" : "(óptimo: 140-160)"}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Escribe un resumen persuasivo con palabras clave para invitar al clic desde los resultados de búsqueda..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl text-[var(--blue-karmax)] border border-slate-200 focus:outline-none focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20 resize-none"
                />
              </div>

              {/* Palabras Clave */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Palabras Clave (Keywords)
                </label>
                <input
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  placeholder="limpieza industrial, desengrasante, mayoreo químicos, karmax"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl text-[var(--blue-karmax)] border border-slate-200 focus:outline-none focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Separadas por comas. Utilizadas para etiquetado contextual y motores de búsqueda.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Categorías, Industrias, Estado (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Visibilidad y Estado */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3">
              Estado de Publicación
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded-sm text-[var(--green-karmax)] focus:ring-[var(--green-karmax)]"
                />
                <span>Producto Activo en Tienda</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded-sm text-[var(--green-karmax)] focus:ring-[var(--green-karmax)]"
                />
                <span>Destacado (Aparece en portadas)</span>
              </label>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Disponibilidad de Stock
                </label>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value)}
                  className="w-full text-xs text-[var(--text-karmax)] p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="instock">Disponible (En Stock)</option>
                  <option value="outofstock">Agotado (Sin Stock)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card: Categorías y Categoría Principal */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Categorías del Producto *
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Selecciona una o más categorías para este producto.
              </p>
            </div>

            {/* Listado de checkboxes con todas las categorías */}
            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100/60">
              {categories.map((c) => {
                const isSelected = selectedCategoryIds.includes(c.id);
                const isPrimary = Number(categoryId) === c.id;

                return (
                  <label
                    key={c.id}
                    className={`flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50/50 hover:bg-emerald-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleToggleCategory(c.id, e.target.checked)}
                        className="rounded-md w-4 h-4 text-[var(--green-karmax)] focus:ring-[var(--green-karmax)]"
                      />
                      <span
                        className={`text-xs truncate ${
                          isSelected ? "text-slate-900 font-semibold" : "text-slate-600"
                        }`}
                      >
                        {c.name}
                      </span>
                    </div>

                    {isPrimary && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--green-karmax)] text-white flex-shrink-0">
                        Principal
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Select para definir la categoría principal de entre las seleccionadas */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Categoría Principal *
              </label>

              {selectedCategoryIds.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                  <p className="text-xs text-slate-400">
                    Marca al menos una categoría en el listado superior.
                  </p>
                </div>
              ) : (
                <>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full text-[var(--blue-karmax)] text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[var(--green-karmax)] focus:ring-2 focus:ring-[var(--green-karmax)]/20 font-semibold cursor-pointer"
                  >
                    <option value="">Selecciona la categoría principal...</option>
                    {categories
                      .filter((c) => selectedCategoryIds.includes(c.id))
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-[11px] text-slate-400">
                    De las seleccionadas, define cuál será la categoría primaria en el catálogo.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Card: Industrias Aplicables */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Sectores Industriales
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Selecciona los sectores e industrias a los que abastece este producto.
              </p>
            </div>

            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100/60">
              {industries.map((ind) => {
                const isSelected = selectedIndustryIds.includes(ind.id);

                return (
                  <label
                    key={ind.id}
                    className={`flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50/50 hover:bg-emerald-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIndustryIds((prev) => [...prev, ind.id]);
                          } else {
                            setSelectedIndustryIds((prev) =>
                              prev.filter((id) => id !== ind.id)
                            );
                          }
                        }}
                        className="rounded-md w-4 h-4 text-[var(--green-karmax)] focus:ring-[var(--green-karmax)]"
                      />
                      <span
                        className={`text-xs truncate ${
                          isSelected ? "text-slate-900 font-semibold" : "text-slate-600"
                        }`}
                      >
                        {ind.name}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="text-[10px] font-semibold text-[var(--green-karmax)] flex-shrink-0">
                        Asignado
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
