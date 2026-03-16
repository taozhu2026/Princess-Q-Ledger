"use client";

import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";

import { useTransactionComposerStore } from "@/features/transactions/store/transaction-composer-store";
import { Button } from "@/shared/ui/button";

export function FloatingCreateButton() {
  const pathname = usePathname();
  const openCreate = useTransactionComposerStore((state) => state.openCreate);

  if (pathname.startsWith("/invite")) {
    return null;
  }

  return (
    <Button
      className="fixed bottom-24 right-4 z-40 h-14 rounded-full px-5 text-sm shadow-[0_20px_32px_rgba(38,79,53,0.22)] sm:right-8"
      onClick={() => openCreate()}
      size="lg"
    >
      <Plus className="mr-1 h-5 w-5" />
      记一笔
    </Button>
  );
}
