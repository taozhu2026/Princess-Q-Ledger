import { describe, expect, it } from "vitest";

import { getDefaultLedgerSnapshot } from "@/entities/ledger/default-ledger";
import { getMonthKey } from "@/entities/ledger/settlement";
import { computeMonthlyStatistics } from "@/entities/ledger/statistics";

describe("computeMonthlyStatistics", () => {
  it("should aggregate the current month totals from the seed data", () => {
    const snapshot = getDefaultLedgerSnapshot();
    const currentMonth = getMonthKey(new Date());

    const statistics = computeMonthlyStatistics(snapshot, currentMonth);

    expect(statistics.expenseTotal).toBe(296);
    expect(statistics.incomeTotal).toBe(12000);
    expect(statistics.sharedExpenseTotal).toBe(264);
    expect(statistics.personalExpenseTotal).toBe(32);
    expect(statistics.categoryBreakdown[0]).toMatchObject({
      categoryId: "cat-food",
      amount: 200,
    });
  });
});
