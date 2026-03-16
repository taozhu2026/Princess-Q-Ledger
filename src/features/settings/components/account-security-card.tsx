"use client";

import { KeyRound, Mail } from "lucide-react";
import { useState } from "react";

import {
  useSendPasswordResetEmailMutation,
  useUpdatePasswordMutation,
} from "@/features/transactions/api/use-ledger-data";
import { Button } from "@/shared/ui/button";
import { CardDescription } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import { getErrorMessage } from "@/shared/lib/errors";

import { PasswordField } from "@/features/auth/components/password-field";

const MIN_PASSWORD_LENGTH = 8;

export function AccountSecurityCard({
  email,
  supabaseReady,
  className,
}: {
  email: string;
  supabaseReady: boolean;
  className?: string;
}) {
  const updatePassword = useUpdatePasswordMutation();
  const sendResetEmail = useSendPasswordResetEmailMutation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localMessage, setLocalMessage] = useState("");

  if (!supabaseReady) {
    return (
      <div
        className={cn(
          "theme-surface-card rounded-[24px] border px-4 py-4 shadow-[var(--shadow-soft)]",
          className,
        )}
      >
        <p className="text-sm font-semibold">账号安全</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          当前是本地演示模式，没有真实账号，也不需要设置密码。
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "theme-surface-card rounded-[24px] border px-4 py-4 shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-[18px] bg-[var(--accent-soft)] p-3 text-[var(--accent-strong)]">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">邮箱 + 密码登录</p>
          <CardDescription className="mt-1">
            已登录状态下可以直接设置或修改密码；如果你更想走邮箱恢复，也可以再发一封重置邮件。
          </CardDescription>
          <p className="mt-2 text-sm text-[var(--muted)]">{email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <PasswordField
          label="新密码"
          onChange={setPassword}
          placeholder="至少 8 位"
          value={password}
        />
        <PasswordField
          label="确认新密码"
          onChange={setConfirmPassword}
          placeholder="再输入一次新密码"
          value={confirmPassword}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          disabled={updatePassword.isPending}
          onClick={async () => {
            if (password.length < MIN_PASSWORD_LENGTH) {
              setLocalMessage(`密码至少需要 ${MIN_PASSWORD_LENGTH} 位。`);
              return;
            }

            if (password !== confirmPassword) {
              setLocalMessage("两次输入的密码不一致。");
              return;
            }

            setLocalMessage("");
            try {
              const result = await updatePassword.mutateAsync({
                password,
              });

              if (result.ok) {
                setPassword("");
                setConfirmPassword("");
              }
            } catch (error) {
              setLocalMessage(getErrorMessage(error));
            }
          }}
          variant="secondary"
        >
          <KeyRound className="mr-2 h-4 w-4" />
          {updatePassword.isPending ? "正在保存..." : "保存密码"}
        </Button>
        <Button
          disabled={sendResetEmail.isPending}
          onClick={async () => {
            setLocalMessage("");
            try {
              await sendResetEmail.mutateAsync({
                email,
              });
            } catch (error) {
              setLocalMessage(getErrorMessage(error));
            }
          }}
          variant="ghost"
        >
          <Mail className="mr-2 h-4 w-4" />
          {sendResetEmail.isPending ? "正在发送..." : "发送重置邮件"}
        </Button>
      </div>

      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
        {localMessage ||
          updatePassword.data?.message ||
          (updatePassword.error
            ? getErrorMessage(updatePassword.error)
            : "") ||
          sendResetEmail.data?.message ||
          (sendResetEmail.error
            ? getErrorMessage(sendResetEmail.error)
            : "") ||
          "如果你以前只用过 Magic Link，这里就可以直接补设一个密码。"}
      </p>
    </div>
  );
}
