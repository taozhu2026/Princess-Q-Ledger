"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { TransactionType } from "@/entities/ledger";
import { OFFLINE_DRAFT_STORAGE_KEY } from "@/shared/config/app";

export interface TransactionFormState {
  type: TransactionType;
  amount: string;
  categoryId: string;
  payerMemberId: string;
  occurredAt: string;
  note: string;
  splitPreset: "equal" | "self";
}

interface PendingDraft {
  id: string;
  createdAt: string;
  payload: TransactionFormState;
}

interface TransactionComposerStore {
  isOpen: boolean;
  editingTransactionId: string | null;
  restoreDraftId: string | null;
  pendingDrafts: PendingDraft[];
  openCreate: (draftId?: string | null) => void;
  openEdit: (transactionId: string) => void;
  close: () => void;
  saveOfflineDraft: (payload: TransactionFormState) => void;
  dropDraft: (draftId: string) => void;
}

export const useTransactionComposerStore = create<TransactionComposerStore>()(
  persist(
    (set) => ({
      isOpen: false,
      editingTransactionId: null,
      restoreDraftId: null,
      pendingDrafts: [],
      openCreate: (draftId = null) =>
        set({
          isOpen: true,
          editingTransactionId: null,
          restoreDraftId: draftId,
        }),
      openEdit: (transactionId) =>
        set({
          isOpen: true,
          editingTransactionId: transactionId,
          restoreDraftId: null,
        }),
      close: () =>
        set({
          isOpen: false,
          editingTransactionId: null,
          restoreDraftId: null,
        }),
      saveOfflineDraft: (payload) =>
        set((state) => ({
          pendingDrafts: [
            {
              id: Math.random().toString(36).slice(2, 10),
              createdAt: new Date().toISOString(),
              payload,
            },
            ...state.pendingDrafts,
          ],
        })),
      dropDraft: (draftId) =>
        set((state) => ({
          pendingDrafts: state.pendingDrafts.filter((draft) => draft.id !== draftId),
          restoreDraftId:
            state.restoreDraftId === draftId ? null : state.restoreDraftId,
        })),
    }),
    {
      name: OFFLINE_DRAFT_STORAGE_KEY,
      partialize: (state) => ({
        pendingDrafts: state.pendingDrafts,
      }),
    },
  ),
);
