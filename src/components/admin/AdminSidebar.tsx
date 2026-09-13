"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  FolderTree,
  Factory,
  Layers,
  ExternalLink,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  {
    label: "Panel Principal",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Cotizaciones",
    href: "/admin/cotizaciones",
    icon: FileText,
  },
  {
    label: "Clientes",
    href: "/admin/clientes",
    icon: Users,
  },
  {
    label: "Productos",
    href: "/admin/productos",
    icon: Package,
  },
  {
    label: "Categorías",
    href: "/admin/categorias",
    icon: FolderTree,
  },
  {
    label: "Industrias",
    href: "/admin/industrias",
    icon: Factory,
  },
  {
    label: "Secciones del Sitio",
    href: "/admin/secciones",
    icon: Layers,
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const isActive = (item: (typeof NAV_ITEMS)[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#0A192F] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-wider text-white">
              KARMAX
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-[var(--green-karmax)] text-white px-2 py-0.5 rounded-sm">
              Admin
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Administración
          </div>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-[var(--green-karmax)] text-white shadow-xs font-semibold"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Bar: Quick link to public website */}
        <div className="p-4 border-t border-slate-800">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl text-xs font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-800 hover:text-white transition-all border border-slate-700/60"
          >
            <ExternalLink className="w-4 h-4 text-[var(--green-karmax)]" />
            <span>Ver Tienda Pública</span>
          </Link>
        </div>
      </aside>
    </>
  );
};
