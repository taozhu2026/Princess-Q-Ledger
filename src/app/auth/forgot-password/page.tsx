import type { Metadata } from "next";

import { ForgotPasswordScreen } from "@/features/auth/screens/forgot-password-screen";
import { createPageMetadata } from "@/shared/config/metadata";

export const metadata: Metadata = createPageMetadata("重设密码");

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return <ForgotPasswordScreen nextPath={next} />;
}
