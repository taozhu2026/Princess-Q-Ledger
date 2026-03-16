import { NextResponse } from "next/server";

import { getCurrentAppVersion } from "@/shared/pwa/version";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(getCurrentAppVersion(), {
    headers: {
      "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
    },
  });
}
