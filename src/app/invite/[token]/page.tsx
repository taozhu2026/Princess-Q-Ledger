import { InviteScreen } from "@/features/ledger/components/invite-screen";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <InviteScreen token={token} />;
}
