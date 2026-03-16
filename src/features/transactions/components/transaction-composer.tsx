"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  getTransactionShares,
  type TransactionInput,
} from "@/entities/ledger";
import {
  useCreateTransactionMutation,
  useLedgerSnapshot,
  useUpdateTransactionMutation,
} from "@/features/transactions/api/use-ledger-data";
import {
  type TransactionFormState,
  useTransactionComposerStore,
} from "@/features/transactions/store/transaction-composer-store";
import { getErrorMessage } from "@/shared/lib/errors";
import { clampCurrencyInput, cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

function toDateTimeInput(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromDateTimeInput(value: string) {
  return value ? new Date(value).toISOString() : new Date().toISOString();
}

function splitEvenly(memberIds: string[], amount: number) {
  const base = Math.floor((amount / memberIds.length) * 100) / 100;
  const remainder = Math.round((amount - base * memberIds.length) * 100) / 100;

  return memberIds.map((memberId, index) => {
    const extra = index === memberIds.length - 1 ? remainder : 0;
    return {
      memberId,
      shareAmount: Number((base + extra).toFixed(2)),
      shareRatio: 1 / memberIds.length,
      isSettlementImpact: false,
    };
  });
}

function buildDefaultForm(
  viewerMemberId: string,
  categoryId: string,
): TransactionFormState {
  return {
    type: "expense",
    amount: "",
    categoryId,
    payerMemberId: viewerMemberId,
    occurredAt: toDateTimeInput(new Date().toISOString()),
    note: "",
    splitPreset: "equal",
  };
}

export function TransactionComposer() {
  const { data } = useLedgerSnapshot();
  const {
    isOpen,
    editingTransactionId,
    restoreDraftId,
    pendingDrafts,
  } = useTransactionComposerStore();

  if (!isOpen || !data) {
    return null;
  }

  const expenseCategories = data.categories.filter(
    (category) => category.type === "expense",
  );
  const fallbackCategoryId = expenseCategories[0]?.id ?? data.categories[0]?.id ?? "";
  const draft = restoreDraftId
    ? pendingDrafts.find((entry) => entry.id === restoreDraftId)
    : null;
  const transaction = editingTransactionId
    ? data.transactions.find((entry) => entry.id === editingTransactionId)
    : null;
  const viewerMemberId = data.viewerMembership?.id ?? data.members[0]?.id ?? "";

  let initialForm = buildDefaultForm(viewerMemberId, fallbackCategoryId);

  if (draft) {
    initialForm = draft.payload;
  } else if (transaction) {
    const shares = getTransactionShares(data, transaction.id);
    const splitPreset =
      transaction.type === "expense" && transaction.isShared && shares.length > 1
        ? "equal"
        : "self";

    initialForm = {
      type: transaction.type,
      amount: String(transaction.amount),
      categoryId: transaction.categoryId,
      payerMemberId: transaction.payerMemberId,
      occurredAt: toDateTimeInput(transaction.occurredAt),
      note: transaction.note,
      splitPreset,
    };
  }

  return (
    <TransactionComposerSheet
      data={data}
      editingTransactionId={editingTransactionId}
      initialForm={initialForm}
      key={`${editingTransactionId ?? "new"}:${restoreDraftId ?? "live"}:${
        data.viewerMembership?.id ?? "viewer"
      }`}
      restoreDraftId={restoreDraftId}
    />
  );
}

function TransactionComposerSheet({
  data,
  editingTransactionId,
  initialForm,
  restoreDraftId,
}: {
  data: NonNullable<ReturnType<typeof useLedgerSnapshot>["data"]>;
  editingTransactionId: string | null;
  initialForm: TransactionFormState;
  restoreDraftId: string | null;
}) {
  const createMutation = useCreateTransactionMutation();
  const updateMutation = useUpdateTransactionMutation();
  const close = useTransactionComposerStore((state) => state.close);
  const dropDraft = useTransactionComposerStore((state) => state.dropDraft);
  const saveOfflineDraft = useTransactionComposerStore(
    (state) => state.saveOfflineDraft,
  );
  const [form, setForm] = useState<TransactionFormState>(initialForm);
  const [localMessage, setLocalMessage] = useState("");
  const [isOnline, setIsOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const categoryOptions = data.categories.filter((category) =>
    form.type === "income"
      ? category.type === "income"
      : category.type === "expense",
  );

  const submit = async () => {
    const amount = Number(form.amount);
    if (!amount || !form.categoryId) {
      setLocalMessage("请先补全金额和分类。");
      return;
    }

    if (!isOnline) {
      if (editingTransactionId) {
        setLocalMessage("当前离线，已有记录暂不支持离线修改，请联网后再保存。");
        return;
      }

      saveOfflineDraft(form);
      close();
      return;
    }

    const shareInputs =
      form.type === "income"
        ? [
            {
              memberId: form.payerMemberId,
              shareAmount: amount,
              shareRatio: 1,
              isSettlementImpact: false,
            },
          ]
        : form.splitPreset === "equal"
          ? splitEvenly(
              data.members.map((member) => member.id),
              amount,
            )
          : [
              {
                memberId: form.payerMemberId,
                shareAmount: amount,
                shareRatio: 1,
                isSettlementImpact: false,
              },
            ];

    const input: TransactionInput = {
      type: form.type,
      amount,
      categoryId: form.categoryId,
      payerMemberId: form.payerMemberId,
      occurredAt: fromDateTimeInput(form.occurredAt),
      note: form.note,
      isShared: form.type === "expense" ? form.splitPreset === "equal" : false,
      splitMethod:
        form.type === "expense" && form.splitPreset === "equal"
          ? "equal"
          : "custom_amount",
      shareInputs,
      createdByUserId:
        data.auth.viewer?.userId ??
        data.members.find((member) => member.id === form.payerMemberId)?.userId ??
        "",
    };

    if (editingTransactionId) {
      try {
        await updateMutation.mutateAsync({
          transactionId: editingTransactionId,
          input,
        });
      } catch (error) {
        setLocalMessage(getErrorMessage(error));
        return;
      }
    } else {
      try {
        await createMutation.mutateAsync(input);
      } catch (error) {
        setLocalMessage(getErrorMessage(error));
        return;
      }
    }

    if (restoreDraftId) {
      dropDraft(restoreDraftId);
    }

    close();
  };

  const submitPending = createMutation.isPending || updateMutation.isPending;
  const submitDisabled = submitPending || !form.amount || !form.categoryId;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/28 p-0 sm:items-center sm:justify-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[32px] border border-[var(--border)] bg-[var(--card)] px-4 pb-8 pt-5 shadow-[0_-20px_50px_rgba(18,24,22,0.18)] sm:max-h-[720px] sm:max-w-[520px] sm:rounded-[32px]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
              快速记账
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              {editingTransactionId ? "编辑记录" : "记一笔"}
            </h2>
          </div>
          <Button onClick={close} size="icon" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-5">
          <section>
            <label className="mb-2 block text-sm font-medium">类型</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "expense", label: "支出" },
                { value: "income", label: "收入" },
              ].map((item) => (
                <button
                  key={item.value}
                  className={cn(
                    "rounded-[22px] border px-4 py-3 text-left text-sm font-medium transition",
                    form.type === item.value
                      ? "border-transparent bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "bg-[var(--surface)] text-[var(--muted)]",
                  )}
                  onClick={() =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            type: item.value as TransactionFormState["type"],
                            categoryId:
                              data.categories.find((category) =>
                                item.value === "income"
                                  ? category.type === "income"
                                  : category.type === "expense",
                              )?.id ?? "",
                            splitPreset:
                              item.value === "income" ? "self" : current.splitPreset,
                          }
                        : current,
                    )
                  }
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="mb-2 block text-sm font-medium">金额</label>
            <input
              className="w-full rounded-[24px] border bg-[var(--surface)] px-4 py-4 text-3xl font-semibold outline-none"
              inputMode="decimal"
              onChange={(event) =>
                setForm((current) =>
                  current
                    ? {
                        ...current,
                        amount: clampCurrencyInput(event.target.value),
                      }
                    : current,
                )
              }
              placeholder="0.00"
              value={form.amount}
            />
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">分类</label>
              <select
                className="w-full rounded-[20px] border bg-[var(--surface)] px-4 py-3 outline-none"
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? {
                          ...current,
                          categoryId: event.target.value,
                        }
                      : current,
                  )
                }
                value={form.categoryId}
              >
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">付款人</label>
              <div className="grid grid-cols-2 gap-3">
                {data.members.map((member) => (
                  <button
                    key={member.id}
                    className={cn(
                      "rounded-[20px] border px-4 py-3 text-sm font-medium transition",
                      form.payerMemberId === member.id
                        ? "border-transparent bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "bg-[var(--surface)] text-[var(--muted)]",
                    )}
                    onClick={() =>
                      setForm((current) =>
                        current
                          ? {
                              ...current,
                              payerMemberId: member.id,
                            }
                          : current,
                      )
                    }
                    type="button"
                  >
                    {member.displayName}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {form.type === "expense" ? (
            <section>
              <label className="mb-2 block text-sm font-medium">分摊方式</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "equal", label: "共同平分" },
                  { value: "self", label: "自己承担" },
                ].map((item) => (
                  <button
                    key={item.value}
                    className={cn(
                      "rounded-[20px] border px-4 py-3 text-sm font-medium transition",
                      form.splitPreset === item.value
                        ? "border-transparent bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "bg-[var(--surface)] text-[var(--muted)]",
                    )}
                    onClick={() =>
                      setForm((current) =>
                        current
                          ? {
                              ...current,
                              splitPreset: item.value as TransactionFormState["splitPreset"],
                            }
                          : current,
                      )
                    }
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <label className="mb-2 block text-sm font-medium">时间</label>
            <input
              className="w-full rounded-[20px] border bg-[var(--surface)] px-4 py-3 outline-none"
              onChange={(event) =>
                setForm((current) =>
                  current
                    ? {
                        ...current,
                        occurredAt: event.target.value,
                      }
                    : current,
                )
              }
              type="datetime-local"
              value={form.occurredAt}
            />
          </section>

          <section>
            <label className="mb-2 block text-sm font-medium">备注</label>
            <textarea
              className="min-h-24 w-full rounded-[20px] border bg-[var(--surface)] px-4 py-3 outline-none"
              onChange={(event) =>
                setForm((current) =>
                  current
                    ? {
                        ...current,
                        note: event.target.value,
                      }
                    : current,
                )
              }
              placeholder="可留空，例如：超市、周末出游"
              value={form.note}
            />
          </section>
        </div>

        <div className="sticky bottom-0 mt-6 grid grid-cols-[1fr_auto] gap-3 rounded-t-[28px] bg-[var(--card)] pt-4">
          <div className="flex items-center text-sm text-[var(--muted)]">
            {localMessage ||
              (isOnline
                ? "当前在线，保存后会立即写入账本。"
                : editingTransactionId
                  ? "当前离线，已有记录需要联网后再修改。"
                  : "当前离线，保存后会进入离线草稿。")}
          </div>
          <Button
            className="min-w-[108px]"
            disabled={submitDisabled}
            onClick={() => void submit()}
          >
            {submitPending
              ? "正在保存..."
              : editingTransactionId
                ? "保存修改"
                : isOnline
                  ? "保存"
                  : "存为草稿"}
          </Button>
        </div>
      </div>
    </div>
  );
}
