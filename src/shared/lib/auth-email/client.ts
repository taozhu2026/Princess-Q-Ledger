import type { AuthActionResult, AuthNextStep } from "@/entities/ledger/types";
import type { AuthEmailRequest } from "@/shared/lib/auth-email/types";

const AUTH_NEXT_STEPS: AuthNextStep[] = [
  "signed_in",
  "check_email",
  "password_updated",
  "signed_out",
];

function isAuthNextStep(value: unknown): value is AuthNextStep {
  return AUTH_NEXT_STEPS.includes(value as AuthNextStep);
}

export async function sendAuthEmailRequest(
  request: AuthEmailRequest,
): Promise<AuthActionResult> {
  try {
    const response = await fetch("/api/auth/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const payload = (await response.json().catch(() => null)) as
      | Partial<AuthActionResult>
      | null;

    return {
      ok: response.ok && payload?.ok === true,
      message:
        typeof payload?.message === "string" && payload.message
          ? payload.message
          : "邮件请求没有完成，请稍后再试。",
      nextStep: isAuthNextStep(payload?.nextStep) ? payload.nextStep : "signed_out",
    };
  } catch {
    return {
      ok: false,
      message: "邮件请求没有完成，请检查网络后再试。",
      nextStep: "signed_out",
    };
  }
}
