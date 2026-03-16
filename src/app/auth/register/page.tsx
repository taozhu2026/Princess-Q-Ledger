import { RegisterScreen } from "@/features/auth/screens/register-screen";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return <RegisterScreen nextPath={next} />;
}
