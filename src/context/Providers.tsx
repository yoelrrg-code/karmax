"use client";

import React from "react";
import { AuthProvider } from "./AuthContext";
import { QuoteProvider } from "./QuoteContext";

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <QuoteProvider>{children}</QuoteProvider>
    </AuthProvider>
  );
};
