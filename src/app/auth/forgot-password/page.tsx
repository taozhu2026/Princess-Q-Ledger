import { ForgotPasswordScreen } from "@/features/auth/screens/forgot-password-screen";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return <ForgotPasswordScreen nextPath={next} />;
}
