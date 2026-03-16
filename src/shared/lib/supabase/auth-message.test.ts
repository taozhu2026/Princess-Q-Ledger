import { describe, expect, it } from "vitest";

import { toAuthMessage } from "@/shared/lib/supabase/auth-message";

describe("toAuthMessage", () => {
  it("should translate common Supabase auth failures", () => {
    expect(toAuthMessage("Invalid login credentials")).toBe("邮箱或密码不正确。");
    expect(toAuthMessage("Email rate limit exceeded")).toBe(
      "邮件发送太频繁了，请稍后再试。",
    );
  });

  it("should keep unknown messages", () => {
    expect(toAuthMessage("Something custom happened")).toBe(
      "Something custom happened",
    );
  });

  it("should fall back when the message is empty", () => {
    expect(toAuthMessage("")).toBe("认证请求没有完成，请稍后再试。");
  });
});
