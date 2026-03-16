import type { Metadata } from "next";

import { LedgerScreen } from "@/features/transactions/components/ledger-screen";
import { createPageMetadata } from "@/shared/config/metadata";

export const metadata: Metadata = createPageMetadata("账单");

export default function LedgerPage() {
  return <LedgerScreen />;
}
