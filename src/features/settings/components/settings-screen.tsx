"use client";

import { useState } from "react";
import {
  Copy,
  DatabaseBackup,
  Link2,
  LogOut,
  MoonStar,
  PawPrint,
  RefreshCw,
  SunMedium,
} from "lucide-react";
import { useTheme } from "next-themes";

import { AccountSecurityCard } from "@/features/settings/components/account-security-card";
import type { CategoryType } from "@/entities/ledger";
import {
  useCreateCategoryMutation,
  useCreateInvitationMutation,
  useDeleteCategoryMutation,
  useLedgerSnapshot,
  useResetLedgerMutation,
  useSignOutMutation,
  useSetThemePreferenceMutation,
  useUpdateProfileMutation,
} from "@/features/transactions/api/use-ledger-data";
import { useTransactionComposerStore } from "@/features/transactions/store/transaction-composer-store";
import { Input } from "@/shared/ui/input";
import { InstallPromptCard } from "@/shared/pwa/install-prompt-card";
import { copyText } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { CatIllustration } from "@/shared/ui/cat-illustration";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";

function ProfileEditor({
  email,
  initialDisplayName,
  onSave,
  onSignOut,
}: {
  email: string;
  initialDisplayName: string;
  onSave: (displayName: string) => void;
  onSignOut: () => void;
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName);

  return (
    <div className="rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,var(--surface),rgba(255,255,255,0.92))] px-4 py-4 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex items-center gap-4">
        <CatIllustration className="h-20 w-20 shrink-0" mood="happy" />
        <div>
          <p className="text-sm font-semibold">你的名字会显示在首页和账单里</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            不用很正式，填一个你自己喜欢看到的称呼就可以。
          </p>
        </div>
      </div>
      <label className="block text-sm font-medium">显示名称</label>
      <Input
        className="mt-2 bg-[var(--card)] shadow-none"
        onChange={(event) => setDisplayName(event.target.value)}
        placeholder="输入你想显示的昵称"
        value={displayName}
      />
      <p className="mt-3 text-sm text-[var(--muted)]">
        这个名字会显示在首页、记录列表、邀请加入后的成员展示里。
      </p>
      <div className="mt-4 rounded-[18px] bg-[var(--card)] px-4 py-3">
        <p className="mt-1 text-sm text-[var(--muted)]">{email}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={() => onSave(displayName)} variant="secondary">
          保存昵称
        </Button>
        <Button onClick={onSignOut} variant="ghost">
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </Button>
      </div>
    </div>
  );
}

export function SettingsScreen() {
  const { data } = useLedgerSnapshot();
  const { setTheme } = useTheme();
  const setThemePreference = useSetThemePreferenceMutation();
  const updateProfile = useUpdateProfileMutation();
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
  const viewerName =
    data?.viewerMembership?.displayName ?? data?.auth.viewer?.displayName ?? "";

  const inviteLink =
    data?.invitations[0] && typeof window !== "undefined"
      ? `${window.location.origin}/invite/${data.invitations[0].token}`
      : "";
  const supabaseReady = data?.auth.mode === "supabase";

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden bg-[linear-gradient(145deg,#fffaf2,#ffffff)]">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[var(--accent-strong)]">
          <PawPrint className="h-3.5 w-3.5" />
          SETTINGS
        </div>
        <CardTitle className="mt-3 text-[24px] tracking-[-0.02em]">账号与主题</CardTitle>
        <CardDescription className="mt-2">
          {supabaseReady
            ? "昵称和邮箱都绑定到当前登录账号，账本与交易会围绕这个真实身份展开。"
            : "当前是本地演示模式，昵称修改只会保存在浏览器本地。"}
        </CardDescription>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">个人资料</p>
            <ProfileEditor
              email={data.auth.viewer?.email ?? "未获取邮箱"}
              initialDisplayName={viewerName}
              key={viewerName || "viewer"}
              onSave={(displayName) => updateProfile.mutate({ displayName })}
              onSignOut={() => signOut.mutate()}
            />
          </div>

          <div>
            <div>
              <p className="mb-2 text-sm font-medium">账号安全</p>
              <AccountSecurityCard
                email={data.auth.viewer?.email ?? "未获取邮箱"}
                supabaseReady={supabaseReady}
              />
            </div>
            <div className="mt-4">
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
                      className={`rounded-[22px] border border-white/70 px-3 py-3 text-sm font-medium shadow-[var(--shadow-soft)] ${
                        data.preferences.themePreference === item.value
                          ? "border-transparent bg-[linear-gradient(180deg,var(--accent-soft),rgba(255,255,255,0.82))] text-[var(--accent-strong)]"
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
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>邀请另一位成员</CardTitle>
            <CardDescription className="mt-2">
              {supabaseReady
                ? "当前账本已经和你的真实账号绑定。后续邀请另一位成员时，对方会以自己的账号加入。"
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
          <Input
            className="shadow-none"
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
                className="flex items-center justify-between rounded-[22px] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface),rgba(255,255,255,0.94))] px-4 py-3"
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
            <EmptyState
              description="系统分类已经够你先开始用了。等账本更稳定以后，再慢慢补自己的分类。"
              title="还没有自定义分类"
            />
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
