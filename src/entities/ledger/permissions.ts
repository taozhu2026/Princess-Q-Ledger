import type { BookMember, Transaction } from "@/entities/ledger/types";

export function isOwnerMembership(membership: BookMember | null | undefined) {
  return membership?.role === "owner";
}

export function canManageInvitations(membership: BookMember | null | undefined) {
  return isOwnerMembership(membership);
}

export function canManageCategories(membership: BookMember | null | undefined) {
  return isOwnerMembership(membership);
}

export function canManageTransaction({
  transaction,
  viewerMembership,
  viewerUserId,
}: {
  transaction: Transaction;
  viewerMembership: BookMember | null | undefined;
  viewerUserId: string | null | undefined;
}) {
  if (!viewerMembership || !viewerUserId) {
    return false;
  }

  return (
    viewerMembership.role === "owner" ||
    transaction.createdByUserId === viewerUserId
  );
}
