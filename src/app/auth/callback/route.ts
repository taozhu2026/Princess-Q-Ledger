import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL("/settings", origin));
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/settings", origin));
  }

  await supabase.auth.exchangeCodeForSession(code);
  return NextResponse.redirect(new URL("/", origin));
}
