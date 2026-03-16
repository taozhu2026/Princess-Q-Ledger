import type { AuthActionResult } from "@/entities/ledger/types";
import {
  AUTH_EMAIL_MISSING_CONFIG_MESSAGE,
  getAuthEmailConfig,
} from "@/shared/lib/auth-email/config";
import { sendTransactionalEmail } from "@/shared/lib/auth-email/resend";
import { createSupabaseAdminClient } from "@/shared/lib/auth-email/supabase-admin";
import { createAuthEmailTemplate } from "@/shared/lib/auth-email/template";
import type { AuthEmailRequest } from "@/shared/lib/auth-email/types";
import { toAuthMessage } from "@/shared/lib/supabase/auth-message";
import { buildAbsoluteAuthCallbackUrl } from "@/shared/lib/supabase/paths";

function getSuccessResult(action: AuthEmailRequest["action"]): AuthActionResult {
  switch (action) {
    case "signup":
      return {
        ok: true,
        message: "确认邮件已经发出，请去邮箱完成注册。",
        nextStep: "check_email",
      };
    case "magiclink":
      return {
        ok: true,
        message: "登录链接已经发到邮箱，请在同一台设备上打开。",
        nextStep: "check_email",
      };
    case "recovery":
      return {
        ok: true,
        message: "重置密码邮件已经发出，请回邮箱继续完成设置。",
        nextStep: "check_email",
      };
  }
}

function getMaskedRecoveryResult(): AuthActionResult {
  return {
    ok: true,
    message: "如果这个邮箱已经注册，重置密码邮件会很快送达。",
    nextStep: "check_email",
  };
}

function shouldMaskRecoveryError(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("user not found") ||
    normalized.includes("email not found") ||
    normalized.includes("invalid email")
  );
}

export async function sendAuthEmail(
  request: AuthEmailRequest,
  origin: string,
): Promise<AuthActionResult> {
  const configResult = getAuthEmailConfig();

  if (!configResult.ok) {
    console.error(
      "[auth-email] Missing required server config:",
      configResult.missing.join(", "),
    );

    return {
      ok: false,
      message: AUTH_EMAIL_MISSING_CONFIG_MESSAGE,
      nextStep: "signed_out",
    };
  }

  const config = configResult.value;
  const redirectTo = buildAbsoluteAuthCallbackUrl(origin, request.nextPath);
  const supabase = createSupabaseAdminClient(config);

  const { data, error } = await supabase.auth.admin.generateLink(
    request.action === "signup"
      ? {
          type: "signup",
          email: request.email,
          password: request.password!,
          options: {
            data: request.displayName
              ? {
                  display_name: request.displayName,
                }
              : undefined,
            redirectTo,
          },
        }
      : request.action === "magiclink"
        ? {
            type: "magiclink",
            email: request.email,
            options: {
              redirectTo,
            },
          }
        : {
            type: "recovery",
            email: request.email,
            options: {
              redirectTo,
            },
          },
  );

  if (error || !data.properties?.action_link) {
    const message = toAuthMessage(error?.message ?? "认证邮件没有生成成功。");

    if (request.action === "recovery" && shouldMaskRecoveryError(error?.message ?? "")) {
      return getMaskedRecoveryResult();
    }

    return {
      ok: false,
      message,
      nextStep: "signed_out",
    };
  }

  const template = createAuthEmailTemplate({
    action: request.action,
    actionLink: data.properties.action_link,
    productName: config.productName,
  });

  const emailResult = await sendTransactionalEmail(config, {
    to: request.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });

  if (!emailResult.ok) {
    console.error("[auth-email] Resend rejected email:", emailResult.message);

    return {
      ok: false,
      message: "邮件服务暂时不可用，请稍后再试。",
      nextStep: "signed_out",
    };
  }

  return getSuccessResult(request.action);
}
