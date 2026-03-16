"use client";

import { useState } from "react";

import type { LedgerSnapshot } from "@/entities/ledger";
import { useBootstrapLedgerMutation } from "@/features/transactions/api/use-ledger-data";
import { AuthCard } from "@/features/ledger/components/auth-card";
import { Button } from "@/shared/ui/button";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";

export function AccessGate({ snapshot }: { snapshot: LedgerSnapshot }) {
  const bootstrapLedger = useBootstrapLedgerMutation();
  const [bookName, setBookName] = useState("公主Q的账本");
  const [displayName, setDisplayName] = useState(
    snapshot.auth.viewer?.displayName ?? "",
  );

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
        <CardTitle>先创建你的共享账本</CardTitle>
        <CardDescription className="mt-3">
          真实数据模式已经打开。先创建账本，再邀请另一位成员加入，之后所有数据都会写入 Supabase。
        </CardDescription>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">你的称呼</label>
            <input
              className="w-full rounded-[20px] border bg-[var(--surface)] px-4 py-3 outline-none"
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="例如：QQ"
              value={displayName}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">账本名称</label>
            <input
              className="w-full rounded-[20px] border bg-[var(--surface)] px-4 py-3 outline-none"
              onChange={(event) => setBookName(event.target.value)}
              placeholder="例如：公主Q的账本"
              value={bookName}
            />
          </div>

          <Button
            className="w-full"
            onClick={() =>
              bootstrapLedger.mutate({
                bookName,
                displayName,
              })
            }
          >
            创建账本
          </Button>

          <p className="text-sm text-[var(--muted)]">
            {bootstrapLedger.data?.message ??
              "创建后，这个账号会成为账本拥有者。"}
          </p>
        </div>
      </Card>
    </div>
  );
}
