import { APP_BUILD_ID, APP_BUILD_TIME } from "@/shared/config/build";

export const APP_VERSION_ENDPOINT = "/api/app-version";

export interface AppVersionPayload {
  buildId: string;
  builtAt: string;
}

export function getCurrentAppVersion(): AppVersionPayload {
  return {
    buildId: APP_BUILD_ID,
    builtAt: APP_BUILD_TIME,
  };
}

export function isNewAppVersion(
  remoteVersion: Partial<AppVersionPayload> | null | undefined,
  currentBuildId = APP_BUILD_ID,
) {
  return (
    typeof remoteVersion?.buildId === "string" &&
    remoteVersion.buildId.length > 0 &&
    remoteVersion.buildId !== currentBuildId
  );
}

export async function fetchAppVersion(signal?: AbortSignal) {
  const response = await fetch(APP_VERSION_ENDPOINT, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Version check failed with status ${response.status}`);
  }

  return (await response.json()) as AppVersionPayload;
}
