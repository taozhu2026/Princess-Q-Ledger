"use client";

import { ChartColumnBig, PawPrint } from "lucide-react";
import { useState } from "react";

import {
  computeMonthlyStatistics,
  getAvailableMonths,
} from "@/entities/ledger";
import { useLedgerSnapshot } from "@/features/transactions/api/use-ledger-data";
import { formatCurrency, formatMonthLabel } from "@/shared/lib/utils";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";

export function StatisticsScreen() {
  const { data } = useLedgerSnapshot();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  if (!data) {
    return null;
  }

  const months = getAvailableMonths(data);
  const monthKey = selectedMonth ?? months[0];
  const statistics = computeMonthlyStatistics(data, monthKey);
  const isSharedLedger = data.members.length > 1;
  const hasAnyMonthlyData = statistics.expenseTotal > 0 || statistics.incomeTotal > 0;
  const maxCategoryAmount = Math.max(
    ...statistics.categoryBreakdown.map((item) => item.amount),
    1,
  );
  const maxTrendExpense = Math.max(
    ...statistics.trend.map((point) => point.expenseTotal),
    1,
  );

  return (
    <div className="space-y-4">
      <Card className="theme-card-hero overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--pink-soft)] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[#b98484]">
              <PawPrint className="h-3.5 w-3.5" />
              MONTHLY DATA
            </div>
            <CardTitle className="mt-3 text-[24px] tracking-[-0.02em]">统计</CardTitle>
            <CardDescription className="mt-2">
              这里按月份汇总支出结构、成员承担和近 6 个月趋势。
            </CardDescription>
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

      {!hasAnyMonthlyData ? (
        <EmptyState
          description="这个月份还没有收入或支出记录。先记下一笔，统计页才会生成结构和趋势。"
          title="这个月还没有可统计的数据"
        />
      ) : null}

      {hasAnyMonthlyData ? (
        <>
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-[18px] bg-[var(--highlight-soft)] p-3 text-[#c98b62]">
                <ChartColumnBig className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>分类占比</CardTitle>
                <CardDescription className="mt-1">
                  当前只统计支出分类，收入继续单独记录。
                </CardDescription>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {statistics.categoryBreakdown.map((item) => (
                <div key={item.categoryId}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.categoryName}</span>
                    <span className="text-[var(--muted)]">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-[var(--surface)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(item.amount / maxCategoryAmount) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    占本月总支出 {(item.share * 100).toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle>{isSharedLedger ? "成员对比" : "我的支出拆分"}</CardTitle>
            <CardDescription className="mt-2">
              {isSharedLedger
                ? "同时看实际付款、共同承担和个人支出，方便判断谁最近垫付更多。"
                : "当前是个人账本，这里把你的实付、共同承担和个人支出拆开看。"}
            </CardDescription>
            <div className="mt-5 space-y-4">
              {statistics.memberComparison.map((member) => (
                <div
                  key={member.memberId}
                  className="theme-surface-card-strong rounded-[24px] border px-4 py-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{member.displayName}</h3>
                    <span className="text-sm text-[var(--muted)]">
                      实付 {formatCurrency(member.paidExpenseTotal)}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-[18px] bg-[var(--card)] px-3 py-3 shadow-[var(--shadow-soft)]">
                      <p className="text-[var(--muted)]">共同承担</p>
                      <p className="mt-2 font-semibold">
                        {formatCurrency(member.sharedResponsibilityTotal)}
                      </p>
                    </div>
                    <div className="rounded-[18px] bg-[var(--card)] px-3 py-3 shadow-[var(--shadow-soft)]">
                      <p className="text-[var(--muted)]">个人支出</p>
                      <p className="mt-2 font-semibold">
                        {formatCurrency(member.personalExpenseTotal)}
                      </p>
                    </div>
                    <div className="col-span-2 rounded-[18px] bg-[var(--card)] px-3 py-3 shadow-[var(--shadow-soft)] sm:col-span-1">
                      <p className="text-[var(--muted)]">合计参与</p>
                      <p className="mt-2 font-semibold">
                        {formatCurrency(
                          member.sharedResponsibilityTotal + member.personalExpenseTotal,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle>近 6 个月趋势</CardTitle>
            <CardDescription className="mt-2">
              保持简单，用条形长度看消费波动就够了。
            </CardDescription>
            <div className="mt-5 space-y-4">
              {statistics.trend.map((point) => (
                <div key={point.monthKey}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{formatMonthLabel(point.monthKey)}</span>
                    <span className="text-[var(--muted)]">
                      {formatCurrency(point.expenseTotal)}
                    </span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-[var(--surface)]">
                    <div
                      className="h-full rounded-full bg-[var(--highlight)]"
                      style={{
                        width: `${(point.expenseTotal / maxTrendExpense) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
