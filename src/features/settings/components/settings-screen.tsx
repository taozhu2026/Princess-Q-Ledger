"use client";

import { useState, type ReactNode } from "react";
import {
  Copy,
  DatabaseBackup,
  Link2,
  LogOut,
  MoonStar,
  PawPrint,
  RefreshCw,
  ShieldCheck,
  SunMedium,
  SwatchBook,
  UserRound,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";

import {
  canManageCategories,
  canManageInvitations,
  formatBookKind,
  formatMembershipRole,
  isOwnerMembership,
  type CategoryType,
  type Invitation,
} from "@/entities/ledger";
import { AccountSecurityCard } from "@/features/settings/components/account-security-card";
import { SettingsSection } from "@/features/settings/components/settings-section";
import {
  useCreateCategoryMutation,
  useCreateInvitationMutation,
  useDeleteCategoryMutation,
  useLedgerSnapshot,
  useResetLedgerMutation,
  useSetThemePreferenceMutation,
  useSignOutMutation,
  useUpdateProfileMutation,
} from "@/features/transactions/api/use-ledger-data";
import { useTransactionComposerStore } from "@/features/transactions/store/transaction-composer-store";
import { APP_BUILD_ID, APP_BUILD_TIME } from "@/shared/config/build";
import { getErrorMessage } from "@/shared/lib/errors";
import { copyText } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { CatIllustration } from "@/shared/ui/cat-illustration";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Input } from "@/shared/ui/input";
import { InstallPromptCard } from "@/shared/pwa/install-prompt-card";

const themeOptions = [
  { value: "light", label: "浅色", icon: SunMedium },
  { value: "dark", label: "深色", icon: MoonStar },
  { value: "system", label: "跟随系统", icon: RefreshCw },
] as const;

const themeLabelMap = {
  light: "浅色",
  dark: "深色",
  system: "跟随系统",
} as const;

type SectionKey =
  | "profile"
  | "security"
  | "theme"
  | "sharing"
  | "categories"
  | "data";

function SummaryPill({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="theme-elevated-surface inline-flex rounded-full px-3 py-2 text-xs font-medium text-[var(--foreground)]">
      {children}
    </span>
  );
}

function formatDateTimeLabel(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    month: "numeric",
    day: "numeric",
  });
}

function getInvitationStatus(invitation: Invitation, currentTime: number) {
  if (invitation.acceptedAt) {
    return {
      label: "已加入",
      tone: "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
    };
  }

  if (new Date(invitation.expiresAt).getTime() <= currentTime) {
    return {
      label: "已过期",
      tone: "bg-[var(--surface)] text-[var(--muted)]",
    };
  }

  return {
    label: "可使用",
    tone: "bg-[var(--highlight-soft)] text-[#ba835f]",
  };
}

function ProfileEditor({
  email,
  initialDisplayName,
  isSaving,
  isSigningOut,
  message,
  onSave,
  onSignOut,
}: {
  email: string;
  initialDisplayName: string;
  isSaving: boolean;
  isSigningOut: boolean;
  message: string;
  onSave: (displayName: string) => Promise<void>;
  onSignOut: () => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [localMessage, setLocalMessage] = useState("");

  return (
    <div className="space-y-4">
      <div className="theme-surface-card rounded-[24px] border px-4 py-4 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex items-center gap-4">
          <CatIllustration className="h-20 w-20 shrink-0" mood="happy" />
          <div>
            <p className="text-sm font-semibold">摘要里先看，修改时再展开就够了</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              这个昵称会同步显示在成员列表、首页和账单记录里。
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

        <div className="theme-elevated-surface mt-4 rounded-[18px] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">邮箱</p>
          <p className="mt-1 text-sm text-[var(--foreground)]">{email}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            disabled={isSaving}
            onClick={async () => {
              if (!displayName.trim()) {
                setLocalMessage("显示名称不能为空。");
                return;
              }

              setLocalMessage("");
              await onSave(displayName.trim());
            }}
            variant="secondary"
          >
            {isSaving ? "正在保存..." : "保存昵称"}
          </Button>
          <Button
            disabled={isSigningOut}
            onClick={() => void onSignOut()}
            variant="ghost"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isSigningOut ? "正在退出..." : "退出登录"}
          </Button>
        </div>

        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          {localMessage || message || "默认只展示摘要，需要时再进来修改即可。"}
        </p>
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
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<CategoryType>("expense");
  const [profileMessage, setProfileMessage] = useState("");
  const [themeMessage, setThemeMessage] = useState("");
  const [sharingMessage, setSharingMessage] = useState("");
  const [categoryMessage, setCategoryMessage] = useState("");
  const [dataMessage, setDataMessage] = useState("");
  const [mountedAt] = useState(() => Date.now());

  if (!data) {
    return null;
  }

  const supabaseReady = data.auth.mode === "supabase";
  const viewer = data.auth.viewer;
  const viewerName = data.viewerMembership?.displayName ?? viewer?.displayName ?? "";
  const isOwner = isOwnerMembership(data.viewerMembership);
  const canInvite = canManageInvitations(data.viewerMembership);
  const canEditCategories = canManageCategories(data.viewerMembership);
  const customCategories = data.categories.filter((category) => !category.isSystem);
  const bookOwner =
    data.members.find((member) => member.userId === data.book?.ownerUserId) ??
    data.members.find((member) => member.role === "owner") ??
    null;
  const activeInvitation =
    data.invitations.find(
      (invitation) =>
        !invitation.acceptedAt &&
        new Date(invitation.expiresAt).getTime() > mountedAt,
    ) ?? null;
  const inviteLink =
    activeInvitation && typeof window !== "undefined"
      ? `${window.location.origin}/invite/${activeInvitation.token}`
      : "";
  const currentThemeLabel = themeLabelMap[data.preferences.themePreference];
  const themeSummary = supabaseReady ? "邮箱账号" : "本地演示";
  const currentRoleLabel = data.viewerMembership
    ? formatMembershipRole(data.viewerMembership.role)
    : "未加入账本";

  return (
    <div className="space-y-4">
      <Card className="theme-card-hero overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[var(--accent-strong)]">
              <PawPrint className="h-3.5 w-3.5" />
              SETTINGS
            </div>
            <CardTitle className="mt-3 text-[24px] tracking-[-0.02em]">账号与主题</CardTitle>
            <CardDescription className="mt-2">
              默认只看当前状态，需要时再展开修改，避免设置页继续堆成一整面表单。
            </CardDescription>
          </div>
          <CatIllustration className="h-24 w-24 shrink-0" mood="happy" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[22px] bg-[var(--surface)] px-4 py-4">
            <p className="text-xs text-[var(--muted)]">昵称</p>
            <p className="mt-2 text-sm font-semibold">{viewerName || "未设置"}</p>
          </div>
          <div className="rounded-[22px] bg-[var(--highlight-soft)] px-4 py-4">
            <p className="text-xs text-[var(--muted)]">邮箱</p>
            <p className="mt-2 text-sm font-semibold">
              {viewer?.email ?? "未获取邮箱"}
            </p>
          </div>
          <div className="rounded-[22px] bg-[var(--pink-soft)] px-4 py-4">
            <p className="text-xs text-[var(--muted)]">登录方式</p>
            <p className="mt-2 text-sm font-semibold">{themeSummary}</p>
          </div>
          <div className="rounded-[22px] bg-[var(--accent-soft)] px-4 py-4">
            <p className="text-xs text-[var(--muted)]">当前主题</p>
            <p className="mt-2 text-sm font-semibold text-[var(--accent-strong)]">
              {currentThemeLabel}
            </p>
          </div>
        </div>
      </Card>

      <SettingsSection
        description="先看摘要，确实要改时再进入编辑态。"
        icon={<UserRound className="h-5 w-5" />}
        isOpen={expandedSection === "profile"}
        onToggle={() =>
          setExpandedSection((current) =>
            current === "profile" ? null : "profile",
          )
        }
        summary={
          <div className="flex flex-wrap gap-2">
            <SummaryPill>{viewerName || "未设置昵称"}</SummaryPill>
            <SummaryPill>{viewer?.email ?? "未获取邮箱"}</SummaryPill>
          </div>
        }
        title="账户摘要"
      >
        <ProfileEditor
          email={viewer?.email ?? "未获取邮箱"}
          initialDisplayName={viewerName}
          isSaving={updateProfile.isPending}
          isSigningOut={signOut.isPending}
          message={profileMessage}
          onSave={async (displayName) => {
            try {
              await updateProfile.mutateAsync({ displayName });
              setProfileMessage("昵称已更新。");
            } catch (error) {
              setProfileMessage(getErrorMessage(error));
            }
          }}
          onSignOut={async () => {
            try {
              await signOut.mutateAsync();
            } catch (error) {
              setProfileMessage(getErrorMessage(error));
            }
          }}
        />
      </SettingsSection>

      <SettingsSection
        description="密码相关操作收在这里，需要时再展开。"
        icon={<ShieldCheck className="h-5 w-5" />}
        isOpen={expandedSection === "security"}
        onToggle={() =>
          setExpandedSection((current) =>
            current === "security" ? null : "security",
          )
        }
        summary={
          <div className="flex flex-wrap gap-2">
            <SummaryPill>{supabaseReady ? "邮箱与密码" : "本地演示"}</SummaryPill>
            <SummaryPill>{supabaseReady ? "支持重置邮件" : "无需密码"}</SummaryPill>
          </div>
        }
        title="账号安全"
      >
        <AccountSecurityCard
          className="shadow-none"
          email={viewer?.email ?? "未获取邮箱"}
          supabaseReady={supabaseReady}
        />
      </SettingsSection>

      <SettingsSection
        description="主题由这一处统一切换，不再散落在别的界面里。"
        icon={<MoonStar className="h-5 w-5" />}
        isOpen={expandedSection === "theme"}
        onToggle={() =>
          setExpandedSection((current) =>
            current === "theme" ? null : "theme",
          )
        }
        summary={
          <div className="flex flex-wrap gap-2">
            <SummaryPill>{currentThemeLabel}</SummaryPill>
            <SummaryPill>{supabaseReady ? "已同步到账号" : "保存在本地"}</SummaryPill>
          </div>
        }
        title="主题与显示"
      >
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.value}
                className={`rounded-[22px] border px-3 py-3 text-sm font-medium shadow-[var(--shadow-soft)] ${
                  data.preferences.themePreference === item.value
                    ? "border-transparent theme-active-pill text-[var(--accent-strong)]"
                    : "border-[color:var(--panel-border-soft)] bg-[var(--surface)] text-[var(--muted)]"
                }`}
                onClick={async () => {
                  setTheme(item.value);

                  try {
                    await setThemePreference.mutateAsync(item.value);
                    setThemeMessage(`已切换到${item.label}。`);
                  } catch (error) {
                    setTheme(data.preferences.themePreference);
                    setThemeMessage(getErrorMessage(error));
                  }
                }}
                type="button"
              >
                <Icon className="mx-auto mb-2 h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          {themeMessage || "跟随系统会在设备切换浅色/深色时自动同步。"}
        </p>
      </SettingsSection>

      <SettingsSection
        description="这里聚合当前账本、成员、角色和邀请，不再把共享流程拆散在多处。"
        icon={<Users className="h-5 w-5" />}
        isOpen={expandedSection === "sharing"}
        onToggle={() =>
          setExpandedSection((current) =>
            current === "sharing" ? null : "sharing",
          )
        }
        summary={
          <div className="flex flex-wrap gap-2">
            <SummaryPill>{data.book ? formatBookKind(data.book.kind) : "未创建账本"}</SummaryPill>
            <SummaryPill>{currentRoleLabel}</SummaryPill>
            <SummaryPill>{data.members.length} 位成员</SummaryPill>
          </div>
        }
        title="账本与共享"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="theme-surface-card rounded-[24px] border px-4 py-4 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold">当前账本</p>
            <p className="mt-2 text-base font-semibold">
              {data.book?.name ?? "还没有可用账本"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {data.book
                ? `${formatBookKind(data.book.kind)} · ${
                    bookOwner ? `由 ${bookOwner.displayName} 创建` : "已接入真实身份"
                  }`
                : "登录后会自动准备个人账本。"}
            </p>
          </div>

          <div className="theme-surface-card rounded-[24px] border px-4 py-4 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold">当前权限</p>
            <p className="mt-2 text-base font-semibold">{currentRoleLabel}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {isOwner
                ? "可以邀请成员、管理分类，并处理全部账单记录。"
                : "可以正常记账和查看统计，但只编辑或删除自己创建的记录。"}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold">成员列表</p>
          <div className="mt-3 space-y-3">
            {data.members.map((member) => (
              <div
                key={member.id}
                className="theme-surface-card-strong flex items-center justify-between rounded-[22px] border px-4 py-3"
              >
                <div>
                  <p className="font-medium">
                    {member.displayName}
                    {member.id === data.viewerMembership?.id ? " · 你" : ""}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {member.email || "当前成员邮箱未公开"} · 加入于{" "}
                    {formatDateTimeLabel(member.joinedAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    member.role === "owner"
                      ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                      : "bg-[var(--surface)] text-[var(--muted)]"
                  }`}
                >
                  {formatMembershipRole(member.role)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">邀请链接</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {canInvite
                  ? data.book?.kind === "personal"
                    ? "生成邀请后，对方加入时会自动把当前账本变成共享账本。"
                    : "当前创建者可以继续生成 7 天有效的加入链接。"
                  : "邀请新成员由账本创建者统一处理，成员端不再显示无效操作。"}
              </p>
            </div>
            <div className="rounded-[20px] bg-[var(--accent-soft)] p-3 text-[var(--accent-strong)]">
              <Link2 className="h-5 w-5" />
            </div>
          </div>

          {canInvite ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                disabled={createInvitation.isPending}
                onClick={async () => {
                  try {
                    await createInvitation.mutateAsync();
                    setSharingMessage("新的邀请链接已生成，有效期 7 天。");
                  } catch (error) {
                    setSharingMessage(getErrorMessage(error));
                  }
                }}
              >
                {createInvitation.isPending ? "正在生成..." : "生成邀请链接"}
              </Button>
              {inviteLink ? (
                <Button
                  onClick={async () => {
                    try {
                      await copyText(inviteLink);
                      setSharingMessage("邀请链接已复制。");
                    } catch (error) {
                      setSharingMessage(getErrorMessage(error, "复制失败，请手动复制。"));
                    }
                  }}
                  variant="secondary"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  复制当前链接
                </Button>
              ) : null}
            </div>
          ) : null}

          {inviteLink ? (
            <div className="theme-elevated-surface mt-4 rounded-[22px] px-4 py-4 text-sm text-[var(--foreground)]">
              <p className="font-medium">当前可用邀请</p>
              <p className="mt-2 break-all text-[var(--muted)]">{inviteLink}</p>
            </div>
          ) : canInvite ? (
            <div className="mt-4">
              <EmptyState
                description="还没有生成中的邀请。需要共享时再点上面的按钮即可。"
                title="当前没有可用邀请"
              />
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            {data.invitations.slice(0, 3).map((invitation) => {
              const status = getInvitationStatus(invitation, mountedAt);

              return (
                <div
                  key={invitation.id}
                  className="theme-surface-card-strong flex items-center justify-between rounded-[22px] border px-4 py-3"
                >
                  <div>
                    <p className="font-medium">邀请创建于 {formatDateTimeLabel(invitation.createdAt)}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {invitation.acceptedAt
                        ? `已在 ${formatDateTimeLabel(invitation.acceptedAt)} 使用`
                        : `有效至 ${formatDateTimeLabel(invitation.expiresAt)}`}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.tone}`}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
            {sharingMessage ||
              (canInvite
                ? "邀请状态会随着对方加入自动刷新。"
                : "你仍然可以正常记账、看统计和处理自己的记录。")}
          </p>
        </div>
      </SettingsSection>

      <SettingsSection
        description="分类管理改成按需展开，避免默认把创建表单和列表全铺开。"
        icon={<SwatchBook className="h-5 w-5" />}
        isOpen={expandedSection === "categories"}
        onToggle={() =>
          setExpandedSection((current) =>
            current === "categories" ? null : "categories",
          )
        }
        summary={
          <div className="flex flex-wrap gap-2">
            <SummaryPill>{customCategories.length} 个自定义分类</SummaryPill>
            <SummaryPill>{canEditCategories ? "可管理" : "只读"}</SummaryPill>
          </div>
        }
        title="分类管理"
      >
        {canEditCategories ? (
          <div className="grid gap-3 sm:grid-cols-[1.3fr_0.9fr_auto]">
            <Input
              className="shadow-none"
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="新增分类名称，例如：旅行"
              value={newCategoryName}
            />
            <select
              className="theme-select-surface rounded-[18px] border px-4 py-3 outline-none"
              onChange={(event) => setNewCategoryType(event.target.value as CategoryType)}
              value={newCategoryType}
            >
              <option value="expense">支出分类</option>
              <option value="income">收入分类</option>
            </select>
            <Button
              className="w-full sm:w-auto"
              disabled={createCategory.isPending}
              onClick={async () => {
                if (!newCategoryName.trim()) {
                  setCategoryMessage("请输入分类名称。");
                  return;
                }

                try {
                  await createCategory.mutateAsync({
                    name: newCategoryName,
                    type: newCategoryType,
                  });
                  setNewCategoryName("");
                  setCategoryMessage("分类已保存。");
                } catch (error) {
                  setCategoryMessage(getErrorMessage(error));
                }
              }}
            >
              {createCategory.isPending ? "正在保存..." : "保存"}
            </Button>
          </div>
        ) : (
          <div className="theme-surface-card rounded-[24px] border px-4 py-4 text-sm leading-6 text-[var(--muted)] shadow-[var(--shadow-soft)]">
            当前成员只能查看分类，新增和删除统一交给账本创建者处理，避免共享分类被随手改动。
          </div>
        )}

        <div className="mt-5 grid gap-3">
          {customCategories.map((category) => (
            <div
              key={category.id}
              className="theme-surface-card-strong flex items-center justify-between rounded-[22px] border px-4 py-3"
            >
              <div>
                <p className="font-medium">{category.name}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {category.type === "income" ? "收入" : "支出"} · 自定义
                </p>
              </div>
              {canEditCategories ? (
                <Button
                  disabled={deleteCategory.isPending}
                  onClick={async () => {
                    try {
                      await deleteCategory.mutateAsync(category.id);
                      setCategoryMessage("分类已删除。");
                    } catch (error) {
                      setCategoryMessage(getErrorMessage(error));
                    }
                  }}
                  variant="ghost"
                >
                  删除
                </Button>
              ) : null}
            </div>
          ))}

          {customCategories.length === 0 ? (
            <EmptyState
              description="系统分类已经够先开始用了，需要更细时再补自己的分类。"
              title="还没有自定义分类"
            />
          ) : null}
        </div>

        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          {categoryMessage ||
            (canEditCategories
              ? "分类会立刻同步到账本内的选择项。"
              : "成员端保持只读，避免共享账本的分类体系失控。")}
        </p>
      </SettingsSection>

      <SettingsSection
        description="把离线草稿、数据模式和当前构建版本放到一处查看。"
        icon={<DatabaseBackup className="h-5 w-5" />}
        isOpen={expandedSection === "data"}
        onToggle={() =>
          setExpandedSection((current) =>
            current === "data" ? null : "data",
          )
        }
        summary={
          <div className="flex flex-wrap gap-2">
            <SummaryPill>{pendingDrafts.length} 条离线草稿</SummaryPill>
            <SummaryPill>{supabaseReady ? "真实数据" : "本地演示"}</SummaryPill>
            <SummaryPill>Build {APP_BUILD_ID.slice(0, 8)}</SummaryPill>
          </div>
        }
        title="离线与数据"
      >
        <div className="flex flex-wrap gap-3">
          <Button
            disabled={pendingDrafts.length === 0}
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
            <Button
              disabled={resetLedger.isPending}
              onClick={async () => {
                try {
                  await resetLedger.mutateAsync();
                  setDataMessage("演示数据已经重置。");
                } catch (error) {
                  setDataMessage(getErrorMessage(error));
                }
              }}
              variant="ghost"
            >
              {resetLedger.isPending ? "正在重置..." : "重置演示数据"}
            </Button>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="theme-surface-card rounded-[24px] border px-4 py-4 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold">当前数据模式</p>
            <p className="mt-2 text-base font-semibold">
              {supabaseReady ? "Supabase 真实数据" : "本地演示数据"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {supabaseReady
                ? "恢复联网和重新聚焦时会自动重新校验数据。"
                : "当前模式只用于本地开发和界面演示，不参与真实共享。"}
            </p>
          </div>

          <div className="theme-surface-card rounded-[24px] border px-4 py-4 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold">当前版本</p>
            <p className="mt-2 text-base font-semibold">Build {APP_BUILD_ID}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {APP_BUILD_TIME
                ? `构建时间：${formatDateTimeLabel(APP_BUILD_TIME)}`
                : "当前是本地开发构建。"}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          {dataMessage ||
            "离线草稿只用于新增记录；已有记录的修改仍然建议在联网状态下完成。"}
        </p>
      </SettingsSection>

      <InstallPromptCard />
    </div>
  );
}
