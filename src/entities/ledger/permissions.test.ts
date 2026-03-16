import { describe, expect, it } from "vitest";

import { canManageCategories, canManageInvitations, canManageTransaction, isOwnerMembership } from "@/entities/ledger/permissions";
import type { BookMember, Transaction } from "@/entities/ledger/types";

const ownerMembership: BookMember = {
  id: "member-owner",
  userId: "user-owner",
  displayName: "Owner",
  email: "owner@example.com",
  accentColor: "#355f45",
  role: "owner",
  joinedAt: "2026-03-16T00:00:00.000Z",
};

const memberMembership: BookMember = {
  ...ownerMembership,
  id: "member-guest",
  userId: "user-guest",
  role: "member",
};

const transaction: Transaction = {
  id: "txn-1",
  bookId: "book-1",
  type: "expense",
  amount: 88,
  categoryId: "cat-1",
  payerMemberId: "member-owner",
  occurredAt: "2026-03-16T00:00:00.000Z",
  note: "测试",
  isShared: true,
  splitMethod: "equal",
  createdByUserId: "user-owner",
  createdAt: "2026-03-16T00:00:00.000Z",
  updatedAt: "2026-03-16T00:00:00.000Z",
  deletedAt: null,
};

describe("ledger permissions", () => {
  it("treats owner memberships as book managers", () => {
    expect(isOwnerMembership(ownerMembership)).toBe(true);
    expect(canManageInvitations(ownerMembership)).toBe(true);
    expect(canManageCategories(ownerMembership)).toBe(true);
  });

  it("limits invitation and category management for regular members", () => {
    expect(isOwnerMembership(memberMembership)).toBe(false);
    expect(canManageInvitations(memberMembership)).toBe(false);
    expect(canManageCategories(memberMembership)).toBe(false);
  });

  it("allows owners to manage any transaction", () => {
    expect(
      canManageTransaction({
        transaction,
        viewerMembership: ownerMembership,
        viewerUserId: ownerMembership.userId,
      }),
    ).toBe(true);
  });

  it("allows members to manage only their own transactions", () => {
    expect(
      canManageTransaction({
        transaction: {
          ...transaction,
          createdByUserId: memberMembership.userId,
        },
        viewerMembership: memberMembership,
        viewerUserId: memberMembership.userId,
      }),
    ).toBe(true);

    expect(
      canManageTransaction({
        transaction,
        viewerMembership: memberMembership,
        viewerUserId: memberMembership.userId,
      }),
    ).toBe(false);
  });
});
