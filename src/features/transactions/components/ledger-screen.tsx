"use client";

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
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";

export function LedgerScreen() {
  const { data } = useLedgerSnapshot();
  const deleteMutation = useDeleteTransactionMutation();
  const openEdit = useTransactionComposerStore((state) => state.openEdit);
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
      <Card>
        <CardTitle>账单</CardTitle>
        <CardDescription className="mt-2">
          按月份、分类、付款人快速筛选；长久使用时仍保持干净清楚。
        </CardDescription>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <select
            className="rounded-[18px] border bg-[var(--surface)] px-4 py-3 text-sm outline-none"
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
            className="rounded-[18px] border bg-[var(--surface)] px-4 py-3 text-sm outline-none"
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
            className="rounded-[18px] border bg-[var(--surface)] px-4 py-3 text-sm outline-none"
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
            className="rounded-[18px] border bg-[var(--surface)] px-4 py-3 text-sm outline-none"
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
          <Card>
            <CardTitle>这个筛选下还没有记录</CardTitle>
            <CardDescription className="mt-2">
              可以换个筛选，或者直接点右下角“记一笔”补录。
            </CardDescription>
          </Card>
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
