import type { AuthEmailConfig } from "@/shared/lib/auth-email/config";

export interface TransactionalEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendTransactionalEmail(
  config: AuthEmailConfig,
  input: TransactionalEmailInput,
) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: config.replyTo,
    }),
  });

  if (response.ok) {
    return {
      ok: true as const,
    };
  }

  let message = "邮件服务暂时不可用，请稍后再试。";

  try {
    const payload = (await response.json()) as {
      error?: { message?: string };
      message?: string;
    };

    if (typeof payload.error?.message === "string" && payload.error.message) {
      message = payload.error.message;
    } else if (typeof payload.message === "string" && payload.message) {
      message = payload.message;
    }
  } catch {
    // Ignore malformed upstream payloads and keep the fallback message.
  }

  return {
    ok: false as const,
    message,
  };
}
