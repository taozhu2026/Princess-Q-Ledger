import { createEmptyLedgerSnapshot } from "@/entities/ledger/empty-ledger";
import type { LedgerRepository } from "@/entities/ledger/repository-types";
import type {
  BookMember,
  Category,
  Invitation,
  LedgerBootstrapInput,
  LedgerSnapshot,
  LedgerViewer,
  PasswordResetRequestInput,
  PasswordSignInInput,
  PasswordSignUpInput,
  PasswordUpdateInput,
  ProfileUpdateInput,
  ThemePreference,
  Transaction,
  TransactionInput,
  TransactionShare,
} from "@/entities/ledger/types";
import { sendAuthEmailRequest } from "@/shared/lib/auth-email/client";
import { toAuthMessage } from "@/shared/lib/supabase/auth-message";
import { createSupabaseBrowserClient } from "@/shared/lib/supabase/browser";

function requireClient() {
  const client = createSupabaseBrowserClient();

  if (!client) {
    throw new Error("Supabase client is not configured");
  }

  return client;
}

function roundAmount(value: number) {
  return Number(value.toFixed(2));
}

function displayNameFromEmail(email: string) {
  return email.split("@")[0] || "成员";
}

function mapBookMember(
  row: Record<string, unknown>,
  profilesById: Map<string, Record<string, unknown>>,
): BookMember {
  const userId = String(row.user_id ?? "");
  const profile = profilesById.get(userId);

  return {
    id: String(row.id ?? ""),
    userId,
    displayName:
      String(profile?.display_name ?? "") ||
      String(row.display_name ?? "") ||
      displayNameFromEmail(String(profile?.email ?? "")),
    email: String(profile?.email ?? ""),
    accentColor: String(profile?.accent_color ?? "#355f45"),
    role: (row.role as "owner" | "member") ?? "member",
    joinedAt: String(row.joined_at ?? new Date().toISOString()),
  };
}

function mapBook(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    currency: String(row.currency ?? "CNY"),
    kind: (row.kind as "personal" | "shared") ?? "shared",
    ownerUserId: String(row.created_by ?? ""),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: String(row.id ?? ""),
    bookId: row.book_id ? String(row.book_id) : null,
    name: String(row.name ?? ""),
    type: (row.type as Category["type"]) ?? "expense",
    icon: String(row.icon ?? "NotebookTabs"),
    color: String(row.color ?? "#b4b0a7"),
    isSystem: Boolean(row.is_system),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function mapTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: String(row.id ?? ""),
    bookId: String(row.book_id ?? ""),
    type: (row.type as Transaction["type"]) ?? "expense",
    amount: Number(row.amount ?? 0),
    categoryId: String(row.category_id ?? ""),
    payerMemberId: String(row.payer_member_id ?? ""),
    occurredAt: String(row.occurred_at ?? new Date().toISOString()),
    note: String(row.note ?? ""),
    isShared: Boolean(row.is_shared),
    splitMethod: (row.split_method as Transaction["splitMethod"]) ?? "equal",
    createdByUserId: String(row.created_by ?? ""),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
    deletedAt: row.deleted_at ? String(row.deleted_at) : null,
  };
}

function mapShare(row: Record<string, unknown>): TransactionShare {
  return {
    id: String(row.id ?? ""),
    transactionId: String(row.transaction_id ?? ""),
    memberId: String(row.member_id ?? ""),
    shareAmount: Number(row.share_amount ?? 0),
    shareRatio: row.share_ratio === null ? null : Number(row.share_ratio ?? 0),
    isSettlementImpact: Boolean(row.is_settlement_impact),
  };
}

function mapInvitation(row: Record<string, unknown>): Invitation {
  return {
    id: String(row.id ?? ""),
    bookId: String(row.book_id ?? ""),
    token: String(row.token ?? ""),
    inviterMemberId: row.inviter_member_id ? String(row.inviter_member_id) : null,
    createdAt: String(row.created_at ?? new Date().toISOString()),
    expiresAt: String(row.expires_at ?? new Date().toISOString()),
    acceptedAt: row.accepted_at ? String(row.accepted_at) : null,
  };
}

async function getViewer() {
  const supabase = requireClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const { error: ensureProfileError } = await supabase.rpc("ensure_user_profile");
  if (ensureProfileError) {
    throw ensureProfileError;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, theme_preference, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  return {
    userId: user.id,
    email: user.email,
    displayName:
      String(profile?.display_name ?? "") || displayNameFromEmail(user.email),
    avatarUrl: profile?.avatar_url ? String(profile.avatar_url) : null,
    themePreference: (profile?.theme_preference as ThemePreference | undefined) ?? "system",
  };
}

async function ensurePersonalLedger() {
  const supabase = requireClient();
  const { data, error } = await supabase.rpc("ensure_personal_ledger");

  if (error) {
    throw error;
  }

  return data ? String(data) : null;
}

async function getExistingBookIdForUser(userId: string) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from("book_members")
    .select("book_id")
    .eq("user_id", userId)
    .order("joined_at", { ascending: true })
    .limit(1);

  if (error) {
    throw error;
  }

  return data?.[0]?.book_id ? String(data[0].book_id) : null;
}

async function getCurrentMembership(userId: string, bookId: string) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from("book_members")
    .select("id, book_id, user_id, role, display_name, joined_at")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .limit(1);

  if (error) {
    throw error;
  }

  return ((data ?? [])[0] ?? null) as Record<string, unknown> | null;
}

async function fetchSnapshotForUser(
  viewer: LedgerViewer,
  themePreference: ThemePreference,
  bookId: string | null,
) {
  const supabase = requireClient();
  if (!bookId) {
    return createEmptyLedgerSnapshot({
      auth: {
        mode: "supabase",
        status: "ready",
        viewer,
      },
      themePreference,
    });
  }

  const membership = await getCurrentMembership(viewer.userId, bookId);

  if (!membership) {
    return createEmptyLedgerSnapshot({
      auth: {
        mode: "supabase",
        status: "ready",
        viewer,
      },
      themePreference,
    });
  }

  const [
    { data: bookRow, error: bookError },
    { data: memberRows, error: membersError },
    { data: systemCategories, error: systemCategoriesError },
    { data: customCategories, error: customCategoriesError },
    { data: invitationRows, error: invitationsError },
    { data: transactionRows, error: transactionsError },
  ] = await Promise.all([
    supabase
      .from("ledger_books")
      .select("id, name, currency, kind, created_by, created_at")
      .eq("id", bookId)
      .single(),
    supabase
      .from("book_members")
      .select("id, book_id, user_id, role, display_name, joined_at")
      .eq("book_id", bookId)
      .order("joined_at", { ascending: true }),
    supabase
      .from("categories")
      .select("id, book_id, name, type, icon, color, is_system, created_at")
      .is("book_id", null)
      .eq("is_system", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("categories")
      .select("id, book_id, name, type, icon, color, is_system, created_at")
      .eq("book_id", bookId)
      .order("created_at", { ascending: true }),
    supabase
      .from("invitations")
      .select("id, book_id, token, inviter_member_id, created_at, expires_at, accepted_at")
      .eq("book_id", bookId)
      .order("created_at", { ascending: false }),
    supabase
      .from("transactions")
      .select(
        "id, book_id, type, amount, category_id, payer_member_id, occurred_at, note, is_shared, split_method, created_by, created_at, updated_at, deleted_at",
      )
      .eq("book_id", bookId)
      .is("deleted_at", null)
      .order("occurred_at", { ascending: false }),
  ]);

  if (
    bookError ||
    membersError ||
    systemCategoriesError ||
    customCategoriesError ||
    invitationsError ||
    transactionsError
  ) {
    throw (
      bookError ||
      membersError ||
      systemCategoriesError ||
      customCategoriesError ||
      invitationsError ||
      transactionsError
    );
  }

  const memberUserIds = ((memberRows ?? []) as Array<Record<string, unknown>>).map(
    (row) => String(row.user_id),
  );
  const { data: profileRows, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email, display_name, accent_color, theme_preference")
    .in("id", memberUserIds);

  if (profilesError) {
    throw profilesError;
  }

  const memberRecords = (memberRows ?? []) as Array<Record<string, unknown>>;
  const systemCategoryRecords = (systemCategories ?? []) as Array<Record<string, unknown>>;
  const customCategoryRecords = (customCategories ?? []) as Array<Record<string, unknown>>;
  const invitationRecords = (invitationRows ?? []) as Array<Record<string, unknown>>;
  const transactionRecords = (transactionRows ?? []) as Array<Record<string, unknown>>;

  const profileMap = new Map<string, Record<string, unknown>>(
    ((profileRows ?? []) as Array<Record<string, unknown>>).map((row) => [
      String(row.id),
      row,
    ]),
  );

  const transactionIds = transactionRecords.map((row) => String(row.id));
  const { data: shareRows, error: sharesError } =
    transactionIds.length === 0
      ? { data: [], error: null }
      : await supabase
          .from("transaction_shares")
          .select(
            "id, transaction_id, member_id, share_amount, share_ratio, is_settlement_impact",
          )
          .in("transaction_id", transactionIds);

  if (sharesError) {
    throw sharesError;
  }

  const shareRecords = (shareRows ?? []) as Array<Record<string, unknown>>;
  const members = memberRecords.map((row) => mapBookMember(row, profileMap));
  const viewerMembership =
    members.find((member) => member.userId === viewer.userId) ??
    members.find((member) => member.id === String(membership.id ?? "")) ??
    null;

  return {
    auth: {
      mode: "supabase" as const,
      status: "ready" as const,
      viewer,
    },
    book: mapBook(bookRow as Record<string, unknown>),
    viewerMembership,
    members,
    categories: [...systemCategoryRecords, ...customCategoryRecords].map((row) =>
      mapCategory(row),
    ),
    transactions: transactionRecords.map((row) => mapTransaction(row)),
    transactionShares: shareRecords.map((row) => mapShare(row)),
    invitations: invitationRecords.map((row) => mapInvitation(row)),
    preferences: {
      themePreference,
    },
  } satisfies LedgerSnapshot;
}

async function getAuthenticatedSnapshot(autoInitialize = true) {
  const viewer = await getViewer();

  if (!viewer) {
    return createEmptyLedgerSnapshot({
      auth: {
        mode: "supabase",
        status: "signed_out",
        viewer: null,
      },
    });
  }

  const bookId = autoInitialize
    ? await ensurePersonalLedger()
    : await getExistingBookIdForUser(viewer.userId);

  return fetchSnapshotForUser(
    {
      userId: viewer.userId,
      email: viewer.email,
      displayName: viewer.displayName,
      avatarUrl: viewer.avatarUrl ?? null,
    },
    viewer.themePreference,
    bookId,
  );
}

async function getCurrentBookContext() {
  const snapshot = await getAuthenticatedSnapshot();

  if (
    snapshot.auth.status !== "ready" ||
    !snapshot.auth.viewer ||
    !snapshot.book ||
    !snapshot.viewerMembership
  ) {
    throw new Error("No active book");
  }

  return {
    snapshot,
    viewer: snapshot.auth.viewer,
    bookId: snapshot.book.id,
    viewerMembership: snapshot.viewerMembership,
  };
}

async function upsertThemePreference(themePreference: ThemePreference) {
  const supabase = requireClient();
  const viewer = await getViewer();

  if (!viewer) {
    throw new Error("No signed in user");
  }

  const { error } = await supabase.from("profiles").upsert({
    id: viewer.userId,
    email: viewer.email,
    display_name: viewer.displayName,
    theme_preference: themePreference,
  });

  if (error) {
    throw error;
  }
}

async function createTransactionInternal(input: TransactionInput) {
  const supabase = requireClient();
  const { bookId, viewer } = await getCurrentBookContext();
  const { data: transactionRow, error: transactionError } = await supabase
    .from("transactions")
    .insert({
      book_id: bookId,
      type: input.type,
      amount: roundAmount(input.amount),
      category_id: input.categoryId,
      payer_member_id: input.payerMemberId,
      occurred_at: input.occurredAt,
      note: input.note.trim(),
      is_shared: input.isShared,
      split_method: input.splitMethod,
      created_by: viewer.userId,
    })
    .select("id")
    .single();

  if (transactionError) {
    throw transactionError;
  }

  const { error: shareError } = await supabase.from("transaction_shares").insert(
    input.shareInputs.map((share) => ({
      transaction_id: String(transactionRow.id),
      member_id: share.memberId,
      share_amount: roundAmount(share.shareAmount),
      share_ratio: share.shareRatio ?? null,
      is_settlement_impact: share.isSettlementImpact ?? false,
    })),
  );

  if (shareError) {
    throw shareError;
  }
}

async function createInvitationToken(): Promise<string> {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 12);

  return random.replace(/-/g, "").slice(0, 12);
}

export const supabaseLedgerRepository: LedgerRepository = {
  async getSnapshot(options) {
    return getAuthenticatedSnapshot(options?.autoInitialize ?? true);
  },

  async reset() {
    return getAuthenticatedSnapshot();
  },

  async setThemePreference(themePreference) {
    await upsertThemePreference(themePreference);
    return getAuthenticatedSnapshot();
  },

  async updateProfile(input: ProfileUpdateInput) {
    const supabase = requireClient();
    const displayName = input.displayName.trim();

    if (!displayName) {
      return getAuthenticatedSnapshot();
    }

    const { error } = await supabase.rpc("update_my_profile", {
      new_display_name: displayName,
    });

    if (error) {
      throw error;
    }

    return getAuthenticatedSnapshot();
  },

  async createCategory(input) {
    const supabase = requireClient();
    const { bookId } = await getCurrentBookContext();
    const name = input.name.trim();

    if (!name) {
      return getAuthenticatedSnapshot();
    }

    const { error } = await supabase.from("categories").insert({
      book_id: bookId,
      name,
      type: input.type,
      icon: input.type === "income" ? "Wallet" : "NotebookTabs",
      color: input.type === "income" ? "#80a771" : "#b98c68",
      is_system: false,
    });

    if (error) {
      throw error;
    }

    return getAuthenticatedSnapshot();
  },

  async deleteCategory(categoryId) {
    const supabase = requireClient();
    const { error } = await supabase.from("categories").delete().eq("id", categoryId);

    if (error) {
      throw error;
    }

    return getAuthenticatedSnapshot();
  },

  async createTransaction(input) {
    await createTransactionInternal(input);
    return getAuthenticatedSnapshot();
  },

  async updateTransaction(transactionId, input) {
    const supabase = requireClient();
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        type: input.type,
        amount: roundAmount(input.amount),
        category_id: input.categoryId,
        payer_member_id: input.payerMemberId,
        occurred_at: input.occurredAt,
        note: input.note.trim(),
        is_shared: input.isShared,
        split_method: input.splitMethod,
      })
      .eq("id", transactionId);

    if (updateError) {
      throw updateError;
    }

    const { error: deleteSharesError } = await supabase
      .from("transaction_shares")
      .delete()
      .eq("transaction_id", transactionId);

    if (deleteSharesError) {
      throw deleteSharesError;
    }

    const { error: createSharesError } = await supabase
      .from("transaction_shares")
      .insert(
        input.shareInputs.map((share) => ({
          transaction_id: transactionId,
          member_id: share.memberId,
          share_amount: roundAmount(share.shareAmount),
          share_ratio: share.shareRatio ?? null,
          is_settlement_impact: share.isSettlementImpact ?? false,
        })),
      );

    if (createSharesError) {
      throw createSharesError;
    }

    return getAuthenticatedSnapshot();
  },

  async deleteTransaction(transactionId) {
    const supabase = requireClient();
    const { error } = await supabase
      .from("transactions")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", transactionId);

    if (error) {
      throw error;
    }

    return getAuthenticatedSnapshot();
  },

  async createInvitation() {
    const supabase = requireClient();
    const { bookId, viewerMembership, viewer } = await getCurrentBookContext();
    const token = await createInvitationToken();

    const { error } = await supabase.from("invitations").insert({
      book_id: bookId,
      inviter_member_id: viewerMembership.id,
      inviter_user_id: viewer.userId,
      token,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    });

    if (error) {
      throw error;
    }

    return {
      ok: true,
      message: token,
    };
  },

  async acceptInvitation(token) {
    const supabase = requireClient();
    const viewer = await getViewer();

    if (!viewer) {
      return {
        ok: false,
        message: "请先登录后再加入账本。",
      };
    }

    const { error } = await supabase.rpc("accept_invitation", {
      invite_token: token,
      member_display_name: viewer.displayName,
    });

    if (error) {
      return {
        ok: false,
        message: error.message,
      };
    }

    return {
      ok: true,
      message: "已加入账本，现在可以开始一起记账了。",
    };
  },

  async confirmSettlement(monthKey, amount) {
    const snapshot = await getAuthenticatedSnapshot();
    const monthTransactions = snapshot.transactions.filter((transaction: Transaction) => {
      const occurredMonth = transaction.occurredAt.slice(0, 7);
      return (
        transaction.deletedAt === null &&
        occurredMonth === monthKey &&
        transaction.type !== "income"
      );
    });

    const balances = snapshot.members.map((member: BookMember) => {
      let paidTotal = 0;
      let shouldShareTotal = 0;

      for (const transaction of monthTransactions) {
        const shares = snapshot.transactionShares.filter(
          (share: TransactionShare) => share.transactionId === transaction.id,
        );

        if (transaction.payerMemberId === member.id) {
          paidTotal += transaction.amount;
        }

        shouldShareTotal += shares
          .filter(
            (share: TransactionShare) =>
              share.memberId === member.id &&
              (transaction.type === "expense" || share.isSettlementImpact),
          )
          .reduce(
            (total: number, share: TransactionShare) => total + share.shareAmount,
            0,
          );
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

    if (!receiver || !payer || !snapshot.book || !snapshot.auth.viewer) {
      return snapshot;
    }

    await createTransactionInternal({
      type: "settlement",
      amount,
      categoryId: "cat-settlement",
      payerMemberId: payer.memberId,
      occurredAt: new Date().toISOString(),
      note: `结算 ${amount.toFixed(2)} 元`,
      isShared: false,
      splitMethod: "custom_amount",
      shareInputs: [
        {
          memberId: receiver.memberId,
          shareAmount: amount,
          shareRatio: 1,
          isSettlementImpact: true,
        },
      ],
      createdByUserId: snapshot.auth.viewer.userId,
    });

    return getAuthenticatedSnapshot();
  },

  async signInWithPassword(input: PasswordSignInInput) {
    const supabase = requireClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: input.email.trim(),
      password: input.password,
    });

    if (error) {
      return {
        ok: false,
        message: toAuthMessage(error.message),
        nextStep: "signed_out",
      };
    }

    return {
      ok: true,
      message: "登录成功，正在回到账本。",
      nextStep: "signed_in",
    };
  },

  async signUpWithPassword(input: PasswordSignUpInput) {
    return sendAuthEmailRequest({
      action: "signup",
      email: input.email.trim(),
      password: input.password,
      displayName: input.displayName?.trim() || undefined,
      nextPath: input.nextPath ?? "/",
    });
  },

  async sendPasswordResetEmail(input: PasswordResetRequestInput) {
    return sendAuthEmailRequest({
      action: "recovery",
      email: input.email.trim(),
    });
  },

  async updatePassword(input: PasswordUpdateInput) {
    const supabase = requireClient();
    const { error } = await supabase.auth.updateUser({
      password: input.password,
    });

    if (error) {
      return {
        ok: false,
        message: toAuthMessage(error.message),
        nextStep: "signed_out",
      };
    }

    return {
      ok: true,
      message: "密码已经更新，下次可以直接用邮箱和密码登录。",
      nextStep: "password_updated",
    };
  },

  async sendMagicLink(email, nextPath = "/") {
    return sendAuthEmailRequest({
      action: "magiclink",
      email: email.trim(),
      nextPath,
    });
  },

  async signOut() {
    const supabase = requireClient();
    await supabase.auth.signOut();
  },

  async bootstrapLedger(input: LedgerBootstrapInput) {
    const supabase = requireClient();
    const { error } = await supabase.rpc("bootstrap_ledger", {
      book_name: input.bookName.trim(),
      member_display_name: input.displayName.trim(),
    });

    if (error) {
      return {
        ok: false,
        message: error.message,
      };
    }

    return {
      ok: true,
      message: "共享账本创建完成。",
    };
  },
};
