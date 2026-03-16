import type { Metadata } from "next";

import { RegisterScreen } from "@/features/auth/screens/register-screen";
import { createPageMetadata } from "@/shared/config/metadata";

export const metadata: Metadata = createPageMetadata("注册");

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return <RegisterScreen nextPath={next} />;
}
