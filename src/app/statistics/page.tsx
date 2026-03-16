import type { Metadata } from "next";

import { StatisticsScreen } from "@/features/statistics/components/statistics-screen";
import { createPageMetadata } from "@/shared/config/metadata";

export const metadata: Metadata = createPageMetadata("统计");

export default function StatisticsPage() {
  return <StatisticsScreen />;
}
