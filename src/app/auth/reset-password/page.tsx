import type { Metadata } from "next";

import { ResetPasswordScreen } from "@/features/auth/screens/reset-password-screen";
import { createPageMetadata } from "@/shared/config/metadata";

export const metadata: Metadata = createPageMetadata("输入新密码");

export default function ResetPasswordPage() {
  return <ResetPasswordScreen />;
}
