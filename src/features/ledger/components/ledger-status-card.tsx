"use client";

import { Button } from "@/shared/ui/button";
import { CatIllustration } from "@/shared/ui/cat-illustration";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";

export function LedgerLoadingCard() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="mx-auto max-w-[460px]">
        <div className="flex flex-col items-center text-center">
          <CatIllustration className="h-28 w-28" mood="sleeping" />
          <div className="mt-4">
            <CardTitle>正在把账本抱过来</CardTitle>
            <CardDescription className="mt-2">
              小猫正在读取你的成员、交易和最近状态，马上就好。
            </CardDescription>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function LedgerErrorCard({ message }: { message: string }) {
  const supabaseEnvConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="mx-auto max-w-[520px]">
        <div className="flex flex-col items-center text-center">
          <CatIllustration className="h-28 w-28" mood="confused" />
          <div className="mt-4">
            <CardTitle>小猫暂时没把数据搬出来</CardTitle>
            <CardDescription className="mt-2">
              页面不是没有界面，而是启动后的第一条账本查询报错了，所以内容没有继续展开。
            </CardDescription>
          </div>
        </div>

        <div className="mt-5 rounded-[22px] bg-[var(--surface)] px-4 py-4 text-sm text-[var(--muted)]">
          <p className="font-medium text-[var(--foreground)]">错误信息</p>
          <p className="mt-2 break-words">{message}</p>
        </div>

        <div className="mt-5 space-y-3 text-sm text-[var(--muted)]">
          <p className="font-medium text-[var(--foreground)]">最常见的原因</p>
          <p>1. Vercel 里配置了 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`，但 Supabase migration 还没执行。</p>
          <p>2. `profiles` 表、`bootstrap_ledger` / `accept_invitation` RPC 或系统分类还没建出来。</p>
          <p>3. 改了 Vercel 环境变量，但没有重新部署。</p>
          <p>4. Supabase Auth 还没开启邮箱 Magic Link，或回调地址没配到 `/auth/callback`。</p>
          {!supabaseEnvConfigured ? (
            <p>5. 当前前端没有读取到公开 Supabase 环境变量，所以不会走真实数据模式。</p>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={() => window.location.reload()}>重新加载</Button>
          <Button
            onClick={() => window.open("/settings", "_self")}
            variant="secondary"
          >
            去设置页看状态
          </Button>
        </div>
      </Card>
    </div>
  );
}
