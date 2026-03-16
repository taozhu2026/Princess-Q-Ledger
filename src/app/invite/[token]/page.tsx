import type { Metadata } from "next";

import { InviteScreen } from "@/features/ledger/components/invite-screen";
import { createPageMetadata } from "@/shared/config/metadata";

export const metadata: Metadata = createPageMetadata("加入共享账本");

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <InviteScreen token={token} />;
}
