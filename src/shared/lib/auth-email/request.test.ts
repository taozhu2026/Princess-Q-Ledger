import { describe, expect, it } from "vitest";

import { parseAuthEmailRequest } from "@/shared/lib/auth-email/request";

describe("parseAuthEmailRequest", () => {
  it("should normalize a signup request", () => {
    expect(
      parseAuthEmailRequest({
        action: "signup",
        email: "  kitty@example.com  ",
        password: "secret-123",
        displayName: "  Princess Q  ",
        nextPath: "/invite/token-1",
      }),
    ).toEqual({
      action: "signup",
      email: "kitty@example.com",
      password: "secret-123",
      displayName: "Princess Q",
      nextPath: "/invite/token-1",
    });
  });

  it("should allow recovery without password", () => {
    expect(
      parseAuthEmailRequest({
        action: "recovery",
        email: "reset@example.com",
      }),
    ).toEqual({
      action: "recovery",
      email: "reset@example.com",
      displayName: undefined,
      nextPath: undefined,
    });
  });

  it("should reject signup without password", () => {
    expect(
      parseAuthEmailRequest({
        action: "signup",
        email: "kitty@example.com",
      }),
    ).toBeNull();
  });

  it("should reject unknown actions", () => {
    expect(
      parseAuthEmailRequest({
        action: "invite",
        email: "kitty@example.com",
      }),
    ).toBeNull();
  });
});
