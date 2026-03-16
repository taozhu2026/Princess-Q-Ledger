"use client";

import { PawPrint, Plus } from "lucide-react";
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
      className="fixed bottom-24 right-4 z-40 h-14 rounded-full px-5 text-sm shadow-[0_18px_30px_rgba(111,159,134,0.24)] sm:right-8"
      onClick={() => openCreate()}
      size="lg"
    >
      <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/18">
        <PawPrint className="h-4 w-4" />
      </span>
      <Plus className="mr-1 h-4 w-4" />
      记一笔
    </Button>
  );
}
