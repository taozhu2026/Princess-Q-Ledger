import type {
  BookMember,
  LedgerSnapshot,
  SettlementSummary,
  Transaction,
  TransactionShare,
} from "@/entities/ledger/types";

export function getMonthKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getActiveTransactions(snapshot: LedgerSnapshot) {
  return snapshot.transactions
    .filter((transaction) => !transaction.deletedAt)
    .sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
    );
}

export function getTransactionShares(
  snapshot: LedgerSnapshot,
  transactionId: string,
) {
  return snapshot.transactionShares.filter(
    (share) => share.transactionId === transactionId,
  );
}

export function getMonthTransactions(snapshot: LedgerSnapshot, monthKey: string) {
  return getActiveTransactions(snapshot).filter(
    (transaction) => getMonthKey(transaction.occurredAt) === monthKey,
  );
}

function buildBalanceRow(
  member: BookMember,
  transactions: Transaction[],
  allShares: TransactionShare[],
) {
  let paidTotal = 0;
  let shouldShareTotal = 0;

  for (const transaction of transactions) {
    const shares = allShares.filter((share) => share.transactionId === transaction.id);
    if (transaction.type === "expense") {
      if (transaction.payerMemberId === member.id) {
        paidTotal += transaction.amount;
      }

      shouldShareTotal += shares
        .filter((share) => share.memberId === member.id)
        .reduce((total, share) => total + share.shareAmount, 0);
    }

    if (transaction.type === "settlement") {
      if (transaction.payerMemberId === member.id) {
        paidTotal += transaction.amount;
      }

      shouldShareTotal += shares
        .filter(
          (share) => share.memberId === member.id && share.isSettlementImpact,
        )
        .reduce((total, share) => total + share.shareAmount, 0);
    }
  }

  return {
    memberId: member.id,
    displayName: member.displayName,
    paidTotal,
    shouldShareTotal,
    netBalance: paidTotal - shouldShareTotal,
  };
}

export function computeSettlementSummary(
  snapshot: LedgerSnapshot,
  monthKey: string,
): SettlementSummary {
  const monthTransactions = getMonthTransactions(snapshot, monthKey).filter(
    (transaction) => transaction.type !== "income",
  );

  const memberBalances = snapshot.members
    .map((member) =>
      buildBalanceRow(member, monthTransactions, snapshot.transactionShares),
    )
    .sort((left, right) => right.netBalance - left.netBalance);

  const positive = memberBalances.find((row) => row.netBalance > 0.01) ?? null;
  const negative =
    [...memberBalances].reverse().find((row) => row.netBalance < -0.01) ?? null;

  const suggestedTransfer =
    positive && negative
      ? {
          fromMemberId: negative.memberId,
          toMemberId: positive.memberId,
          amount: Math.min(positive.netBalance, Math.abs(negative.netBalance)),
        }
      : null;

  return {
    monthKey,
    memberBalances,
    suggestedTransfer,
  };
}
