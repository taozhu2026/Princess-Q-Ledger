"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { DatabaseZap, PawPrint, ShieldCheck, UsersRound } from "lucide-react";
import { useEffect, type PropsWithChildren } from "react";

import { formatBookKind, formatLedgerMode, formatMembershipRole } from "@/entities/ledger";
import { AccessGate } from "@/features/ledger/components/access-gate";
import {
  LedgerErrorCard,
  LedgerLoadingCard,
} from "@/features/ledger/components/ledger-status-card";
import { BottomNav } from "@/features/layout/components/bottom-nav";
import { FloatingCreateButton } from "@/features/layout/components/floating-create-button";
import { TransactionComposer } from "@/features/transactions/components/transaction-composer";
import { useLedgerSnapshot } from "@/features/transactions/api/use-ledger-data";
import { useTransactionComposerStore } from "@/features/transactions/store/transaction-composer-store";

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");
  const { data, error, isPending } = useLedgerSnapshot({
    enabled: !isAuthRoute,
  });
  const { setTheme } = useTheme();
  const openCreate = useTransactionComposerStore((state) => state.openCreate);
  const pendingDrafts = useTransactionComposerStore((state) => state.pendingDrafts);
  const viewerDisplayName =
    data?.viewerMembership?.displayName ?? data?.auth.viewer?.displayName ?? null;
  const bookKindLabel = data?.book ? formatBookKind(data.book.kind) : null;
  const roleLabel = data?.viewerMembership
    ? formatMembershipRole(data.viewerMembership.role)
    : null;
  const dataModeLabel = data ? formatLedgerMode(data.auth.mode) : null;

  useEffect(() => {
    if (!data) {
      return;
    }

    setTheme(data.preferences.themePreference);
  }, [data, setTheme]);

  const showChrome = !pathname.startsWith("/invite") && !isAuthRoute;
  const shouldGate =
    showChrome &&
    !!data &&
    data.auth.mode === "supabase" &&
    data.auth.status === "signed_out";
  const isInitializingLedger =
    showChrome &&
    !!data &&
    data.auth.mode === "supabase" &&
    data.auth.status === "ready" &&
    !data.book;
  const showAppChrome = showChrome && !!data?.book;

  return (
    <>
      <div className="mx-auto min-h-screen max-w-[520px] px-4 pb-32 pt-5">
        {showAppChrome ? (
          <header className="theme-card-shell mb-5 overflow-hidden rounded-[30px] border px-5 py-5 shadow-[var(--shadow-card)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[var(--accent-strong)]">
                  <PawPrint className="h-3.5 w-3.5" />
                  ACTIVE LEDGER
                </div>
                <h1 className="mt-3 text-[26px] font-semibold tracking-[-0.02em]">
                  {data.book?.name}
                </h1>
                <p className="mt-2 max-w-[250px] text-sm leading-6 text-[var(--muted)]">
                  {bookKindLabel}
                  {roleLabel ? ` · 你当前是${roleLabel}` : ""}
                  {data?.members.length ? ` · 共 ${data.members.length} 位成员` : ""}
                </p>
              </div>
              {viewerDisplayName ? (
                <div className="rounded-[22px] bg-[var(--pink-soft)] px-4 py-3 text-right shadow-[0_10px_18px_rgba(244,214,214,0.22)]">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">当前账号</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                    {viewerDisplayName}
                  </p>
                  {data?.auth.viewer?.email ? (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {data.auth.viewer.email}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-[22px] bg-[var(--surface)] px-3 py-3">
                <p className="text-xs text-[var(--muted)]">账本类型</p>
                <p className="mt-1 text-sm font-semibold text-[var(--accent-strong)]">
                  {bookKindLabel}
                </p>
              </div>
              <div className="rounded-[22px] bg-[var(--highlight-soft)] px-3 py-3">
                <p className="text-xs text-[var(--muted)]">成员与权限</p>
                <div className="mt-1 flex items-center gap-1 text-sm font-semibold text-[var(--foreground)]">
                  <UsersRound className="h-3.5 w-3.5" />
                  <span>{data.members.length} 人</span>
                  {roleLabel ? (
                    <>
                      <ShieldCheck className="ml-1 h-3.5 w-3.5" />
                      <span>{roleLabel}</span>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="rounded-[22px] bg-[var(--pink-soft)] px-3 py-3">
                <p className="text-xs text-[var(--muted)]">数据模式</p>
                <div className="mt-1 flex items-center gap-1 text-sm font-semibold text-[var(--foreground)]">
                  <DatabaseZap className="h-3.5 w-3.5" />
                  <span>{dataModeLabel}</span>
                </div>
              </div>
            </div>
          </header>
        ) : null}

        {pendingDrafts.length > 0 && showAppChrome ? (
          <button
            className="theme-surface-card-strong mb-4 flex w-full items-center justify-between rounded-[26px] border border-dashed px-4 py-4 text-left shadow-[var(--shadow-soft)]"
            onClick={() => openCreate(pendingDrafts[0]?.id)}
            type="button"
          >
            <div>
              <p className="text-sm font-semibold">有 {pendingDrafts.length} 条草稿在等你</p>
              <p className="text-sm text-[var(--muted)]">
                当前只保存了新增记录草稿，恢复联网后从这里继续提交。
              </p>
            </div>
            <span className="theme-elevated-surface rounded-full px-3 py-2 text-sm font-medium text-[var(--accent-strong)]">
              继续处理
            </span>
          </button>
        ) : null}

        <main>
          {!isAuthRoute && isPending ? <LedgerLoadingCard /> : null}
          {!isAuthRoute && !isPending && error ? (
            <LedgerErrorCard
              message={error instanceof Error ? error.message : "未知错误"}
            />
          ) : null}
          {!isAuthRoute && !isPending && !error && isInitializingLedger ? (
            <LedgerLoadingCard />
          ) : null}
          {isAuthRoute ? children : null}
          {!isAuthRoute && !isPending && !error
            ? shouldGate && data
              ? <AccessGate snapshot={data} />
              : !isInitializingLedger
                ? children
                : null
            : null}
        </main>
      </div>

      {showAppChrome ? (
        <>
          <FloatingCreateButton />
          <BottomNav />
        </>
      ) : null}

      {!isAuthRoute ? <TransactionComposer /> : null}
    </>
  );
}
