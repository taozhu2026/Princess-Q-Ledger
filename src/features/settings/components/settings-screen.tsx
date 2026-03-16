"use client";

import { useState } from "react";
import {
  Copy,
  DatabaseBackup,
  Link2,
  LogOut,
  MoonStar,
  RefreshCw,
  SunMedium,
} from "lucide-react";
import { useTheme } from "next-themes";

import type { CategoryType } from "@/entities/ledger";
import {
  useCreateCategoryMutation,
  useCreateInvitationMutation,
  useDeleteCategoryMutation,
  useLedgerSnapshot,
  useResetLedgerMutation,
  useSignOutMutation,
  useSetActiveMemberMutation,
  useSetThemePreferenceMutation,
} from "@/features/transactions/api/use-ledger-data";
import { useTransactionComposerStore } from "@/features/transactions/store/transaction-composer-store";
import { InstallPromptCard } from "@/shared/pwa/install-prompt-card";
import { copyText } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";

export function SettingsScreen() {
  const { data } = useLedgerSnapshot();
  const { setTheme } = useTheme();
  const setActiveMember = useSetActiveMemberMutation();
  const setThemePreference = useSetThemePreferenceMutation();
  const createCategory = useCreateCategoryMutation();
  const deleteCategory = useDeleteCategoryMutation();
  const createInvitation = useCreateInvitationMutation();
  const resetLedger = useResetLedgerMutation();
  const signOut = useSignOutMutation();
  const openDraft = useTransactionComposerStore((state) => state.openCreate);
  const pendingDrafts = useTransactionComposerStore((state) => state.pendingDrafts);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<CategoryType>("expense");
  const [copied, setCopied] = useState(false);

  if (!data) {
    return null;
  }

  const latestInvitation = data.invitations[0] ?? null;
  const activeMember = data.members.find(
    (member) => member.id === data.preferences.activeMemberId,
  );

  const inviteLink =
    latestInvitation && typeof window !== "undefined"
      ? `${window.location.origin}/invite/${latestInvitation.token}`
      : "";
  const supabaseReady = data.auth.mode === "supabase";

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>成员与主题</CardTitle>
        <CardDescription className="mt-2">
          {supabaseReady
            ? "真实数据模式下，当前成员由登录账号决定；另一位成员会通过邀请链接加入。"
            : "本地演示模式下，你可以临时切换成员视角。"}
        </CardDescription>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">
              {supabaseReady ? "当前账号" : "当前成员"}
            </p>
            {supabaseReady ? (
              <div className="rounded-[22px] border bg-[var(--surface)] px-4 py-4">
                <p className="font-semibold">
                  {activeMember?.displayName ?? data.auth.viewer?.displayName ?? "未命名成员"}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {data.auth.viewer?.email ?? "未获取邮箱"}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button onClick={() => signOut.mutate()} variant="ghost">
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {data.members.map((member) => (
                  <button
                    key={member.id}
                    className={`rounded-[20px] border px-4 py-3 text-sm font-medium ${
                      data.preferences.activeMemberId === member.id
                        ? "border-transparent bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "bg-[var(--surface)] text-[var(--muted)]"
                    }`}
                    onClick={() => setActiveMember.mutate(member.id)}
                    type="button"
                  >
                    {member.displayName}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">主题</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "light", label: "浅色", icon: SunMedium },
                { value: "dark", label: "深色", icon: MoonStar },
                { value: "system", label: "跟随系统", icon: RefreshCw },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.value}
                    className={`rounded-[20px] border px-3 py-3 text-sm font-medium ${
                      data.preferences.themePreference === item.value
                        ? "border-transparent bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "bg-[var(--surface)] text-[var(--muted)]"
                    }`}
                    onClick={() => {
                      setTheme(item.value);
                      setThemePreference.mutate(item.value as "light" | "dark" | "system");
                    }}
                    type="button"
                  >
                    <Icon className="mx-auto mb-2 h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>邀请另一位成员</CardTitle>
            <CardDescription className="mt-2">
              {supabaseReady
                ? "生成真实邀请链接。对方登录后打开链接，会被加入同一个账本。"
                : "当前还是本地演示邀请链接，便于先走通界面流程。"}
            </CardDescription>
          </div>
          <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
            <Link2 className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={() => createInvitation.mutate()}>生成邀请链接</Button>
          {inviteLink ? (
            <Button
              onClick={async () => {
                await copyText(inviteLink);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              }}
              variant="secondary"
            >
              <Copy className="mr-2 h-4 w-4" />
              {copied ? "已复制" : "复制链接"}
            </Button>
          ) : null}
        </div>

        {inviteLink ? (
          <div className="mt-4 rounded-[22px] bg-[var(--surface)] px-4 py-4 text-sm text-[var(--muted)]">
            {inviteLink}
          </div>
        ) : null}
      </Card>

      <Card>
        <CardTitle>分类管理</CardTitle>
        <CardDescription className="mt-2">
          系统分类够用时可以不动；需要更细的账本风格，再慢慢补自定义分类。
        </CardDescription>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1.3fr_0.9fr_auto]">
          <input
            className="rounded-[18px] border bg-[var(--surface)] px-4 py-3 outline-none"
            onChange={(event) => setNewCategoryName(event.target.value)}
            placeholder="新增分类名称，例如：旅行"
            value={newCategoryName}
          />
          <select
            className="rounded-[18px] border bg-[var(--surface)] px-4 py-3 outline-none"
            onChange={(event) => setNewCategoryType(event.target.value as CategoryType)}
            value={newCategoryType}
          >
            <option value="expense">支出分类</option>
            <option value="income">收入分类</option>
          </select>
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              if (!newCategoryName.trim()) {
                return;
              }

              createCategory.mutate({
                name: newCategoryName,
                type: newCategoryType,
              });
              setNewCategoryName("");
            }}
          >
            保存
          </Button>
        </div>

        <div className="mt-5 grid gap-3">
          {data.categories
            .filter((category) => !category.isSystem)
            .map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
              >
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {category.type === "income" ? "收入" : "支出"} · 自定义
                  </p>
                </div>
                <Button
                  onClick={() => deleteCategory.mutate(category.id)}
                  variant="ghost"
                >
                  删除
                </Button>
              </div>
            ))}

          {data.categories.every((category) => category.isSystem) ? (
            <p className="rounded-[22px] bg-[var(--surface)] px-4 py-4 text-sm text-[var(--muted)]">
              还没有自定义分类。
            </p>
          ) : null}
        </div>
      </Card>

      <InstallPromptCard />

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>离线与数据</CardTitle>
            <CardDescription className="mt-2">
              弱网下会先把记录存成离线草稿，恢复联网后继续提交。
            </CardDescription>
          </div>
          <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
            <DatabaseBackup className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            onClick={() => {
              if (pendingDrafts[0]) {
                openDraft(pendingDrafts[0].id);
              }
            }}
            variant="secondary"
          >
            打开离线草稿（{pendingDrafts.length}）
          </Button>
          {!supabaseReady ? (
            <Button onClick={() => resetLedger.mutate()} variant="ghost">
              重置演示数据
            </Button>
          ) : null}
        </div>

        <div className="mt-4 rounded-[22px] bg-[var(--surface)] px-4 py-4 text-sm text-[var(--muted)]">
          数据模式：{supabaseReady ? "Supabase 真实数据" : "本地演示数据"}
        </div>
      </Card>
    </div>
  );
}
