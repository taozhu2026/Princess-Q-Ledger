import { describe, expect, it } from "vitest";

import { getDefaultLedgerSnapshot } from "@/entities/ledger/default-ledger";
import { computeSettlementSummary, getMonthKey } from "@/entities/ledger/settlement";

describe("computeSettlementSummary", () => {
  it("should suggest the correct transfer for the current month", () => {
    const snapshot = getDefaultLedgerSnapshot();
    const currentMonth = getMonthKey(new Date());

    const summary = computeSettlementSummary(snapshot, currentMonth);

    expect(summary.suggestedTransfer).toEqual({
      fromMemberId: "member-azhe",
      toMemberId: "member-qq",
      amount: 36,
    });
  });

  it("should clear the settlement suggestion after a matching settlement transaction", () => {
    const snapshot = getDefaultLedgerSnapshot();
    const currentMonth = getMonthKey(new Date());

    snapshot.transactions.unshift({
      id: "txn-settlement-test",
      bookId: snapshot.book!.id,
      type: "settlement",
      amount: 36,
      categoryId: "cat-settlement",
      payerMemberId: "member-azhe",
      occurredAt: new Date().toISOString(),
      note: "手动测试结算",
      isShared: false,
      splitMethod: "custom_amount",
      createdByMemberId: "member-azhe",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    });
    snapshot.transactionShares.push({
      id: "share-settlement-test",
      transactionId: "txn-settlement-test",
      memberId: "member-qq",
      shareAmount: 36,
      shareRatio: 1,
      isSettlementImpact: true,
    });

    const summary = computeSettlementSummary(snapshot, currentMonth);

    expect(summary.suggestedTransfer).toBeNull();
  });
});
