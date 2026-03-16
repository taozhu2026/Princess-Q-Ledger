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
            <CardTitle>正在加载账本数据</CardTitle>
            <CardDescription className="mt-2">
              正在同步成员、分类、交易和统计状态，通常只需要几秒。
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
            <CardTitle>账本数据暂时没有加载成功</CardTitle>
            <CardDescription className="mt-2">
              首次账本查询报错了，所以页面停在了这里，没有继续渲染业务内容。
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
          <p>4. `/auth/callback` 没配进 Supabase Redirect URLs，或者服务端缺少 `SUPABASE_SERVICE_ROLE_KEY` / `RESEND_API_KEY` / `AUTH_EMAIL_FROM`。</p>
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
