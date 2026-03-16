"use client";

import Link from "next/link";
import { useEffect } from "react";

import { useAcceptInvitationMutation } from "@/features/transactions/api/use-ledger-data";
import { Button } from "@/shared/ui/button";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";

export function InviteScreen({ token }: { token: string }) {
  const { mutate, data } = useAcceptInvitationMutation();

  useEffect(() => {
    mutate(token);
  }, [mutate, token]);

  return (
    <div className="flex min-h-[70vh] items-center">
      <Card className="mx-auto w-full max-w-[420px]">
        <CardTitle>加入共享账本</CardTitle>
        <CardDescription className="mt-3">
          {data?.message ?? "正在校验邀请链接，请稍等。"}
        </CardDescription>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/">
            <Button>回到账本</Button>
          </Link>
          <Link href="/settings">
            <Button variant="secondary">去设置看看</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
