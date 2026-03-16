"use client";

import { Filter, PawPrint } from "lucide-react";
import { useState } from "react";

import {
  getAvailableMonths,
  getMonthTransactions,
  getTransactionShares,
} from "@/entities/ledger";
import {
  useDeleteTransactionMutation,
  useLedgerSnapshot,
} from "@/features/transactions/api/use-ledger-data";
import { useTransactionComposerStore } from "@/features/transactions/store/transaction-composer-store";
import { TransactionItem } from "@/features/transactions/components/transaction-item";
import { formatMonthLabel } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";

export function LedgerScreen() {
  const { data } = useLedgerSnapshot();
  const deleteMutation = useDeleteTransactionMutation();
  const openEdit = useTransactionComposerStore((state) => state.openEdit);
  const openCreate = useTransactionComposerStore((state) => state.openCreate);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPayer, setSelectedPayer] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  if (!data) {
    return null;
  }

  const months = getAvailableMonths(data);
  const monthKey = selectedMonth ?? months[0];
  const transactions = getMonthTransactions(data, monthKey).filter((transaction) => {
    if (selectedCategory !== "all" && transaction.categoryId !== selectedCategory) {
      return false;
    }

    if (selectedPayer !== "all" && transaction.payerMemberId !== selectedPayer) {
      return false;
    }

    if (selectedType !== "all" && transaction.type !== selectedType) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      <Card className="theme-card-hero overflow-hidden">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--highlight-soft)] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[#ba835f]">
          <PawPrint className="h-3.5 w-3.5" />
          LEDGER VIEW
        </div>
        <CardTitle className="mt-3 text-[24px] tracking-[-0.02em]">账单</CardTitle>
        <CardDescription className="mt-2">
          像翻猫咪日记一样看每一笔记录。筛选条件都收在一块，查起来更轻。
        </CardDescription>

        <div className="mt-5 flex items-center gap-2 text-sm text-[var(--muted)]">
          <Filter className="h-4 w-4" />
          筛选条件
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <select
            className="theme-select-surface rounded-[18px] border px-4 py-3 text-sm outline-none shadow-[0_8px_14px_rgba(111,159,134,0.05)]"
            onChange={(event) => setSelectedMonth(event.target.value)}
            value={monthKey}
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {formatMonthLabel(month)}
              </option>
            ))}
          </select>

          <select
            className="theme-select-surface rounded-[18px] border px-4 py-3 text-sm outline-none shadow-[0_8px_14px_rgba(111,159,134,0.05)]"
            onChange={(event) => setSelectedCategory(event.target.value)}
            value={selectedCategory}
          >
            <option value="all">全部分类</option>
            {data.categories
              .filter((category) => category.type !== "settlement")
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>

          <select
            className="theme-select-surface rounded-[18px] border px-4 py-3 text-sm outline-none shadow-[0_8px_14px_rgba(111,159,134,0.05)]"
            onChange={(event) => setSelectedPayer(event.target.value)}
            value={selectedPayer}
          >
            <option value="all">全部付款人</option>
            {data.members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.displayName}
              </option>
            ))}
          </select>

          <select
            className="theme-select-surface rounded-[18px] border px-4 py-3 text-sm outline-none shadow-[0_8px_14px_rgba(111,159,134,0.05)]"
            onChange={(event) => setSelectedType(event.target.value)}
            value={selectedType}
          >
            <option value="all">全部类型</option>
            <option value="expense">支出</option>
            <option value="income">收入</option>
            <option value="settlement">结算</option>
          </select>
        </div>
      </Card>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <EmptyState
            action={<Button onClick={() => openCreate()}>去添加第一笔</Button>}
            description="可以换个筛选，或者直接点右下角先补一笔。这里会像猫咪窝一样慢慢堆起你的记录。"
            title="这个筛选下还没有记录"
          />
        ) : (
          transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              category={data.categories.find(
                (category) => category.id === transaction.categoryId,
              )}
              onDelete={(transactionId) => deleteMutation.mutate(transactionId)}
              onEdit={(transactionId) => openEdit(transactionId)}
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
