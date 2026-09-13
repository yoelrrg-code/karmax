"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import type { AdminSessionUser } from "@/lib/auth/adminGuard";

interface AdminHeaderProps {
  user: AdminSessionUser;
  onOpenMobileSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  user,
  onOpenMobileSidebar,
}) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Abrir menú de administración"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="hidden sm:inline-block text-xs uppercase tracking-wider font-semibold text-slate-500">
          Panel de Control
        </span>
      </div>

      {/* Right: User profile badge & logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[var(--dark-blue-karmax)] text-white flex items-center justify-center font-bold text-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {user.name}
            </p>
            <p className="text-[11px] text-slate-400 leading-tight">
              {user.email}
            </p>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Cerrar sesión"
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
};
