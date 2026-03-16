import { getDefaultLedgerSnapshot } from "@/entities/ledger/default-ledger";
import {
  getMonthKey,
  getTransactionShares,
} from "@/entities/ledger/settlement";
import { readLedgerSnapshot, writeLedgerSnapshot } from "@/entities/ledger/storage";
import type { LedgerRepository } from "@/entities/ledger/repository-types";
import type {
  BookUpdateInput,
  CategoryType,
  Invitation,
  LedgerSnapshot,
  ProfileUpdateInput,
  ThemePreference,
  TransactionInput,
} from "@/entities/ledger/types";

function cloneSnapshot(snapshot: LedgerSnapshot) {
  return JSON.parse(JSON.stringify(snapshot)) as LedgerSnapshot;
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function withSnapshot<T>(handler: (snapshot: LedgerSnapshot) => T): T {
  const snapshot = cloneSnapshot(readLedgerSnapshot());
  const result = handler(snapshot);
  writeLedgerSnapshot(snapshot);
  return result;
}

function roundAmount(value: number) {
  return Number(value.toFixed(2));
}

function getTransactionIndex(snapshot: LedgerSnapshot, transactionId: string) {
  return snapshot.transactions.findIndex(
    (transaction) => transaction.id === transactionId,
  );
}

export const localLedgerRepository: LedgerRepository = {
  async getSnapshot() {
    return cloneSnapshot(readLedgerSnapshot());
  },

  async reset() {
    const snapshot = getDefaultLedgerSnapshot();
    writeLedgerSnapshot(snapshot);
    return cloneSnapshot(snapshot);
  },

  async updateProfile(input: ProfileUpdateInput) {
    return withSnapshot((snapshot) => {
      const displayName = input.displayName.trim();
      const viewerUserId = snapshot.auth.viewer?.userId;

      if (!viewerUserId || !displayName) {
        return cloneSnapshot(snapshot);
      }

      if (snapshot.auth.viewer) {
        snapshot.auth.viewer.displayName = displayName;
      }

      snapshot.members = snapshot.members.map((member) =>
        member.userId === viewerUserId
          ? {
              ...member,
              displayName,
            }
          : member,
      );
      snapshot.viewerMembership =
        snapshot.members.find((member) => member.userId === viewerUserId) ?? null;

      return cloneSnapshot(snapshot);
    });
  },

  async setThemePreference(themePreference: ThemePreference) {
    return withSnapshot((snapshot) => {
      snapshot.preferences.themePreference = themePreference;
      return cloneSnapshot(snapshot);
    });
  },

  async updateBook(input: BookUpdateInput) {
    return withSnapshot((snapshot) => {
      const name = input.name.trim();

      if (!snapshot.book || !name) {
        return cloneSnapshot(snapshot);
      }

      snapshot.book.name = name;
      return cloneSnapshot(snapshot);
    });
  },

  async createCategory(input: { name: string; type: CategoryType }) {
    return withSnapshot((snapshot) => {
      snapshot.categories.unshift({
        id: makeId("cat"),
        bookId: snapshot.book?.id ?? null,
        name: input.name.trim(),
        type: input.type,
        icon: input.type === "income" ? "Wallet" : "NotebookTabs",
        color: input.type === "income" ? "#80a771" : "#b98c68",
        isSystem: false,
        createdAt: new Date().toISOString(),
      });

      return cloneSnapshot(snapshot);
    });
  },

  async deleteCategory(categoryId: string) {
    return withSnapshot((snapshot) => {
      const category = snapshot.categories.find((entry) => entry.id === categoryId);
      const isUsed = snapshot.transactions.some(
        (transaction) =>
          transaction.categoryId === categoryId && transaction.deletedAt === null,
      );

      if (!category || category.isSystem || isUsed) {
        return cloneSnapshot(snapshot);
      }

      snapshot.categories = snapshot.categories.filter(
        (entry) => entry.id !== categoryId,
      );

      return cloneSnapshot(snapshot);
    });
  },

  async createTransaction(input: TransactionInput) {
    return withSnapshot((snapshot) => {
      const now = new Date().toISOString();
      const transactionId = makeId("txn");

      snapshot.transactions.unshift({
        id: transactionId,
        bookId: snapshot.book?.id ?? "book-princess-q",
        type: input.type,
        amount: roundAmount(input.amount),
        categoryId: input.categoryId,
        payerMemberId: input.payerMemberId,
        occurredAt: input.occurredAt,
        note: input.note.trim(),
        isShared: input.isShared,
        splitMethod: input.splitMethod,
        createdByUserId: input.createdByUserId,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });

      snapshot.transactionShares = snapshot.transactionShares.concat(
        input.shareInputs.map((share) => ({
          id: makeId("share"),
          transactionId,
          memberId: share.memberId,
          shareAmount: roundAmount(share.shareAmount),
          shareRatio: share.shareRatio ?? null,
          isSettlementImpact: share.isSettlementImpact ?? false,
        })),
      );

      return cloneSnapshot(snapshot);
    });
  },

  async updateTransaction(transactionId: string, input: TransactionInput) {
    return withSnapshot((snapshot) => {
      const index = getTransactionIndex(snapshot, transactionId);
      if (index === -1) {
        return cloneSnapshot(snapshot);
      }

      snapshot.transactions[index] = {
        ...snapshot.transactions[index],
        type: input.type,
        amount: roundAmount(input.amount),
        categoryId: input.categoryId,
        payerMemberId: input.payerMemberId,
        occurredAt: input.occurredAt,
        note: input.note.trim(),
        isShared: input.isShared,
        splitMethod: input.splitMethod,
        updatedAt: new Date().toISOString(),
      };

      snapshot.transactionShares = snapshot.transactionShares.filter(
        (share) => share.transactionId !== transactionId,
      );
      snapshot.transactionShares = snapshot.transactionShares.concat(
        input.shareInputs.map((share) => ({
          id: makeId("share"),
          transactionId,
          memberId: share.memberId,
          shareAmount: roundAmount(share.shareAmount),
          shareRatio: share.shareRatio ?? null,
          isSettlementImpact: share.isSettlementImpact ?? false,
        })),
      );

      return cloneSnapshot(snapshot);
    });
  },

  async deleteTransaction(transactionId: string) {
    return withSnapshot((snapshot) => {
      const index = getTransactionIndex(snapshot, transactionId);
      if (index === -1) {
        return cloneSnapshot(snapshot);
      }

      snapshot.transactions[index] = {
        ...snapshot.transactions[index],
        deletedAt: new Date().toISOString(),
      };

      return cloneSnapshot(snapshot);
    });
  },

  async createInvitation() {
    return withSnapshot((snapshot) => {
      const invitation: Invitation = {
        id: makeId("invite"),
        bookId: snapshot.book?.id ?? "book-princess-q",
        token: Math.random().toString(36).slice(2, 10),
        inviterMemberId: snapshot.viewerMembership?.id ?? null,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        acceptedAt: null,
      };

      snapshot.invitations.unshift(invitation);

      return {
        ok: true,
        message: invitation.token,
      };
    });
  },

  async revokeInvitation(invitationId: string) {
    return withSnapshot((snapshot) => {
      snapshot.invitations = snapshot.invitations.filter(
        (invitation) => invitation.id !== invitationId,
      );

      return cloneSnapshot(snapshot);
    });
  },

  async acceptInvitation(token: string) {
    return withSnapshot((snapshot) => {
      const invitation = snapshot.invitations.find((entry) => entry.token === token);
      if (!invitation) {
        return {
          ok: false,
          message: "邀请不存在或已失效。",
        };
      }

      if (invitation.acceptedAt) {
        return {
          ok: false,
          message: "这条邀请已经被使用过了。",
        };
      }

      if (new Date(invitation.expiresAt).getTime() < Date.now()) {
        return {
          ok: false,
          message: "邀请已过期，请重新生成。",
        };
      }

      invitation.acceptedAt = new Date().toISOString();

      return {
        ok: true,
        message: "已加入账本，现在可以开始一起记账了。",
      };
    });
  },

  async confirmSettlement(monthKey: string, amount: number) {
    return withSnapshot((snapshot) => {
      const monthTransactions = snapshot.transactions.filter(
        (transaction) =>
          transaction.deletedAt === null &&
          getMonthKey(transaction.occurredAt) === monthKey &&
          transaction.type !== "income",
      );

      const balances = snapshot.members.map((member) => {
        let paidTotal = 0;
        let shouldShareTotal = 0;

        for (const transaction of monthTransactions) {
          const shares = getTransactionShares(snapshot, transaction.id);
          if (transaction.payerMemberId === member.id) {
            paidTotal += transaction.amount;
          }

          shouldShareTotal += shares
            .filter(
              (share) =>
                share.memberId === member.id &&
                (transaction.type === "expense" || share.isSettlementImpact),
            )
            .reduce((total, share) => total + share.shareAmount, 0);
        }

        return {
          memberId: member.id,
          netBalance: paidTotal - shouldShareTotal,
        };
      });

      const receiver =
        [...balances].sort((left, right) => right.netBalance - left.netBalance)[0] ??
        null;
      const payer =
        [...balances].sort((left, right) => left.netBalance - right.netBalance)[0] ??
        null;

      if (!receiver || !payer || receiver.memberId === payer.memberId || !snapshot.book) {
        return cloneSnapshot(snapshot);
      }

      const transactionId = makeId("txn");
      const now = new Date().toISOString();

      snapshot.transactions.unshift({
        id: transactionId,
        bookId: snapshot.book.id,
        type: "settlement",
        amount: roundAmount(amount),
        categoryId: "cat-settlement",
        payerMemberId: payer.memberId,
        occurredAt: now,
        note: `结算 ${amount.toFixed(2)} 元`,
        isShared: false,
        splitMethod: "custom_amount",
        createdByUserId:
          snapshot.auth.viewer?.userId ??
          snapshot.members.find((member) => member.id === payer.memberId)?.userId ??
          "",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });

      snapshot.transactionShares.push({
        id: makeId("share"),
        transactionId,
        memberId: receiver.memberId,
        shareAmount: roundAmount(amount),
        shareRatio: 1,
        isSettlementImpact: true,
      });

      return cloneSnapshot(snapshot);
    });
  },

  async signInWithPassword() {
    return {
      ok: true,
      message: "当前是本地演示模式，不需要登录。",
      nextStep: "signed_in" as const,
    };
  },

  async signUpWithPassword() {
    return {
      ok: true,
      message: "当前是本地演示模式，不需要注册。",
      nextStep: "signed_in" as const,
    };
  },

  async sendPasswordResetEmail() {
    return {
      ok: true,
      message: "当前是本地演示模式，不需要重置密码。",
      nextStep: "check_email" as const,
    };
  },

  async updatePassword() {
    return {
      ok: true,
      message: "当前是本地演示模式，密码设置不会生效。",
      nextStep: "password_updated" as const,
    };
  },

  async sendMagicLink() {
    return {
      ok: true,
      message: "当前是本地演示模式，不需要登录。",
      nextStep: "signed_in" as const,
    };
  },

  async signOut() {
    return;
  },

  async bootstrapLedger() {
    return {
      ok: true,
      message: "当前是本地演示模式。",
    };
  },
};
