"use client";

import { KeyRound, Mail, PawPrint } from "lucide-react";

import { appendNextPath } from "@/shared/lib/supabase/paths";
import { ButtonLink } from "@/shared/ui/button-link";
import { CatIllustration } from "@/shared/ui/cat-illustration";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";

export function AuthCard({
  nextPath = "/",
  title = "登录后开始记账",
  description = "默认使用邮箱和密码登录。你也可以先注册，Magic Link 会保留在登录页作为备用方式。",
}: {
  nextPath?: string;
  title?: string;
  description?: string;
}) {
  return (
    <Card className="mx-auto max-w-[460px] overflow-hidden bg-[linear-gradient(145deg,#fffaf2,#ffffff)]">
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[var(--accent-strong)]">
          <PawPrint className="h-3.5 w-3.5" />
          ACCOUNT ACCESS
        </div>
        <CatIllustration className="mt-4 h-28 w-28" mood="happy" />
      </div>
      <CardTitle className="mt-2 text-center text-[22px] tracking-[-0.02em]">{title}</CardTitle>
      <CardDescription className="mt-3 text-center">{description}</CardDescription>

      <div className="mt-6 grid gap-3">
        <ButtonLink className="w-full" href={appendNextPath("/auth/login", nextPath)}>
          <KeyRound className="mr-2 h-4 w-4" />
          邮箱 + 密码登录
        </ButtonLink>
        <ButtonLink
          className="w-full"
          href={appendNextPath("/auth/register", nextPath)}
          variant="secondary"
        >
          <Mail className="mr-2 h-4 w-4" />
          首次注册
        </ButtonLink>
      </div>

      <div className="mt-5 rounded-[22px] bg-[var(--surface)] px-4 py-4 text-sm text-[var(--muted)]">
        <p className="font-medium text-[var(--foreground)]">备用方式</p>
        <p className="mt-2 leading-6">
          如果你之前只用过邮箱链接登录，也可以在登录页底部继续用 Magic Link，或者直接走忘记密码来补设密码。
        </p>
      </div>
    </Card>
  );
}
