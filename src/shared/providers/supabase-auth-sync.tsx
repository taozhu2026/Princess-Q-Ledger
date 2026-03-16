"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { createSupabaseBrowserClient } from "@/shared/lib/supabase/browser";

export function SupabaseAuthSync() {
  const queryClient = useQueryClient();

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
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return null;
}
