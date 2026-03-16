import { describe, expect, it } from "vitest";

import { isNewAppVersion } from "@/shared/pwa/version";

describe("isNewAppVersion", () => {
  it("should detect when the remote build id changes", () => {
    expect(isNewAppVersion({ buildId: "build-2" }, "build-1")).toBe(true);
  });

  it("should ignore matching or empty build ids", () => {
    expect(isNewAppVersion({ buildId: "build-1" }, "build-1")).toBe(false);
    expect(isNewAppVersion({ buildId: "" }, "build-1")).toBe(false);
    expect(isNewAppVersion(null, "build-1")).toBe(false);
  });
});
