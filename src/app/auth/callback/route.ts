import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { resolveSafeNextPath } from "@/shared/lib/supabase/paths";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const nextPath = resolveSafeNextPath(requestUrl.searchParams.get("next"), "/");

  if (!code) {
    const response = NextResponse.redirect(new URL(nextPath, origin));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    const response = NextResponse.redirect(new URL(nextPath, origin));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  await supabase.auth.exchangeCodeForSession(code);
  const response = NextResponse.redirect(new URL(nextPath, origin));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
