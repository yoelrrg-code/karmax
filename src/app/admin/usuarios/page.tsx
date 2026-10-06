"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  UserCog,
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Building,
  Mail,
  Phone,
  Percent,
  FileText,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  Calendar,
} from "lucide-react";
import type { AdminUserItem, AdminRoleItem } from "@/types";
import { sileo } from "sileo";

export default function AdminUsuariosPage() {
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [rolesList, setRolesList] = useState<AdminRoleItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // User Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRoleId, setFormRoleId] = useState<number>(2);
  const [formPhone, setFormPhone] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formDiscount, setFormDiscount] = useState<string>("10");
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [userToDelete, setUserToDelete] = useState<AdminUserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
        setRolesList(data.roles || []);
        if (data.currentUserId) {
          setCurrentUserId(data.currentUserId);
        }
      } else {
        sileo.error({
          title: "Error",
          description: "No se pudo cargar la lista de usuarios",
        });
      }
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      sileo.error({
        title: "Error de conexión",
        description: "Error al comunicarse con el servidor",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.companyName && u.companyName.toLowerCase().includes(q)) ||
          (u.phone && u.phone.includes(q));
        if (!matchesQuery) return false;
      }

      // Role filter
      if (roleFilter !== "all") {
        if (u.roleId !== Number(roleFilter)) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "active" && !u.isActive) return false;
        if (statusFilter === "inactive" && u.isActive) return false;
      }

      return true;
    });
  }, [usersList, searchQuery, roleFilter, statusFilter]);

  // KPIs
  const totalUsers = usersList.length;
  const adminCount = usersList.filter((u) => u.roleId === 1 || u.roleName === "admin").length;
  const clientCount = usersList.filter((u) => u.roleId === 2 || u.roleName === "cliente").length;
  const inactiveCount = usersList.filter((u) => !u.isActive).length;

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRoleId(2); // Default to "cliente"
    setFormPhone("");
    setFormCompany("");
    setFormDiscount("10");
    setFormIsActive(true);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: AdminUserItem) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword("");
    setFormRoleId(user.roleId);
    setFormPhone(user.phone || "");
    setFormCompany(user.companyName || "");
    setFormDiscount(String(user.discountPercentage || 0));
    setFormIsActive(user.isActive);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      sileo.error({ title: "Campo requerido", description: "El nombre es obligatorio" });
      return;
    }

    if (!formEmail.trim()) {
      sileo.error({ title: "Campo requerido", description: "El correo electrónico es obligatorio" });
      return;
    }

    if (!editingUser && (!formPassword || formPassword.length < 8)) {
      sileo.error({
        title: "Contraseña inválida",
        description: "La contraseña debe tener al menos 8 caracteres",
      });
      return;
    }

    if (editingUser && formPassword && formPassword.length < 8) {
      sileo.error({
        title: "Contraseña inválida",
        description: "Si deseas cambiar la contraseña, debe tener al menos 8 caracteres",
      });
      return;
    }

    const discountVal = parseFloat(formDiscount);
    if (isNaN(discountVal) || discountVal < 0 || discountVal > 100) {
      sileo.error({
        title: "Descuento inválido",
        description: "El porcentaje de descuento debe estar entre 0 y 100",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        roleId: formRoleId,
        phone: formPhone.trim() || null,
        companyName: formCompany.trim() || null,
        discountPercentage: discountVal,
        isActive: formIsActive,
      };

      if (formPassword) {
        payload.password = formPassword;
      }

      if (editingUser) {
        // Edit existing
        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok) {
          sileo.success({
            title: "Usuario actualizado",
            description: `Se han guardado los cambios para ${formName}`,
          });
          setIsModalOpen(false);
          fetchUsers();
        } else {
          sileo.error({
            title: "Error al actualizar",
            description: data.error || "No se pudo actualizar el usuario",
          });
        }
      } else {
        // Create new
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok) {
          sileo.success({
            title: "Usuario creado",
            description: `El usuario ${formName} ha sido registrado exitosamente`,
          });
          setIsModalOpen(false);
          fetchUsers();
        } else {
          sileo.error({
            title: "Error al crear",
            description: data.error || "No se pudo registrar el usuario",
          });
        }
      }
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      sileo.error({
        title: "Error",
        description: "Ocurrió un error inesperado al procesar la solicitud",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        sileo.success({
          title: "Usuario eliminado",
          description: data.message || `Usuario ${userToDelete.name} eliminado`,
        });
        setUserToDelete(null);
        fetchUsers();
      } else {
        sileo.error({
          title: "No se pudo eliminar",
          description: data.error || "Ocurrió un error al eliminar el usuario",
        });
      }
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      sileo.error({
        title: "Error",
        description: "Error de red al intentar eliminar el usuario",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <UserCog className="w-7 h-7 text-[var(--green-karmax)]" />
            Gestión de Usuarios y Roles
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Administra las cuentas de acceso, roles (Administrador / Cliente), datos de contacto y descuentos comerciales.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
              Total Usuarios
            </span>
            <span className="text-2xl font-bold text-slate-900">{totalUsers}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[var(--blue-karmax)] flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
              Administradores
            </span>
            <span className="text-2xl font-bold text-[var(--blue-karmax)]">{adminCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[var(--green-karmax)] flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
              Clientes
            </span>
            <span className="text-2xl font-bold text-emerald-600">{clientCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
              Inactivos
            </span>
            <span className="text-2xl font-bold text-amber-600">{inactiveCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo, empresa o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-8 py-2 bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:border-[var(--green-karmax)] focus:bg-white text-slate-800 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Selector Filter */}
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs sm:text-sm py-2 px-3 bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:border-[var(--green-karmax)] focus:bg-white text-slate-700 cursor-pointer"
          >
            <option value="all">Todos los roles</option>
            {rolesList.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name === "admin" ? "Administradores" : r.name === "cliente" ? "Clientes" : r.name}
              </option>
            ))}
          </select>

          {/* Status Selector Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm py-2 px-3 bg-slate-50 border border-slate-200/80 rounded-xl outline-none focus:border-[var(--green-karmax)] focus:bg-white text-slate-700 cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Solo activos</option>
            <option value="inactive">Solo inactivos</option>
          </select>

          {(searchQuery || roleFilter !== "all" || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
                setStatusFilter("all");
              }}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-2 underline cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Usuario</th>
                <th className="py-3.5 px-4">Contacto</th>
                <th className="py-3.5 px-4 text-center">Rol</th>
                <th className="py-3.5 px-4 text-center">% Descuento</th>
                <th className="py-3.5 px-4 text-center">Cotizaciones</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-center">Registro</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[var(--green-karmax)]" />
                      <span>Cargando listado de usuarios...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No se encontraron usuarios con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isAdmin = u.roleId === 1 || u.roleName === "admin";
                  const isCurrent = currentUserId === u.id;
                  const initials = u.name
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "U";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Usuario */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 border ${
                              isAdmin
                                ? "bg-blue-100/70 border-blue-200 text-[var(--blue-karmax)]"
                                : "bg-emerald-100/70 border-emerald-200 text-emerald-700"
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-slate-900 leading-snug">{u.name}</p>
                              {isCurrent && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded-md border border-slate-200">
                                  Tú
                                </span>
                              )}
                            </div>
                            {u.companyName && (
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Building className="w-3 h-3 text-slate-400" />
                                {u.companyName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contacto */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="text-slate-700 text-xs flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <a
                              href={`mailto:${u.email}`}
                              className="hover:underline hover:text-[var(--blue-karmax)]"
                            >
                              {u.email}
                            </a>
                          </p>
                          {u.phone ? (
                            <p className="text-slate-500 text-[11px] flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <a
                                href={`tel:${u.phone}`}
                                className="hover:underline hover:text-[var(--green-karmax)]"
                              >
                                {u.phone}
                              </a>
                            </p>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Sin teléfono</span>
                          )}
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="py-4 px-4 text-center">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-[var(--blue-karmax)] font-semibold text-[11px] px-2.5 py-1 rounded-full border border-blue-100">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Administrador
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-medium text-[11px] px-2.5 py-1 rounded-full border border-slate-200">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Cliente
                          </span>
                        )}
                      </td>

                      {/* Descuento */}
                      <td className="py-4 px-4 text-center">
                        {u.discountPercentage > 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 text-xs">
                            <Percent className="w-3 h-3 text-emerald-600" />
                            {u.discountPercentage}%
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">0%</span>
                        )}
                      </td>

                      {/* Cotizaciones */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700 text-xs bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                          <FileText className="w-3 h-3 text-slate-400" />
                          {u.quotesCount}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-4 px-4 text-center">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Inactivo
                          </span>
                        )}
                      </td>

                      {/* Fecha de registro */}
                      <td className="py-4 px-4 text-center text-slate-500 text-xs">
                        <span className="flex items-center justify-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(u.createdAt).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(u)}
                            title="Editar usuario"
                            className="p-1.5 text-slate-500 hover:text-[var(--blue-karmax)] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setUserToDelete(u)}
                            disabled={isCurrent}
                            title={
                              isCurrent
                                ? "No puedes eliminar tu propia cuenta"
                                : "Eliminar usuario"
                            }
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCurrent
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-[var(--green-karmax)] flex items-center justify-center">
                  <UserCog className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingUser
                      ? `Modifica los datos y rol de ${editingUser.name}`
                      : "Registra un nuevo usuario o cliente en el sistema"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="mt-5 space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Pérez"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[var(--green-karmax)] focus:bg-white text-slate-800 transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[var(--green-karmax)] focus:bg-white text-slate-800 transition-colors"
                />
              </div>

              {/* Rol */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rol de acceso <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={editingUser?.id === currentUserId}
                    onClick={() => setFormRoleId(2)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      formRoleId === 2
                        ? "border-[var(--green-karmax)] bg-emerald-50/50 text-slate-900 font-semibold shadow-2xs"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    } ${editingUser?.id === currentUserId ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <UserCheck className={`w-4 h-4 ${formRoleId === 2 ? "text-[var(--green-karmax)]" : "text-slate-400"}`} />
                    <div>
                      <p className="text-xs">Cliente</p>
                      <p className="text-[10px] text-slate-400 font-normal">Cotizador y descuentos</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={editingUser?.id === currentUserId}
                    onClick={() => setFormRoleId(1)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      formRoleId === 1
                        ? "border-[var(--blue-karmax)] bg-blue-50/50 text-slate-900 font-semibold shadow-2xs"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    } ${editingUser?.id === currentUserId ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <ShieldCheck className={`w-4 h-4 ${formRoleId === 1 ? "text-[var(--blue-karmax)]" : "text-slate-400"}`} />
                    <div>
                      <p className="text-xs">Administrador</p>
                      <p className="text-[10px] text-slate-400 font-normal">Acceso total al panel</p>
                    </div>
                  </button>
                </div>
                {editingUser?.id === currentUserId && (
                  <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    No puedes modificar tu propio rol.
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {editingUser ? "Nueva Contraseña (Opcional)" : "Contraseña"}{" "}
                  {!editingUser && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required={!editingUser}
                    placeholder={
                      editingUser
                        ? "Dejar en blanco para mantener la actual"
                        : "Mínimo 8 caracteres"
                    }
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full text-xs sm:text-sm pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[var(--green-karmax)] focus:bg-white text-slate-800 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {editingUser && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Completa este campo únicamente si deseas cambiar la contraseña del usuario.
                  </p>
                )}
              </div>

              {/* Teléfono & Empresa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono <span className="font-normal text-slate-400">(con código de país)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: +52 55 1234 5678"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[var(--green-karmax)] focus:bg-white text-slate-800 transition-colors"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Incluye el código de país (ej. +52 para México).
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Empresa / Negocio
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Taller Mecánico San Juan"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[var(--green-karmax)] focus:bg-white text-slate-800 transition-colors"
                  />
                </div>
              </div>

              {/* Descuento comercial */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Porcentaje de Descuento Comercial (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="10"
                    value={formDiscount}
                    onChange={(e) => setFormDiscount(e.target.value)}
                    className="w-full text-xs sm:text-sm pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[var(--green-karmax)] focus:bg-white text-slate-800 transition-colors"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">
                    %
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Se aplica automáticamente a los precios del catálogo cuando el cliente inicia sesión.
                </p>
              </div>

              {/* Estado Activo / Inactivo */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    disabled={editingUser?.id === currentUserId}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 text-[var(--green-karmax)] rounded-md border-slate-300 focus:ring-[var(--green-karmax)]"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Cuenta activa
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Permite al usuario iniciar sesión en el sitio y acceder a sus funciones
                    </span>
                  </div>
                </label>
                {editingUser?.id === currentUserId && (
                  <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 ml-7">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    No puedes desactivar tu propia cuenta de administrador.
                  </p>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 bg-[var(--green-karmax)] hover:bg-[var(--green-hover-karmax)] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{editingUser ? "Guardar Cambios" : "Crear Usuario"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                ¿Eliminar usuario?
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Estás a punto de eliminar a{" "}
              <strong className="text-slate-900">{userToDelete.name}</strong> (
              <span className="text-slate-700">{userToDelete.email}</span>). Esta acción no se
              puede deshacer.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mb-6">
              Las cotizaciones históricas asociadas a este usuario se conservarán en el sistema
              desvinculadas del perfil.
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteUser}
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <span>Eliminar definitivamente</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
