import type { Metadata } from "next";

import { DashboardScreen } from "@/features/dashboard/components/dashboard-screen";
import { createAbsolutePageMetadata } from "@/shared/config/metadata";

export const metadata: Metadata = createAbsolutePageMetadata("公主Q的账本");

export default function HomePage() {
  return <DashboardScreen />;
}
