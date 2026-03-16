const DEFAULT_PRODUCT_NAME = "公主Q的账本";

const REQUIRED_AUTH_EMAIL_ENV_NAMES = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "AUTH_EMAIL_FROM",
] as const;

export const AUTH_EMAIL_MISSING_CONFIG_MESSAGE =
  "邮件发送通道还没配置完成，请联系管理员开启邮件服务。";

export interface AuthEmailConfig {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  resendApiKey: string;
  from: string;
  replyTo?: string;
  productName: string;
}

export type AuthEmailConfigResult =
  | {
      ok: true;
      value: AuthEmailConfig;
    }
  | {
      ok: false;
      missing: string[];
    };

export function getAuthEmailConfig(): AuthEmailConfigResult {
  const missing = REQUIRED_AUTH_EMAIL_ENV_NAMES.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    return {
      ok: false,
      missing: [...missing],
    };
  }

  return {
    ok: true,
    value: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      resendApiKey: process.env.RESEND_API_KEY!,
      from: process.env.AUTH_EMAIL_FROM!,
      replyTo: process.env.AUTH_EMAIL_REPLY_TO?.trim() || undefined,
      productName: process.env.AUTH_EMAIL_PRODUCT_NAME?.trim() || DEFAULT_PRODUCT_NAME,
    },
  };
}
