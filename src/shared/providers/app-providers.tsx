"use client";

import type { PropsWithChildren } from "react";

import { QueryProvider } from "@/shared/providers/query-provider";
import { SupabaseAuthSync } from "@/shared/providers/supabase-auth-sync";
import { ThemeProvider } from "@/shared/providers/theme-provider";
import { PwaRegister } from "@/shared/pwa/pwa-register";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        <SupabaseAuthSync />
        <PwaRegister />
      </QueryProvider>
    </ThemeProvider>
  );
}
