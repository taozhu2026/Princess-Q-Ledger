"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { startTransition, useEffect } from "react";

import { createSupabaseBrowserClient } from "@/shared/lib/supabase/browser";

export function SupabaseAuthSync() {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void queryClient.invalidateQueries({
        queryKey: ["ledger"],
      });
      startTransition(() => {
        router.refresh();
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, router]);

  return null;
}
