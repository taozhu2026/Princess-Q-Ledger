import { localLedgerRepository } from "@/entities/ledger/local-ledger-repository";
import { supabaseLedgerRepository } from "@/entities/ledger/supabase-ledger-repository";
import type { LedgerRepository } from "@/entities/ledger/repository-types";
import { createSupabaseBrowserClient } from "@/shared/lib/supabase/browser";

function resolveLedgerRepository(): LedgerRepository {
  return createSupabaseBrowserClient() ? supabaseLedgerRepository : localLedgerRepository;
}

export const ledgerRepository: LedgerRepository = {
  getSnapshot(options) {
    return resolveLedgerRepository().getSnapshot(options);
  },
  reset() {
    return resolveLedgerRepository().reset();
  },
  setThemePreference(themePreference) {
    return resolveLedgerRepository().setThemePreference(themePreference);
  },
  updateProfile(input) {
    return resolveLedgerRepository().updateProfile(input);
  },
  createCategory(input) {
    return resolveLedgerRepository().createCategory(input);
  },
  deleteCategory(categoryId) {
    return resolveLedgerRepository().deleteCategory(categoryId);
  },
  createTransaction(input) {
    return resolveLedgerRepository().createTransaction(input);
  },
  updateTransaction(transactionId, input) {
    return resolveLedgerRepository().updateTransaction(transactionId, input);
  },
  deleteTransaction(transactionId) {
    return resolveLedgerRepository().deleteTransaction(transactionId);
  },
  createInvitation() {
    return resolveLedgerRepository().createInvitation();
  },
  acceptInvitation(token) {
    return resolveLedgerRepository().acceptInvitation(token);
  },
  confirmSettlement(monthKey, amount) {
    return resolveLedgerRepository().confirmSettlement(monthKey, amount);
  },
  sendMagicLink(email, nextPath) {
    return resolveLedgerRepository().sendMagicLink(email, nextPath);
  },
  signOut() {
    return resolveLedgerRepository().signOut();
  },
  bootstrapLedger(input) {
    return resolveLedgerRepository().bootstrapLedger(input);
  },
};
