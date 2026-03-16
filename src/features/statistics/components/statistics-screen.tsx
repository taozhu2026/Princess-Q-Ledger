"use client";

import { useState } from "react";

import {
  computeMonthlyStatistics,
  getAvailableMonths,
} from "@/entities/ledger";
import { useLedgerSnapshot } from "@/features/transactions/api/use-ledger-data";
import { formatCurrency, formatMonthLabel } from "@/shared/lib/utils";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";

export function StatisticsScreen() {
  const { data } = useLedgerSnapshot();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  if (!data) {
    return null;
  }

  const months = getAvailableMonths(data);
  const monthKey = selectedMonth ?? months[0];
  const statistics = computeMonthlyStatistics(data, monthKey);
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
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>统计</CardTitle>
            <CardDescription className="mt-2">
              先把重要的数据看清楚，不做复杂图表，也能每天快速判断本月状态。
            </CardDescription>
          </div>
          <select
            className="rounded-full border bg-[var(--surface)] px-4 py-2 text-sm outline-none"
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

      <Card>
        <CardTitle>分类占比</CardTitle>
        <CardDescription className="mt-2">
          当前只统计支出分类，收入单独记录，不混在消费里。
        </CardDescription>
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
        <CardTitle>双方对比</CardTitle>
        <CardDescription className="mt-2">
          同时看实际付款、共同承担和个人支出，方便判断谁最近垫付更多。
        </CardDescription>
        <div className="mt-5 space-y-4">
          {statistics.memberComparison.map((member) => (
            <div
              key={member.memberId}
              className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{member.displayName}</h3>
                <span className="text-sm text-[var(--muted)]">
                  实付 {formatCurrency(member.paidExpenseTotal)}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-[18px] bg-[var(--card)] px-3 py-3">
                  <p className="text-[var(--muted)]">共同承担</p>
                  <p className="mt-2 font-semibold">
                    {formatCurrency(member.sharedResponsibilityTotal)}
                  </p>
                </div>
                <div className="rounded-[18px] bg-[var(--card)] px-3 py-3">
                  <p className="text-[var(--muted)]">个人支出</p>
                  <p className="mt-2 font-semibold">
                    {formatCurrency(member.personalExpenseTotal)}
                  </p>
                </div>
                <div className="rounded-[18px] bg-[var(--card)] px-3 py-3 sm:col-span-1 col-span-2">
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
          保持简单，用条形长度看消费的月波动就够了。
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
    </div>
  );
}
