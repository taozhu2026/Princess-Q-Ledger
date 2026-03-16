import type { AuthEmailAction } from "@/shared/lib/auth-email/types";

interface AuthEmailTemplateInput {
  action: AuthEmailAction;
  actionLink: string;
  productName: string;
}

interface AuthEmailTemplateContent {
  subject: string;
  title: string;
  description: string;
  buttonLabel: string;
  footnote: string;
}

const TEMPLATE_CONTENT: Record<AuthEmailAction, AuthEmailTemplateContent> = {
  signup: {
    subject: "完成账号注册",
    title: "确认你的邮箱",
    description: "点击下方按钮完成账号注册，之后就可以直接进入账本。",
    buttonLabel: "完成注册",
    footnote: "如果这不是你本人发起的注册，可以直接忽略这封邮件。",
  },
  magiclink: {
    subject: "登录链接",
    title: "继续登录账本",
    description: "点击下方按钮即可登录。建议在发起请求的同一台设备上打开这封邮件。",
    buttonLabel: "立即登录",
    footnote: "如果这不是你本人操作，可以忽略这封邮件。",
  },
  recovery: {
    subject: "重置密码",
    title: "继续设置新密码",
    description: "点击下方按钮继续重置密码，完成后就可以稳定地使用邮箱和密码登录。",
    buttonLabel: "重置密码",
    footnote: "如果你没有申请重置密码，可以忽略这封邮件，原密码不会被自动修改。",
  },
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function createAuthEmailTemplate({
  action,
  actionLink,
  productName,
}: AuthEmailTemplateInput) {
  const content = TEMPLATE_CONTENT[action];
  const safeProductName = escapeHtml(productName);
  const safeActionLink = escapeHtml(actionLink);
  const subject = `${productName} | ${content.subject}`;
  const footer = "这是一封系统邮件，请不要直接回复。";

  return {
    subject,
    html: `
      <div style="margin:0;padding:24px;background:#f6f1e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#2d241c;">
        <div style="max-width:560px;margin:0 auto;background:#fffdf9;border-radius:24px;padding:32px;border:1px solid #eadfce;">
          <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#9a8160;">${safeProductName}</p>
          <h1 style="margin:0;font-size:28px;line-height:1.2;color:#2d241c;">${content.title}</h1>
          <p style="margin:16px 0 0;font-size:16px;line-height:1.7;color:#5d4d3f;">${content.description}</p>
          <div style="margin:28px 0;">
            <a href="${safeActionLink}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#355f45;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;">${content.buttonLabel}</a>
          </div>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#7a6756;">${content.footnote}</p>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#9a8160;">如果按钮无法打开，可以复制下面的链接到浏览器：</p>
          <p style="margin:8px 0 0;font-size:13px;line-height:1.8;word-break:break-all;color:#355f45;">${safeActionLink}</p>
          <p style="margin:24px 0 0;font-size:12px;line-height:1.7;color:#b09779;">${footer}</p>
        </div>
      </div>
    `.trim(),
    text: [
      productName,
      content.title,
      content.description,
      `${content.buttonLabel}：${actionLink}`,
      content.footnote,
      footer,
    ].join("\n\n"),
  };
}
