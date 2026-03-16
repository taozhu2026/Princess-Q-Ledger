"use client";

import { PawPrint } from "lucide-react";
import { useState } from "react";

import { useSendMagicLinkMutation } from "@/features/transactions/api/use-ledger-data";
import { Button } from "@/shared/ui/button";
import { CatIllustration } from "@/shared/ui/cat-illustration";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";

export function AuthCard({
  nextPath = "/",
  title = "登录后开始记账",
  description = "请输入邮箱，我们会发送一个魔法链接到你的邮箱，打开即可登录。",
}: {
  nextPath?: string;
  title?: string;
  description?: string;
}) {
  const sendMagicLink = useSendMagicLinkMutation();
  const [email, setEmail] = useState("");

  return (
    <Card className="mx-auto max-w-[460px] overflow-hidden bg-[linear-gradient(145deg,#fffaf2,#ffffff)]">
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[var(--accent-strong)]">
          <PawPrint className="h-3.5 w-3.5" />
          MAGIC LINK
        </div>
        <CatIllustration className="mt-4 h-28 w-28" mood="happy" />
      </div>
      <CardTitle className="mt-2 text-center text-[22px] tracking-[-0.02em]">{title}</CardTitle>
      <CardDescription className="mt-3 text-center">{description}</CardDescription>

      <div className="mt-5 space-y-3">
        <input
          className="w-full rounded-[20px] border border-white/70 bg-[var(--surface)] px-4 py-3 outline-none shadow-[var(--shadow-soft)]"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="输入你的邮箱"
          type="email"
          value={email}
        />
        <Button
          className="w-full"
          onClick={() =>
            sendMagicLink.mutate({
              email,
              nextPath,
            })
          }
        >
          发送登录链接
        </Button>
        <p className="text-sm text-[var(--muted)]">
          {sendMagicLink.data?.message ??
            "建议用手机上的同一个浏览器打开邮件里的链接。"}
        </p>
      </div>
    </Card>
  );
}
