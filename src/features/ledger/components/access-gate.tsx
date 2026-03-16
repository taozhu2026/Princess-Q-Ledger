"use client";

import type { LedgerSnapshot } from "@/entities/ledger";
import { AuthCard } from "@/features/ledger/components/auth-card";
import { CatIllustration } from "@/shared/ui/cat-illustration";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";

export function AccessGate({ snapshot }: { snapshot: LedgerSnapshot }) {
  if (snapshot.auth.mode !== "supabase") {
    return null;
  }

  if (snapshot.auth.status === "signed_out") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <AuthCard />
      </div>
    );
  }

  if (snapshot.book) {
    return null;
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="mx-auto max-w-[460px]">
        <div className="flex flex-col items-center text-center">
          <CatIllustration className="h-28 w-28" mood="sleeping" />
          <CardTitle className="mt-4">正在准备你的账本</CardTitle>
          <CardDescription className="mt-3">
            已经识别到登录账号。系统会自动创建个人资料和默认个人账本，完成后会直接进入首页。
          </CardDescription>
        </div>
        <p className="mt-5 text-sm text-[var(--muted)]">
          如果这里长时间不跳转，通常说明数据库 migration 还没有执行完全，或者当前账号还没有拿到可用 session。
        </p>
      </Card>
    </div>
  );
}
