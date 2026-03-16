export type TransactionType = "expense" | "income" | "settlement";
export type SplitMethod = "equal" | "custom_amount";
export type ThemePreference = "system" | "light" | "dark";
export type CategoryType = "expense" | "income" | "settlement";
export type LedgerMode = "local" | "supabase";
export type LedgerAuthStatus = "ready" | "signed_out";

export interface LedgerBook {
  id: string;
  name: string;
  currency: string;
  createdAt: string;
}

export interface BookMember {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  accentColor: string;
  role: "owner" | "member";
  joinedAt: string;
}

export interface Category {
  id: string;
  bookId: string | null;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isSystem: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  bookId: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  payerMemberId: string;
  occurredAt: string;
  note: string;
  isShared: boolean;
  splitMethod: SplitMethod;
  createdByMemberId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TransactionShare {
  id: string;
  transactionId: string;
  memberId: string;
  shareAmount: number;
  shareRatio: number | null;
  isSettlementImpact: boolean;
}

export interface Invitation {
  id: string;
  bookId: string;
  token: string;
  inviterMemberId: string | null;
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
}

export interface LedgerViewer {
  userId: string;
  email: string;
  displayName: string;
}

export interface LedgerAuth {
  mode: LedgerMode;
  status: LedgerAuthStatus;
  viewer: LedgerViewer | null;
}

export interface LedgerPreferences {
  activeMemberId: string | null;
  themePreference: ThemePreference;
}

export interface LedgerSnapshot {
  auth: LedgerAuth;
  book: LedgerBook | null;
  members: BookMember[];
  categories: Category[];
  transactions: Transaction[];
  transactionShares: TransactionShare[];
  invitations: Invitation[];
  preferences: LedgerPreferences;
}

export interface ActionResult {
  ok: boolean;
  message: string;
}

export interface ShareInput {
  memberId: string;
  shareAmount: number;
  shareRatio?: number | null;
  isSettlementImpact?: boolean;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  categoryId: string;
  payerMemberId: string;
  occurredAt: string;
  note: string;
  isShared: boolean;
  splitMethod: SplitMethod;
  shareInputs: ShareInput[];
  createdByMemberId: string;
}

export interface LedgerBootstrapInput {
  bookName: string;
  displayName: string;
}

export interface BalanceRow {
  memberId: string;
  displayName: string;
  paidTotal: number;
  shouldShareTotal: number;
  netBalance: number;
}

export interface SettlementSuggestion {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
}

export interface SettlementSummary {
  monthKey: string;
  memberBalances: BalanceRow[];
  suggestedTransfer: SettlementSuggestion | null;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  amount: number;
  share: number;
  color: string;
}

export interface MemberComparisonItem {
  memberId: string;
  displayName: string;
  paidExpenseTotal: number;
  sharedResponsibilityTotal: number;
  personalExpenseTotal: number;
}

export interface TrendPoint {
  monthKey: string;
  expenseTotal: number;
}

export interface MonthlyStatistics {
  monthKey: string;
  expenseTotal: number;
  incomeTotal: number;
  sharedExpenseTotal: number;
  personalExpenseTotal: number;
  categoryBreakdown: CategoryBreakdownItem[];
  memberComparison: MemberComparisonItem[];
  trend: TrendPoint[];
}
