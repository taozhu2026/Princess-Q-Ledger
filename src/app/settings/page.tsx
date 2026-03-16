import type { Metadata } from "next";

import { SettingsScreen } from "@/features/settings/components/settings-screen";
import { createPageMetadata } from "@/shared/config/metadata";

export const metadata: Metadata = createPageMetadata("设置");

export default function SettingsPage() {
  return <SettingsScreen />;
}
