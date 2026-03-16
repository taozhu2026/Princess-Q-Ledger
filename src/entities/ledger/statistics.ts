import type {
  Category,
  CategoryBreakdownItem,
  LedgerSnapshot,
  MemberComparisonItem,
  MonthlyStatistics,
  TrendPoint,
} from "@/entities/ledger/types";
import {
  getMonthKey,
  getMonthTransactions,
  getTransactionShares,
} from "@/entities/ledger/settlement";

function findCategory(snapshot: LedgerSnapshot, categoryId: string) {
  return snapshot.categories.find((category) => category.id === categoryId);
}

export function getAvailableMonths(snapshot: LedgerSnapshot) {
  const months = new Set<string>(
    snapshot.transactions
      .filter((transaction) => !transaction.deletedAt)
      .map((transaction) => getMonthKey(transaction.occurredAt)),
  );

  months.add(getMonthKey(new Date()));

  return [...months].sort((left, right) => right.localeCompare(left));
}

export function getRecentTransactions(snapshot: LedgerSnapshot, limit = 5) {
  return snapshot.transactions
    .filter((transaction) => !transaction.deletedAt)
    .sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
    )
    .slice(0, limit);
}

function buildCategoryBreakdown(
  snapshot: LedgerSnapshot,
  monthKey: string,
  expenseTotal: number,
): CategoryBreakdownItem[] {
  const bucket = new Map<string, number>();

  for (const transaction of getMonthTransactions(snapshot, monthKey)) {
    if (transaction.type !== "expense") {
      continue;
    }

    bucket.set(
      transaction.categoryId,
      (bucket.get(transaction.categoryId) ?? 0) + transaction.amount,
    );
  }

  return [...bucket.entries()]
    .map(([categoryId, amount]) => {
      const category = findCategory(snapshot, categoryId);

      return {
        categoryId,
        categoryName: category?.name ?? "未分类",
        amount,
        share: expenseTotal > 0 ? amount / expenseTotal : 0,
        color: category?.color ?? "#b4b0a7",
      };
    })
    .sort((left, right) => right.amount - left.amount);
}

function buildMemberComparison(
  snapshot: LedgerSnapshot,
  monthKey: string,
): MemberComparisonItem[] {
  return snapshot.members.map((member) => {
    let paidExpenseTotal = 0;
    let personalExpenseTotal = 0;
    let sharedResponsibilityTotal = 0;

    for (const transaction of getMonthTransactions(snapshot, monthKey)) {
      if (transaction.type !== "expense") {
        continue;
      }

      if (transaction.payerMemberId === member.id) {
        paidExpenseTotal += transaction.amount;
      }

      const shares = getTransactionShares(snapshot, transaction.id);
      const memberShare =
        shares.find((share) => share.memberId === member.id)?.shareAmount ?? 0;

      if (transaction.isShared) {
        sharedResponsibilityTotal += memberShare;
      } else {
        personalExpenseTotal += memberShare;
      }
    }

    return {
      memberId: member.id,
      displayName: member.displayName,
      paidExpenseTotal,
      sharedResponsibilityTotal,
      personalExpenseTotal,
    };
  });
}

function buildTrend(snapshot: LedgerSnapshot, monthKey: string): TrendPoint[] {
  const current = new Date(`${monthKey}-01T00:00:00`);

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(current.getFullYear(), current.getMonth() - (5 - index), 1);
    const pointKey = getMonthKey(date);
    const expenseTotal = getMonthTransactions(snapshot, pointKey)
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amount, 0);

    return {
      monthKey: pointKey,
      expenseTotal,
    };
  });
}

export function getCategorySuggestions(snapshot: LedgerSnapshot, type: Category["type"]) {
  return snapshot.categories.filter((category) => category.type === type);
}

export function computeMonthlyStatistics(
  snapshot: LedgerSnapshot,
  monthKey: string,
): MonthlyStatistics {
  const monthTransactions = getMonthTransactions(snapshot, monthKey);
  const expenseTotal = monthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const incomeTotal = monthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const sharedExpenseTotal = monthTransactions
    .filter((transaction) => transaction.type === "expense" && transaction.isShared)
    .reduce((total, transaction) => total + transaction.amount, 0);
  const personalExpenseTotal = monthTransactions
    .filter((transaction) => transaction.type === "expense" && !transaction.isShared)
    .reduce((total, transaction) => total + transaction.amount, 0);

  return {
    monthKey,
    expenseTotal,
    incomeTotal,
    sharedExpenseTotal,
    personalExpenseTotal,
    categoryBreakdown: buildCategoryBreakdown(snapshot, monthKey, expenseTotal),
    memberComparison: buildMemberComparison(snapshot, monthKey),
    trend: buildTrend(snapshot, monthKey),
  };
}
