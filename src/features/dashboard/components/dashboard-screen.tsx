"use client";

import {
  ArrowRightLeft,
  BanknoteArrowDown,
  CircleDollarSign,
  ReceiptText,
} from "lucide-react";
import { useState } from "react";

import {
  computeMonthlyStatistics,
  computeSettlementSummary,
  getAvailableMonths,
  getRecentTransactions,
  getTransactionShares,
} from "@/entities/ledger";
import { TransactionItem } from "@/features/transactions/components/transaction-item";
import {
  useConfirmSettlementMutation,
  useLedgerSnapshot,
} from "@/features/transactions/api/use-ledger-data";
import { formatCurrency, formatMonthLabel } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";

const summaryCards = [
  {
    key: "expenseTotal",
    label: "本月支出",
    icon: ReceiptText,
  },
  {
    key: "incomeTotal",
    label: "本月收入",
    icon: CircleDollarSign,
  },
  {
    key: "sharedExpenseTotal",
    label: "共同支出",
    icon: BanknoteArrowDown,
  },
] as const;

export function DashboardScreen() {
  const { data } = useLedgerSnapshot();
  const confirmSettlementMutation = useConfirmSettlementMutation();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  if (!data) {
    return null;
  }

  const months = getAvailableMonths(data);
  const monthKey = selectedMonth ?? months[0];
  const statistics = computeMonthlyStatistics(data, monthKey);
  const settlement = computeSettlementSummary(data, monthKey);
  const recentTransactions = getRecentTransactions(data, 4);
  const isSharedLedger = data.members.length > 1;

  const maxPaidExpense = Math.max(
    ...statistics.memberComparison.map((member) => member.paidExpenseTotal),
    1,
  );

  const getMemberName = (memberId: string) =>
    data.members.find((member) => member.id === memberId)?.displayName ?? "成员";

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(53,95,69,0.98),rgba(100,138,95,0.95))] text-white">
        <p className="text-xs uppercase tracking-[0.28em] text-white/72">本月总览</p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{formatMonthLabel(monthKey)}</h2>
            <p className="mt-2 max-w-[240px] text-sm leading-6 text-white/80">
              今天适合继续保持轻量记账，所有结算和统计都会自动更新。
            </p>
          </div>
          <select
            className="rounded-full border border-white/18 bg-white/12 px-4 py-2 text-sm outline-none"
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

          return (
            <Card key={card.key}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--muted)]">{card.label}</p>
                  <p className="mt-3 text-xl font-semibold">{formatCurrency(value)}</p>
                </div>
                <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
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
              系统按“谁付的钱”和“谁承担费用”自动计算，确认后会生成结算记录。
            </CardDescription>
          </div>
          <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
        </div>

        {settlement.suggestedTransfer ? (
          <div className="mt-5 rounded-[24px] bg-[var(--surface)] p-4">
            <p className="text-sm text-[var(--muted)]">建议</p>
            <p className="mt-2 text-xl font-semibold">
              {getMemberName(settlement.suggestedTransfer.fromMemberId)} 应转给{" "}
              {getMemberName(settlement.suggestedTransfer.toMemberId)}{" "}
              {formatCurrency(settlement.suggestedTransfer.amount)}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                onClick={() =>
                  confirmSettlementMutation.mutate({
                    monthKey,
                    amount: settlement.suggestedTransfer?.amount ?? 0,
                  })
                }
              >
                确认结算
              </Button>
              <p className="self-center text-sm text-[var(--muted)]">
                这会自动新增一条结算交易，用来冲减待结算金额。
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[24px] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
            本月已经基本平衡，没有新的待结算建议。
          </div>
        )}

        <div className="mt-4 space-y-3">
          {settlement.memberBalances.map((balance) => (
            <div
              key={balance.memberId}
              className="flex items-center justify-between rounded-[22px] border border-[var(--border)] bg-[var(--card)] px-4 py-3"
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
                  className="h-full rounded-full bg-[var(--accent)]"
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
        {recentTransactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            category={data.categories.find(
              (category) => category.id === transaction.categoryId,
            )}
            payer={data.members.find(
              (member) => member.id === transaction.payerMemberId,
            )}
            shares={getTransactionShares(data, transaction.id)}
            transaction={transaction}
          />
        ))}
      </div>
    </div>
  );
}
