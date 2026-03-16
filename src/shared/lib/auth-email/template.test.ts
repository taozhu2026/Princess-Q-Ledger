import { describe, expect, it } from "vitest";

import { createAuthEmailTemplate } from "@/shared/lib/auth-email/template";

describe("createAuthEmailTemplate", () => {
  it("should create a signup email with the expected subject and action link", () => {
    const template = createAuthEmailTemplate({
      action: "signup",
      actionLink: "https://example.com/confirm?token=1",
      productName: "公主Q的账本",
    });

    expect(template.subject).toBe("公主Q的账本 | 完成账号注册");
    expect(template.html).toContain("完成注册");
    expect(template.html).toContain("https://example.com/confirm?token=1");
    expect(template.text).toContain("确认你的邮箱");
  });

  it("should escape html-sensitive values", () => {
    const template = createAuthEmailTemplate({
      action: "magiclink",
      actionLink: "https://example.com/?q=<test>",
      productName: "Princess <Q>",
    });

    expect(template.html).toContain("Princess &lt;Q&gt;");
    expect(template.html).toContain("https://example.com/?q=&lt;test&gt;");
  });
});
