"use client";

import { useState } from "react";

import { useSendMagicLinkMutation } from "@/features/transactions/api/use-ledger-data";
import { Button } from "@/shared/ui/button";
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
    <Card className="mx-auto max-w-[460px]">
      <CardTitle>{title}</CardTitle>
      <CardDescription className="mt-3">{description}</CardDescription>

      <div className="mt-5 space-y-3">
        <input
          className="w-full rounded-[20px] border bg-[var(--surface)] px-4 py-3 outline-none"
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
