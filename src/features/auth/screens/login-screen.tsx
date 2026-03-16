"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  useLedgerSnapshot,
  useSendMagicLinkMutation,
  useSignInWithPasswordMutation,
} from "@/features/transactions/api/use-ledger-data";
import {
  appendNextPath,
  resolveSafeNextPath,
} from "@/shared/lib/supabase/paths";
import { Button } from "@/shared/ui/button";
import { ButtonLink } from "@/shared/ui/button-link";
import { CardDescription } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

import { AuthShellCard } from "@/features/auth/components/auth-shell-card";
import { PasswordField } from "@/features/auth/components/password-field";

export function LoginScreen({ nextPath: rawNextPath }: { nextPath?: string }) {
  const router = useRouter();
  const nextPath = resolveSafeNextPath(rawNextPath, "/");
  const { data: snapshot } = useLedgerSnapshot({
    enabled: true,
  });
  const signIn = useSignInWithPasswordMutation();
  const sendMagicLink = useSendMagicLinkMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicLinkEmail, setMagicLinkEmail] = useState("");

  useEffect(() => {
    if (snapshot?.auth.mode === "supabase" && snapshot.auth.status === "ready") {
      router.replace(nextPath);
      router.refresh();
    }
  }, [nextPath, router, snapshot]);

  const message =
    signIn.data?.message ??
    sendMagicLink.data?.message ??
    "以前只用过邮箱链接登录，也可以先点“忘记密码”给这个邮箱补设一个密码。";

  return (
    <AuthShellCard
      description="默认使用邮箱和密码登录，成功后会直接保持会话。Magic Link 仍然保留在下方作为备用方式。"
      title="欢迎回来"
    >
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();

          const result = await signIn.mutateAsync({
            email,
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
            邮箱
          </span>
          <Input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="输入注册邮箱"
            type="email"
            value={email}
          />
        </label>
        <PasswordField
          label="密码"
          onChange={setPassword}
          placeholder="输入登录密码"
          value={password}
        />

        <Button className="w-full" disabled={signIn.isPending} type="submit">
          {signIn.isPending ? "正在登录..." : "登录"}
        </Button>
      </form>

      <div className="flex items-center justify-between text-sm text-[var(--muted)]">
        <Link
          className="underline-offset-4 hover:underline"
          href={appendNextPath("/auth/forgot-password", nextPath)}
        >
          忘记密码
        </Link>
        <Link
          className="underline-offset-4 hover:underline"
          href={appendNextPath("/auth/register", nextPath)}
        >
          还没有账号？去注册
        </Link>
      </div>

      <div className="rounded-[22px] bg-[var(--surface)] px-4 py-4">
        <p className="text-sm font-medium text-[var(--foreground)]">备用方式：Magic Link</p>
        <CardDescription className="mt-2">
          如果你在新设备上只想快速登录，也可以继续走邮箱链接。
        </CardDescription>

        <div className="mt-4 space-y-3">
          <Input
            onChange={(event) => setMagicLinkEmail(event.target.value)}
            placeholder="输入邮箱，发送备用登录链接"
            type="email"
            value={magicLinkEmail}
          />
          <Button
            className="w-full"
            disabled={sendMagicLink.isPending}
            onClick={async () => {
              await sendMagicLink.mutateAsync({
                email: magicLinkEmail,
                nextPath,
              });
            }}
            variant="secondary"
          >
            {sendMagicLink.isPending ? "正在发送..." : "发送备用登录链接"}
          </Button>
        </div>
      </div>

      <p className="text-sm leading-6 text-[var(--muted)]">{message}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <ButtonLink
          className="w-full"
          href={appendNextPath("/auth/forgot-password", nextPath)}
          variant="secondary"
        >
          去设置密码
        </ButtonLink>
        <ButtonLink className="w-full" href={appendNextPath("/auth/register", nextPath)} variant="ghost">
          新账号注册
        </ButtonLink>
      </div>
    </AuthShellCard>
  );
}
