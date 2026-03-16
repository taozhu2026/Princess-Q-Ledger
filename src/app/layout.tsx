import type { Metadata, Viewport } from "next";

import { AppShell } from "@/features/layout/components/app-shell";
import { ROOT_METADATA } from "@/shared/config/metadata";
import { AppProviders } from "@/shared/providers/app-providers";

import "./globals.css";

export const metadata: Metadata = ROOT_METADATA;

export const viewport: Viewport = {
  themeColor: "#f7f3ec",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
