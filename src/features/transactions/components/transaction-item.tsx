"use client";

import { PawPrint, Pencil, Trash2 } from "lucide-react";

import type { BookMember, Category, Transaction, TransactionShare } from "@/entities/ledger";
import { formatCurrency, formatShortDate, formatTime } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  payer?: BookMember;
  shares: TransactionShare[];
  onEdit?: (transactionId: string) => void;
  onDelete?: (transactionId: string) => void;
}

function buildShareText(
  transaction: Transaction,
  shares: TransactionShare[],
  payer?: BookMember,
) {
  if (transaction.type === "settlement") {
    const receiverId = shares.find((share) => share.isSettlementImpact)?.memberId;
    return receiverId && payer
      ? `${payer.displayName} 已向对方结算`
      : "结算记录";
  }

  if (transaction.type === "income") {
    return "收入记录";
  }

  if (transaction.isShared) {
    return `${
      transaction.splitMethod === "equal" ? "共同平分" : "自定义分摊"
    } · ${shares.length} 人参与`;
  }

  return `${payer?.displayName ?? "自己"} 自己承担`;
}

export function TransactionItem({
  transaction,
  category,
  payer,
  shares,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const amountSign = transaction.type === "income" ? "+" : "-";

  return (
    <article className="theme-surface-card-strong overflow-hidden rounded-[28px] border p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-medium shadow-[0_6px_14px_rgba(0,0,0,0.05)]"
              style={{
                backgroundColor: `${category?.color ?? "#ded8ca"}33`,
                color: category?.color ?? "var(--foreground)",
              }}
            >
              {category?.name ?? "未分类"}
            </span>
            <span className="text-xs text-[var(--muted)]">
              {formatShortDate(transaction.occurredAt)} · {formatTime(transaction.occurredAt)}
            </span>
          </div>
          <h3 className="mt-3 text-base font-semibold">{transaction.note || "未填写备注"}</h3>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)]">
            <PawPrint className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span>
              {payer?.displayName ?? "未知"} 付款 · {buildShareText(transaction, shares, payer)}
            </span>
          </div>
        </div>

        <div className="text-right">
          <p
            className={cn(
              "text-lg font-semibold",
              transaction.type === "income"
                ? "text-[var(--accent)]"
                : "text-[var(--foreground)]",
            )}
          >
            {amountSign}
            {formatCurrency(transaction.amount)}
          </p>

          <div className="mt-3 flex items-center justify-end gap-2">
            {transaction.type !== "settlement" && onEdit ? (
              <Button
                aria-label="编辑记录"
                className="theme-elevated-surface"
                onClick={() => onEdit(transaction.id)}
                size="icon"
                variant="ghost"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                aria-label="删除记录"
                className="theme-elevated-surface"
                onClick={() => onDelete(transaction.id)}
                size="icon"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
