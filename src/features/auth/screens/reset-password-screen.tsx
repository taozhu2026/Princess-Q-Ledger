"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  useLedgerSnapshot,
  useUpdatePasswordMutation,
} from "@/features/transactions/api/use-ledger-data";
import { Button } from "@/shared/ui/button";
import { CardDescription } from "@/shared/ui/card";

import { AuthShellCard } from "@/features/auth/components/auth-shell-card";
import { PasswordField } from "@/features/auth/components/password-field";

const MIN_PASSWORD_LENGTH = 8;

export function ResetPasswordScreen() {
  const router = useRouter();
  const { data: snapshot, isPending } = useLedgerSnapshot({
    autoInitialize: false,
    enabled: true,
  });
  const updatePassword = useUpdatePasswordMutation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localMessage, setLocalMessage] = useState("");

  if (isPending) {
    return (
      <AuthShellCard
        description="正在确认你的重置链接和登录状态，通常只需要几秒。"
        mood="sleeping"
        title="准备重置密码"
      >
        <CardDescription>小猫正在核对这次密码恢复会话。</CardDescription>
      </AuthShellCard>
    );
  }

  if (snapshot?.auth.mode === "supabase" && snapshot.auth.status === "signed_out") {
    return (
      <AuthShellCard
        description="这个重置页面需要从邮件里的恢复链接进入，或者先登录后到设置页里直接修改密码。"
        mood="confused"
        title="这条链接已经失效"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent-soft)] px-4 text-sm font-medium text-[var(--accent-strong)]"
            href="/auth/forgot-password"
          >
            重新发送邮件
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--surface)] px-4 text-sm font-medium text-[var(--foreground)]"
            href="/auth/login"
          >
            回到登录
          </Link>
        </div>
      </AuthShellCard>
    );
  }

  return (
    <AuthShellCard
      description="设置好新密码后，这个账号就可以稳定地用邮箱和密码登录，不再依赖每次点邮件。"
      title="输入新密码"
    >
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();

          if (password.length < MIN_PASSWORD_LENGTH) {
            setLocalMessage(`密码至少需要 ${MIN_PASSWORD_LENGTH} 位。`);
            return;
          }

          if (password !== confirmPassword) {
            setLocalMessage("两次输入的密码不一致。");
            return;
          }

          setLocalMessage("");
          const result = await updatePassword.mutateAsync({
            password,
          });

          if (result.ok) {
            router.replace("/");
            router.refresh();
          }
        }}
      >
        <PasswordField
          label="新密码"
          onChange={setPassword}
          placeholder="输入新的登录密码"
          value={password}
        />
        <PasswordField
          label="确认新密码"
          onChange={setConfirmPassword}
          placeholder="再次输入新的登录密码"
          value={confirmPassword}
        />

        <Button className="w-full" disabled={updatePassword.isPending} type="submit">
          {updatePassword.isPending ? "正在保存..." : "保存新密码"}
        </Button>
      </form>

      <p className="text-sm leading-6 text-[var(--muted)]">
        {localMessage || updatePassword.data?.message || "保存后会直接回到账本首页。"}
      </p>
    </AuthShellCard>
  );
}
