"use client";

import {
  ArrowRightLeft,
  BanknoteArrowDown,
  CircleDollarSign,
  PawPrint,
  ReceiptText,
} from "lucide-react";
import { useState } from "react";

import {
  canManageTransaction,
  computeMonthlyStatistics,
  computeSettlementSummary,
  getMonthTransactions,
  getAvailableMonths,
  getRecentTransactions,
  getTransactionShares,
} from "@/entities/ledger";
import { TransactionItem } from "@/features/transactions/components/transaction-item";
import {
  useConfirmSettlementMutation,
  useDeleteTransactionMutation,
  useLedgerSnapshot,
} from "@/features/transactions/api/use-ledger-data";
import { useTransactionComposerStore } from "@/features/transactions/store/transaction-composer-store";
import { getErrorMessage } from "@/shared/lib/errors";
import { formatCurrency, formatMonthLabel } from "@/shared/lib/utils";
import { CatIllustration } from "@/shared/ui/cat-illustration";
import { Button } from "@/shared/ui/button";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";

const summaryCards = [
  {
    key: "expenseTotal",
    label: "本月支出",
    icon: ReceiptText,
    tone: "bg-[var(--highlight-soft)] text-[#c98b62]",
  },
  {
    key: "incomeTotal",
    label: "本月收入",
    icon: CircleDollarSign,
    tone: "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
  },
  {
    key: "sharedExpenseTotal",
    label: "共同支出",
    icon: BanknoteArrowDown,
    tone: "bg-[var(--pink-soft)] text-[#bb8b8b]",
  },
] as const;

export function DashboardScreen() {
  const { data } = useLedgerSnapshot();
  const confirmSettlementMutation = useConfirmSettlementMutation();
  const deleteTransactionMutation = useDeleteTransactionMutation();
  const openCreate = useTransactionComposerStore((state) => state.openCreate);
  const openEdit = useTransactionComposerStore((state) => state.openEdit);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState("");

  if (!data) {
    return null;
  }

  const months = getAvailableMonths(data);
  const monthKey = selectedMonth ?? months[0];
  const monthTransactions = getMonthTransactions(data, monthKey);
  const statistics = computeMonthlyStatistics(data, monthKey);
  const settlement = computeSettlementSummary(data, monthKey);
  const recentTransactions = getRecentTransactions(data, 4);
  const isSharedLedger = data.members.length > 1;
  const viewerUserId = data.auth.viewer?.userId ?? null;

  const maxPaidExpense = Math.max(
    ...statistics.memberComparison.map((member) => member.paidExpenseTotal),
    1,
  );

  const getMemberName = (memberId: string) =>
    data.members.find((member) => member.id === memberId)?.displayName ?? "成员";

  return (
    <div className="space-y-4">
      <Card className="theme-card-hero overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-[var(--accent-strong)]">
              <PawPrint className="h-3.5 w-3.5" />
              MONTHLY OVERVIEW
            </div>
            <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.03em]">
              {formatMonthLabel(monthKey)}
            </h2>
            <p className="mt-2 max-w-[240px] text-sm leading-6 text-[var(--muted)]">
              本月已记录 {monthTransactions.length} 笔，支出 {formatCurrency(statistics.expenseTotal)}
              ，收入 {formatCurrency(statistics.incomeTotal)}。
            </p>
          </div>
          <CatIllustration className="h-24 w-24 shrink-0" mood="happy" />
        </div>

        <div className="theme-accent-card mt-5 flex items-center justify-between gap-3 rounded-[24px] px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              这个月的状态
            </p>
            <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
              {isSharedLedger
                ? "共享成员、结算建议和统计都会围绕当前账本同步"
                : "当前是个人账本，所有记录都只作用于你自己的账本"}
            </p>
          </div>
          <select
            className="theme-select-surface rounded-full border px-4 py-2 text-sm outline-none shadow-[0_8px_16px_rgba(111,159,134,0.08)]"
            onChange={(event) => setSelectedMonth(event.target.value)}
            value={monthKey}
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {formatMonthLabel(month)}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const value = statistics[card.key];
          const label =
            card.key === "sharedExpenseTotal" && !isSharedLedger
              ? "共享支出"
              : card.label;

          return (
            <Card key={card.key} className="overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--muted)]">{label}</p>
                  <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                    {formatCurrency(value)}
                  </p>
                </div>
                <div className={`rounded-[20px] p-3 ${card.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>本月待结算</CardTitle>
            <CardDescription className="mt-2">
              系统按本月记录自动汇总“谁付款”和“谁承担”，并给出一条可直接确认的结算建议。
            </CardDescription>
          </div>
          <div className="rounded-[20px] bg-[var(--accent-soft)] p-3 text-[var(--accent-strong)]">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
        </div>

        {settlement.suggestedTransfer ? (
          <div className="theme-highlight-card mt-5 rounded-[26px] p-5 shadow-[var(--shadow-soft)]">
            <p className="text-sm text-[var(--muted)]">今天的小建议</p>
            <p className="mt-2 text-xl font-semibold leading-8">
              {getMemberName(settlement.suggestedTransfer.fromMemberId)} 应转给{" "}
              {getMemberName(settlement.suggestedTransfer.toMemberId)}{" "}
              {formatCurrency(settlement.suggestedTransfer.amount)}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                disabled={confirmSettlementMutation.isPending}
                onClick={async () => {
                  try {
                    await confirmSettlementMutation.mutateAsync({
                      monthKey,
                      amount: settlement.suggestedTransfer?.amount ?? 0,
                    });
                    setActionMessage("结算记录已生成，本月待结算金额已更新。");
                  } catch (error) {
                    setActionMessage(getErrorMessage(error));
                  }
                }}
              >
                {confirmSettlementMutation.isPending ? "正在生成..." : "确认结算"}
              </Button>
              <p className="self-center text-sm text-[var(--muted)]">
                确认后会自动生成一条结算交易，抵消待结算金额。
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              description="这个月目前没有新的结算压力，可以继续按自己的节奏记录。"
              mood="happy"
              title="今天不用额外结算"
            />
          </div>
        )}

        <div className="mt-4 space-y-3">
          {settlement.memberBalances.map((balance) => (
            <div
              key={balance.memberId}
              className="theme-surface-card-strong flex items-center justify-between rounded-[22px] border px-4 py-3"
            >
              <div>
                <p className="font-medium">{balance.displayName}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  已付 {formatCurrency(balance.paidTotal)} · 应承担{" "}
                  {formatCurrency(balance.shouldShareTotal)}
                </p>
              </div>
              <p className="text-sm font-semibold text-[var(--accent)]">
                {balance.netBalance >= 0 ? "应收" : "应付"}{" "}
                {formatCurrency(Math.abs(balance.netBalance))}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          {actionMessage ||
            (settlement.suggestedTransfer
              ? "确认后会写入一条结算记录，账单页和统计页会同步更新。"
              : "本月暂时没有需要额外确认的结算记录。")}
        </p>
      </Card>

      <Card>
        <CardTitle>{isSharedLedger ? "成员支出对比" : "我的支出概览"}</CardTitle>
        <CardDescription className="mt-2">
          {isSharedLedger
            ? "这里比较的是“本月实际付款金额”，不是承担金额。"
            : "当前是个人账本，这里展示你本月实际付款金额。"}
        </CardDescription>

        <div className="mt-5 space-y-4">
          {statistics.memberComparison.map((member) => (
            <div key={member.memberId}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{member.displayName}</span>
                <span className="text-[var(--muted)]">
                  {formatCurrency(member.paidExpenseTotal)}
                </span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-[var(--surface)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-strong))]"
                  style={{
                    width: `${(member.paidExpenseTotal / maxPaidExpense) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">最近记录</h2>
          <span className="text-sm text-[var(--muted)]">按时间倒序</span>
        </div>
        {recentTransactions.length === 0 ? (
          <EmptyState
            action={<Button onClick={() => openCreate()}>去添加第一笔</Button>}
            description="当前还没有最近记录。先记下一笔，首页会同步显示最新流水。"
            title="最近记录还是空的"
          />
        ) : (
          recentTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              category={data.categories.find(
                (category) => category.id === transaction.categoryId,
              )}
              onDelete={
                canManageTransaction({
                  transaction,
                  viewerMembership: data.viewerMembership,
                  viewerUserId,
                })
                  ? async (transactionId) => {
                      if (!window.confirm("确认删除这条记录吗？删除后无法恢复。")) {
                        return;
                      }

                      try {
                        await deleteTransactionMutation.mutateAsync(transactionId);
                        setActionMessage("记录已删除。");
                      } catch (error) {
                        setActionMessage(getErrorMessage(error));
                      }
                    }
                  : undefined
              }
              onEdit={
                canManageTransaction({
                  transaction,
                  viewerMembership: data.viewerMembership,
                  viewerUserId,
                })
                  ? (transactionId) => openEdit(transactionId)
                  : undefined
              }
              payer={data.members.find(
                (member) => member.id === transaction.payerMemberId,
              )}
              shares={getTransactionShares(data, transaction.id)}
              transaction={transaction}
            />
          ))
        )}
      </div>
    </div>
  );
}
