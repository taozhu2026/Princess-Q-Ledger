import type {
  LedgerAuth,
  LedgerSnapshot,
  ThemePreference,
} from "@/entities/ledger/types";

export function createEmptyLedgerSnapshot({
  auth,
  themePreference = "system",
}: {
  auth: LedgerAuth;
  themePreference?: ThemePreference;
}): LedgerSnapshot {
  return {
    auth,
    book: null,
    members: [],
    categories: [],
    transactions: [],
    transactionShares: [],
    invitations: [],
    preferences: {
      activeMemberId: null,
      themePreference,
    },
  };
}
