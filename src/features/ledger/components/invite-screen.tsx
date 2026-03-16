"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { useLedgerSnapshot } from "@/features/transactions/api/use-ledger-data";
import { useAcceptInvitationMutation } from "@/features/transactions/api/use-ledger-data";
import { AuthCard } from "@/features/ledger/components/auth-card";
import { Button } from "@/shared/ui/button";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";

export function InviteScreen({ token }: { token: string }) {
  const { data: snapshot } = useLedgerSnapshot({ autoInitialize: false });
  const { mutate, data, isPending } = useAcceptInvitationMutation();
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!snapshot || snapshot.auth.mode !== "supabase") {
      return;
    }

    if (snapshot.auth.status !== "ready" || attemptedRef.current) {
      return;
    }

    attemptedRef.current = true;
    mutate(token);
  }, [mutate, snapshot, token]);

  if (snapshot?.auth.mode === "supabase" && snapshot.auth.status === "signed_out") {
    return (
      <div className="flex min-h-[70vh] items-center">
        <AuthCard
          description="这是一个共享账本邀请。先登录或注册，再回到这个链接完成加入。登录页里仍然保留备用的邮箱链接方式。"
          nextPath={`/invite/${token}`}
          title="登录后加入账本"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center">
      <Card className="mx-auto w-full max-w-[420px]">
        <CardTitle>加入共享账本</CardTitle>
        <CardDescription className="mt-3">
          {data?.message ??
            (isPending ? "正在校验邀请链接，请稍等。" : "正在确认登录状态和邀请信息。")}
        </CardDescription>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/">
            <Button>{data?.ok ? "回到账本" : "回首页看看"}</Button>
          </Link>
          <Link href="/settings">
            <Button variant="secondary">
              {data?.ok ? "去设置看看" : "去设置页看状态"}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
