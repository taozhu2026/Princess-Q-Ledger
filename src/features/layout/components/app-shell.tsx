"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, type PropsWithChildren } from "react";

import { BottomNav } from "@/features/layout/components/bottom-nav";
import { FloatingCreateButton } from "@/features/layout/components/floating-create-button";
import { TransactionComposer } from "@/features/transactions/components/transaction-composer";
import { useLedgerSnapshot } from "@/features/transactions/api/use-ledger-data";
import { useTransactionComposerStore } from "@/features/transactions/store/transaction-composer-store";

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { data } = useLedgerSnapshot();
  const { setTheme } = useTheme();
  const openCreate = useTransactionComposerStore((state) => state.openCreate);
  const pendingDrafts = useTransactionComposerStore((state) => state.pendingDrafts);

  const activeMember = data?.members.find(
    (member) => member.id === data.preferences.activeMemberId,
  );

  useEffect(() => {
    if (!data) {
      return;
    }

    setTheme(data.preferences.themePreference);
  }, [data, setTheme]);

  const showChrome = !pathname.startsWith("/invite");

  return (
    <>
      <div className="mx-auto min-h-screen max-w-[520px] px-4 pb-28 pt-5">
        {showChrome ? (
          <header className="mb-5 flex items-center justify-between rounded-[30px] border border-[var(--border)] bg-[var(--card)]/92 px-5 py-4 shadow-[var(--shadow-soft)] backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                Princess Q Ledger
              </p>
              <h1 className="mt-1 text-xl font-semibold">公主Q的账本</h1>
            </div>
            {activeMember ? (
              <div className="rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)]">
                当前：{activeMember.displayName}
              </div>
            ) : null}
          </header>
        ) : null}

        {pendingDrafts.length > 0 && showChrome ? (
          <button
            className="mb-4 flex w-full items-center justify-between rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-left"
            onClick={() => openCreate(pendingDrafts[0]?.id)}
            type="button"
          >
            <div>
              <p className="text-sm font-semibold">有 {pendingDrafts.length} 条离线草稿待处理</p>
              <p className="text-sm text-[var(--muted)]">
                联网后点这里继续提交，草稿不会丢。
              </p>
            </div>
            <span className="text-sm font-medium text-[var(--accent)]">继续处理</span>
          </button>
        ) : null}

        <main>{children}</main>
      </div>

      {showChrome ? (
        <>
          <FloatingCreateButton />
          <BottomNav />
        </>
      ) : null}

      <TransactionComposer />
    </>
  );
}
