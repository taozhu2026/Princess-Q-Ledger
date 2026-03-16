"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { PawPrint } from "lucide-react";
import { useEffect, type PropsWithChildren } from "react";

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
  const { data, error, isPending } = useLedgerSnapshot();
  const { setTheme } = useTheme();
  const openCreate = useTransactionComposerStore((state) => state.openCreate);
  const pendingDrafts = useTransactionComposerStore((state) => state.pendingDrafts);
  const viewerDisplayName =
    data?.viewerMembership?.displayName ?? data?.auth.viewer?.displayName ?? null;

  useEffect(() => {
    if (!data) {
      return;
    }

    setTheme(data.preferences.themePreference);
  }, [data, setTheme]);

  const showChrome = !pathname.startsWith("/invite");
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
          <header className="mb-5 overflow-hidden rounded-[30px] border border-white/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(255,249,241,0.88))] px-5 py-5 shadow-[var(--shadow-card)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[var(--accent-strong)]">
                  <PawPrint className="h-3.5 w-3.5" />
                  CAT HEALING LEDGER
                </div>
                <h1 className="mt-3 text-[26px] font-semibold tracking-[-0.02em]">
                  {data.book?.name}
                </h1>
                <p className="mt-2 max-w-[250px] text-sm leading-6 text-[var(--muted)]">
                  把记账做成轻轻的一件小事，今天也慢慢记录就好。
                </p>
              </div>
              {viewerDisplayName ? (
                <div className="rounded-[22px] bg-[var(--pink-soft)] px-4 py-3 text-right shadow-[0_10px_18px_rgba(244,214,214,0.22)]">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                    当前账号
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                    {viewerDisplayName}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-[22px] bg-[var(--surface)] px-3 py-3">
                <p className="text-xs text-[var(--muted)]">模式</p>
                <p className="mt-1 text-sm font-semibold text-[var(--accent-strong)]">
                  App 风格
                </p>
              </div>
              <div className="rounded-[22px] bg-[var(--highlight-soft)] px-3 py-3">
                <p className="text-xs text-[var(--muted)]">体验</p>
                <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                  轻松记账
                </p>
              </div>
              <div className="rounded-[22px] bg-[var(--pink-soft)] px-3 py-3">
                <p className="text-xs text-[var(--muted)]">氛围</p>
                <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                  猫咪治愈
                </p>
              </div>
            </div>
          </header>
        ) : null}

        {pendingDrafts.length > 0 && showAppChrome ? (
          <button
            className="mb-4 flex w-full items-center justify-between rounded-[26px] border border-dashed border-[rgba(111,159,134,0.26)] bg-[linear-gradient(180deg,rgba(235,243,238,0.82),rgba(255,255,255,0.94))] px-4 py-4 text-left shadow-[var(--shadow-soft)]"
            onClick={() => openCreate(pendingDrafts[0]?.id)}
            type="button"
          >
            <div>
              <p className="text-sm font-semibold">有 {pendingDrafts.length} 条草稿在等你</p>
              <p className="text-sm text-[var(--muted)]">
                网络恢复后点这里继续提交，小猫会帮你把草稿守好。
              </p>
            </div>
            <span className="rounded-full bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--accent-strong)]">
              继续处理
            </span>
          </button>
        ) : null}

        <main>
          {isPending ? <LedgerLoadingCard /> : null}
          {!isPending && error ? (
            <LedgerErrorCard
              message={error instanceof Error ? error.message : "未知错误"}
            />
          ) : null}
          {!isPending && !error && isInitializingLedger ? <LedgerLoadingCard /> : null}
          {!isPending && !error
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

      <TransactionComposer />
    </>
  );
}
