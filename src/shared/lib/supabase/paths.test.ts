import { describe, expect, it } from "vitest";

import {
  appendNextPath,
  resolveSafeNextPath,
} from "@/shared/lib/supabase/paths";

describe("resolveSafeNextPath", () => {
  it("should keep in-app paths", () => {
    expect(resolveSafeNextPath("/auth/reset-password")).toBe("/auth/reset-password");
    expect(resolveSafeNextPath("/invite/token-1")).toBe("/invite/token-1");
  });

  it("should reject unsafe redirects", () => {
    expect(resolveSafeNextPath("https://example.com", "/")).toBe("/");
    expect(resolveSafeNextPath("//example.com", "/ledger")).toBe("/ledger");
    expect(resolveSafeNextPath(undefined, "/settings")).toBe("/settings");
  });
});

describe("appendNextPath", () => {
  it("should skip the query for the default path", () => {
    expect(appendNextPath("/auth/login", "/")).toBe("/auth/login");
  });

  it("should encode the next path once", () => {
    expect(appendNextPath("/auth/login", "/invite/token-1")).toBe(
      "/auth/login?next=%2Finvite%2Ftoken-1",
    );
  });
});
