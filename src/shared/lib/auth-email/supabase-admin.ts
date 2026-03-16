import { createClient } from "@supabase/supabase-js";

import type { AuthEmailConfig } from "@/shared/lib/auth-email/config";

export function createSupabaseAdminClient(config: AuthEmailConfig) {
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
