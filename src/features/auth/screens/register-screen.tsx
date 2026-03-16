"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  useLedgerSnapshot,
  useSignUpWithPasswordMutation,
} from "@/features/transactions/api/use-ledger-data";
import {
  appendNextPath,
  resolveSafeNextPath,
} from "@/shared/lib/supabase/paths";
import { Button } from "@/shared/ui/button";
import { CardDescription } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

import { AuthShellCard } from "@/features/auth/components/auth-shell-card";
import { PasswordField } from "@/features/auth/components/password-field";

const MIN_PASSWORD_LENGTH = 8;

export function RegisterScreen({ nextPath: rawNextPath }: { nextPath?: string }) {
  const router = useRouter();
  const nextPath = resolveSafeNextPath(rawNextPath, "/");
  const { data: snapshot } = useLedgerSnapshot({
    enabled: true,
  });
  const signUp = useSignUpWithPasswordMutation();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localMessage, setLocalMessage] = useState("");

  useEffect(() => {
    if (snapshot?.auth.mode === "supabase" && snapshot.auth.status === "ready") {
      router.replace(nextPath);
      router.refresh();
    }
  }, [nextPath, router, snapshot]);

  return (
    <AuthShellCard
      description="第一次使用时直接设置密码。若你的 Supabase 打开了邮箱确认，注册后会先收到一封确认邮件。"
      title="创建账号"
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
          const result = await signUp.mutateAsync({
            displayName,
            email,
            nextPath,
            password,
          });

          if (result.ok && result.nextStep === "signed_in") {
            router.replace(nextPath);
            router.refresh();
          }
        }}
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">
            昵称
          </span>
          <Input
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="想让账本里显示什么名字"
            type="text"
            value={displayName}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">
            邮箱
          </span>
          <Input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="输入常用邮箱"
            type="email"
            value={email}
          />
        </label>
        <PasswordField
          label="密码"
          onChange={setPassword}
          placeholder="至少 8 位，后续可修改"
          value={password}
        />
        <PasswordField
          label="确认密码"
          onChange={setConfirmPassword}
          placeholder="再输入一次密码"
          value={confirmPassword}
        />

        <Button className="w-full" disabled={signUp.isPending} type="submit">
          {signUp.isPending ? "正在注册..." : "注册并继续"}
        </Button>
      </form>

      <CardDescription>
        如果你之前已经用这个邮箱通过 Magic Link 登录过，不要重复注册，直接去登录页点“忘记密码”补设一个密码。
      </CardDescription>

      <p className="text-sm leading-6 text-[var(--muted)]">
        {localMessage || signUp.data?.message || "注册完成后，系统会自动初始化你的个人账本。"}
      </p>

      <div className="flex items-center justify-between text-sm text-[var(--muted)]">
        <Link
          className="underline-offset-4 hover:underline"
          href={appendNextPath("/auth/login", nextPath)}
        >
          已有账号，去登录
        </Link>
        <Link
          className="underline-offset-4 hover:underline"
          href={appendNextPath("/auth/forgot-password", nextPath)}
        >
          已注册但没密码？
        </Link>
      </div>
    </AuthShellCard>
  );
}
