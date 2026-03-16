"use client";

import type { PropsWithChildren } from "react";

import { QueryProvider } from "@/shared/providers/query-provider";
import { ThemeProvider } from "@/shared/providers/theme-provider";
import { PwaRegister } from "@/shared/pwa/pwa-register";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        <PwaRegister />
      </QueryProvider>
    </ThemeProvider>
  );
}
