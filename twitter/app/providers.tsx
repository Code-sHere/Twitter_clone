"use client";

import "@/lib/i18n";
import { AuthProvider } from "@/context/AuthContext";
import LanguageSync from "@/components/LanguageSync";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageSync />
      {children}
    </AuthProvider>
  );
}