export function resolveSafeNextPath(
  nextPath: string | null | undefined,
  fallback = "/",
) {
  if (!nextPath) {
    return fallback;
  }

  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return fallback;
  }

  return nextPath;
}

export function appendNextPath(path: string, nextPath?: string) {
  const safeNextPath = resolveSafeNextPath(nextPath, "/");

  if (safeNextPath === "/") {
    return path;
  }

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}next=${encodeURIComponent(safeNextPath)}`;
}

export function buildAuthCallbackUrl(nextPath = "/") {
  if (typeof window === "undefined") {
    return undefined;
  }

  const url = new URL("/auth/callback", window.location.origin);
  url.searchParams.set("next", resolveSafeNextPath(nextPath, "/"));
  return url.toString();
}

export function buildPasswordRecoveryUrl() {
  return buildAuthCallbackUrl("/auth/reset-password");
}
