import type {
  ActionResult,
  CategoryType,
  LedgerBootstrapInput,
  LedgerSnapshot,
  ThemePreference,
  TransactionInput,
} from "@/entities/ledger/types";

export interface LedgerRepository {
  getSnapshot(): Promise<LedgerSnapshot>;
  reset(): Promise<LedgerSnapshot>;
  setActiveMember(memberId: string): Promise<LedgerSnapshot>;
  setThemePreference(themePreference: ThemePreference): Promise<LedgerSnapshot>;
  createCategory(input: { name: string; type: CategoryType }): Promise<LedgerSnapshot>;
  deleteCategory(categoryId: string): Promise<LedgerSnapshot>;
  createTransaction(input: TransactionInput): Promise<LedgerSnapshot>;
  updateTransaction(
    transactionId: string,
    input: TransactionInput,
  ): Promise<LedgerSnapshot>;
  deleteTransaction(transactionId: string): Promise<LedgerSnapshot>;
  createInvitation(): Promise<ActionResult>;
  acceptInvitation(token: string): Promise<ActionResult>;
  confirmSettlement(monthKey: string, amount: number): Promise<LedgerSnapshot>;
  sendMagicLink(email: string, nextPath?: string): Promise<ActionResult>;
  signOut(): Promise<void>;
  bootstrapLedger(input: LedgerBootstrapInput): Promise<ActionResult>;
}
