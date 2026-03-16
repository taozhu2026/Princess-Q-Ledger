"use client";

import Link from "next/link";
import { useState } from "react";

import { useSendPasswordResetEmailMutation } from "@/features/transactions/api/use-ledger-data";
import { appendNextPath, resolveSafeNextPath } from "@/shared/lib/supabase/paths";
import { Button } from "@/shared/ui/button";
import { CardDescription } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

import { AuthShellCard } from "@/features/auth/components/auth-shell-card";

export function ForgotPasswordScreen({ nextPath: rawNextPath }: { nextPath?: string }) {
  const nextPath = resolveSafeNextPath(rawNextPath, "/");
  const sendResetEmail = useSendPasswordResetEmailMutation();
  const [email, setEmail] = useState("");

  return (
    <AuthShellCard
      description="这个入口既可以重设旧密码，也可以给以前只用 Magic Link 的邮箱补设一个密码。"
      mood="sleeping"
      title="重设密码"
    >
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          await sendResetEmail.mutateAsync({
            email,
          });
        }}
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">
            邮箱
          </span>
          <Input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="输入需要重设密码的邮箱"
            type="email"
            value={email}
          />
        </label>

        <Button className="w-full" disabled={sendResetEmail.isPending} type="submit">
          {sendResetEmail.isPending ? "正在发送..." : "发送重设邮件"}
        </Button>
      </form>

      <CardDescription>
        邮件里的链接会先回到站内 `/auth/callback` 建 session，再进入重置密码页面。
      </CardDescription>

      <p className="text-sm leading-6 text-[var(--muted)]">
        {sendResetEmail.data?.message ||
          "如果邮箱没有收到邮件，先确认垃圾箱，再确认管理员已经配置好 Resend 发信域名和服务端密钥。"}
      </p>

      <div className="flex items-center justify-between text-sm text-[var(--muted)]">
        <Link
          className="underline-offset-4 hover:underline"
          href={appendNextPath("/auth/login", nextPath)}
        >
          回到登录
        </Link>
        <Link
          className="underline-offset-4 hover:underline"
          href={appendNextPath("/auth/register", nextPath)}
        >
          还没有账号
        </Link>
      </div>
    </AuthShellCard>
  );
}
