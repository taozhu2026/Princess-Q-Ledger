import {
  AUTH_EMAIL_ACTIONS,
  type AuthEmailAction,
  type AuthEmailRequest,
} from "@/shared/lib/auth-email/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAuthEmailAction(value: unknown): value is AuthEmailAction {
  return AUTH_EMAIL_ACTIONS.includes(value as AuthEmailAction);
}

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

export function parseAuthEmailRequest(body: unknown): AuthEmailRequest | null {
  if (!isRecord(body) || !isAuthEmailAction(body.action)) {
    return null;
  }

  const email = normalizeOptionalString(body.email);
  if (!email) {
    return null;
  }

  const request: AuthEmailRequest = {
    action: body.action,
    email,
    displayName: normalizeOptionalString(body.displayName),
    nextPath: typeof body.nextPath === "string" ? body.nextPath : undefined,
  };

  if (body.action === "signup") {
    if (typeof body.password !== "string" || body.password.length === 0) {
      return null;
    }

    request.password = body.password;
  }

  return request;
}
