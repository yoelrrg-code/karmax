"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { AuthUser } from "@/types";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    phone?: string;
    companyName?: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: (onSuccessCallback?: () => void) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setUser(data.user);
        }
      } catch (err) {
        console.error("Error fetching session user:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Error al iniciar sesión" };
      }

      setUser(data.user);
      if (pendingCallback) {
        pendingCallback();
        setPendingCallback(null);
      }
      setIsAuthModalOpen(false);
      return { success: true };
    } catch {
      return { success: false, error: "Error de red al iniciar sesión" };
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    phone?: string;
    companyName?: string;
    password: string;
  }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Error al registrarse" };
      }

      setUser(data.user);
      if (pendingCallback) {
        pendingCallback();
        setPendingCallback(null);
      }
      setIsAuthModalOpen(false);
      return { success: true };
    } catch {
      return { success: false, error: "Error de red al registrarse" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const openAuthModal = (onSuccessCallback?: () => void) => {
    if (onSuccessCallback) {
      setPendingCallback(() => onSuccessCallback);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingCallback(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
