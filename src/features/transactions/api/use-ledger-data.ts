"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { ledgerRepository } from "@/entities/ledger";
import type {
  BookUpdateInput,
  LedgerBootstrapInput,
  CategoryType,
  GetLedgerSnapshotOptions,
  PasswordResetRequestInput,
  PasswordSignInInput,
  PasswordSignUpInput,
  PasswordUpdateInput,
  ProfileUpdateInput,
  ThemePreference,
  TransactionInput,
} from "@/entities/ledger";

const ledgerQueryKey = ["ledger"];

export function useLedgerSnapshot(
  options?: GetLedgerSnapshotOptions & { enabled?: boolean },
) {
  const autoInitialize = options?.autoInitialize ?? true;
  const enabled = options?.enabled ?? true;

  return useQuery({
    enabled,
    queryKey: [...ledgerQueryKey, autoInitialize ? "auto-init" : "read-only"],
    queryFn: () => ledgerRepository.getSnapshot({ autoInitialize }),
  });
}

function useInvalidateLedger() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({
      queryKey: ledgerQueryKey,
    });
  };
}

export function useCreateTransactionMutation() {
  const invalidate = useInvalidateLedger();

  return useMutation({
    mutationFn: (input: TransactionInput) => ledgerRepository.createTransaction(input),
    onSuccess: invalidate,
  });
}

export function useUpdateTransactionMutation() {
  const invalidate = useInvalidateLedger();

  return useMutation({
    mutationFn: ({
      transactionId,
      input,
    }: {
      transactionId: string;
      input: TransactionInput;
    }) => ledgerRepository.updateTransaction(transactionId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteTransactionMutation() {
  const invalidate = useInvalidateLedger();

  return useMutation({
    mutationFn: (transactionId: string) =>
      ledgerRepository.deleteTransaction(transactionId),
    onSuccess: invalidate,
  });
}

export function useSetThemePreferenceMutation() {
  const invalidate = useInvalidateLedger();

  return useMutation({
    mutationFn: (themePreference: ThemePreference) =>
      ledgerRepository.setThemePreference(themePreference),
    onSuccess: invalidate,
  });
}

export function useUpdateProfileMutation() {
  const invalidate = useInvalidateLedger();

  return useMutation({
    mutationFn: (input: ProfileUpdateInput) => ledgerRepository.updateProfile(input),
    onSuccess: invalidate,
  });
}

export function useUpdateBookMutation() {
  const invalidate = useInvalidateLedger();

  return useMutation({
    mutationFn: (input: BookUpdateInput) => ledgerRepository.updateBook(input),
    onSuccess: invalidate,
  });
}

export function useCreateCategoryMutation() {
  const invalidate = useInvalidateLedger();

  return useMutation({
    mutationFn: (input: { name: string; type: CategoryType }) =>
      ledgerRepository.createCategory(input),
    onSuccess: invalidate,
  });
}

export function useDeleteCategoryMutation() {
  const invalidate = useInvalidateLedger();

  return useMutation({
    mutationFn: (categoryId: string) => ledgerRepository.deleteCategory(categoryId),
    onSuccess: invalidate,
  });
}

export function useCreateInvitationMutation() {
  const invalidate = useInvalidateLedger();

  return useMutation({
    mutationFn: () => ledgerRepository.createInvitation(),
    onSuccess: invalidate,
  });
}

export function useRevokeInvitationMutation() {
  const invalidate = useInvalidateLedger();

  return useMutation({
    mutationFn: (invitationId: string) => ledgerRepository.revokeInvitation(invitationId),
    onSuccess: invalidate,
  });
}

export function useAcceptInvitationMutation() {
  const invalidate = useInvalidateLedger();

  return useMutation({
    mutationFn: (token: string) => ledgerRepository.acceptInvitation(token),
    onSuccess: invalidate,
  });
}

export function useConfirmSettlementMutation() {
  const invalidate = useInvalidateLedger();

  return useMutation({
    mutationFn: ({ monthKey, amount }: { monthKey: string; amount: number }) =>
      ledgerRepository.confirmSettlement(monthKey, amount),
    onSuccess: invalidate,
  });
}

export function useSignInWithPasswordMutation() {
  const invalidate = useInvalidateLedger();

  return useMutation({
    mutationFn: (input: PasswordSignInInput) =>
      ledgerRepository.signInWithPassword(input),
    onSuccess: async () => {
      await invalidate();
    },
  });
}

export function useSignUpWithPasswordMutation() {
  const invalidate = useInvalidateLedger();

  return useMutation({
    mutationFn: (input: PasswordSignUpInput) =>
      ledgerRepository.signUpWithPassword(input),
    onSuccess: async () => {
      await invalidate();
    },
  });
}

export function useSendPasswordResetEmailMutation() {
  return useMutation({
    mutationFn: (input: PasswordResetRequestInput) =>
      ledgerRepository.sendPasswordResetEmail(input),
  });
}

export function useUpdatePasswordMutation() {
  const invalidate = useInvalidateLedger();

  return useMutation({
    mutationFn: (input: PasswordUpdateInput) =>
      ledgerRepository.updatePassword(input),
    onSuccess: async () => {
      await invalidate();
    },
  });
}

export function useResetLedgerMutation() {
  const invalidate = useInvalidateLedger();

  return useMutation({
    mutationFn: () => ledgerRepository.reset(),
    onSuccess: invalidate,
  });
}

export function useSendMagicLinkMutation() {
  return useMutation({
    mutationFn: ({
      email,
      nextPath,
    }: {
      email: string;
      nextPath?: string;
    }) => ledgerRepository.sendMagicLink(email, nextPath),
  });
}

export function useSignOutMutation() {
  const invalidate = useInvalidateLedger();

  return useMutation({
    mutationFn: () => ledgerRepository.signOut(),
    onSuccess: invalidate,
  });
}

export function useBootstrapLedgerMutation() {
  const invalidate = useInvalidateLedger();

  return useMutation({
    mutationFn: (input: LedgerBootstrapInput) =>
      ledgerRepository.bootstrapLedger(input),
    onSuccess: invalidate,
  });
}
