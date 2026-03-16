import type {
  ActionResult,
  AuthActionResult,
  CategoryType,
  GetLedgerSnapshotOptions,
  LedgerBootstrapInput,
  LedgerSnapshot,
  PasswordResetRequestInput,
  PasswordSignInInput,
  PasswordSignUpInput,
  PasswordUpdateInput,
  ProfileUpdateInput,
  ThemePreference,
  TransactionInput,
} from "@/entities/ledger/types";

export interface LedgerRepository {
  getSnapshot(options?: GetLedgerSnapshotOptions): Promise<LedgerSnapshot>;
  reset(): Promise<LedgerSnapshot>;
  setThemePreference(themePreference: ThemePreference): Promise<LedgerSnapshot>;
  updateProfile(input: ProfileUpdateInput): Promise<LedgerSnapshot>;
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
  signInWithPassword(input: PasswordSignInInput): Promise<AuthActionResult>;
  signUpWithPassword(input: PasswordSignUpInput): Promise<AuthActionResult>;
  sendPasswordResetEmail(
    input: PasswordResetRequestInput,
  ): Promise<AuthActionResult>;
  updatePassword(input: PasswordUpdateInput): Promise<AuthActionResult>;
  sendMagicLink(email: string, nextPath?: string): Promise<AuthActionResult>;
  signOut(): Promise<void>;
  bootstrapLedger(input: LedgerBootstrapInput): Promise<ActionResult>;
}
