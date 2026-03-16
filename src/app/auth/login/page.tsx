import type { Metadata } from "next";

import { LoginScreen } from "@/features/auth/screens/login-screen";
import { createPageMetadata } from "@/shared/config/metadata";

export const metadata: Metadata = createPageMetadata("登录");

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return <LoginScreen nextPath={next} />;
}
