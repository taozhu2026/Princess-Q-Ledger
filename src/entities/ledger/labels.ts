import type { BookKind, BookMember, LedgerMode } from "@/entities/ledger/types";

export function formatBookKind(kind: BookKind) {
  return kind === "shared" ? "共享账本" : "个人账本";
}

export function formatMembershipRole(role: BookMember["role"]) {
  return role === "owner" ? "创建者" : "成员";
}

export function formatLedgerMode(mode: LedgerMode) {
  return mode === "supabase" ? "真实数据" : "本地演示";
}
