"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import { APP_BUILD_ID } from "@/shared/config/build";
import {
  fetchAppVersion,
  isNewAppVersion,
} from "@/shared/pwa/version";
import { Button } from "@/shared/ui/button";

const UPDATE_CHECK_INTERVAL_MS = 3 * 60 * 1000;
const UPDATE_RELOAD_DELAY_MS = 1500;
const UPDATE_TARGET_SESSION_KEY = "princess-q-ledger-update-target";

function getServiceWorkerUrl(buildId: string) {
  return `/sw.js?build=${encodeURIComponent(buildId)}`;
}

function hasAttemptedReload(targetBuildId: string) {
  return sessionStorage.getItem(UPDATE_TARGET_SESSION_KEY) === targetBuildId;
}

function markReloadAttempt(targetBuildId: string) {
  sessionStorage.setItem(UPDATE_TARGET_SESSION_KEY, targetBuildId);
}

function clearReloadAttemptForCurrentBuild() {
  if (sessionStorage.getItem(UPDATE_TARGET_SESSION_KEY) === APP_BUILD_ID) {
    sessionStorage.removeItem(UPDATE_TARGET_SESSION_KEY);
  }
}

export function PwaRegister() {
  const [pendingBuildId, setPendingBuildId] = useState<string | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const controllerChangeHandledRef = useRef(false);
  const reloadTimerRef = useRef<number | null>(null);
  const pendingBuildIdRef = useRef<string | null>(null);

  const reloadToLatest = useEffectEvent((targetBuildId: string) => {
    if (reloadTimerRef.current) {
      window.clearTimeout(reloadTimerRef.current);
      reloadTimerRef.current = null;
    }

    if (hasAttemptedReload(targetBuildId)) {
      return;
    }

    markReloadAttempt(targetBuildId);
    window.location.reload();
  });

  const scheduleReload = useEffectEvent((targetBuildId: string) => {
    if (hasAttemptedReload(targetBuildId) || reloadTimerRef.current) {
      return;
    }

    reloadTimerRef.current = window.setTimeout(() => {
      reloadTimerRef.current = null;
      reloadToLatest(targetBuildId);
    }, UPDATE_RELOAD_DELAY_MS);
  });

  const activateWaitingWorker = useEffectEvent((targetBuildId: string) => {
    const waitingWorker = registrationRef.current?.waiting;

    if (!waitingWorker) {
      scheduleReload(targetBuildId);
      return;
    }

    waitingWorker.postMessage({
      type: "SKIP_WAITING",
    });
    scheduleReload(targetBuildId);
  });

  const watchInstallingWorker = useEffectEvent(
    (worker: ServiceWorker, targetBuildId: string) => {
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          activateWaitingWorker(targetBuildId);
        }
      });
    },
  );

  const registerCurrentServiceWorker = useEffectEvent(async () => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const registration = await navigator.serviceWorker.register(
      getServiceWorkerUrl(APP_BUILD_ID),
      {
        updateViaCache: "none",
      },
    );

    registrationRef.current = registration;

    if (registration.waiting) {
      registration.waiting.postMessage({
        type: "SKIP_WAITING",
      });
      return;
    }

    await registration.update().catch(() => undefined);
  });

  const ensureLatestServiceWorker = useEffectEvent(async (targetBuildId: string) => {
    if (!("serviceWorker" in navigator)) {
      scheduleReload(targetBuildId);
      return;
    }

    const registration = await navigator.serviceWorker.register(
      getServiceWorkerUrl(targetBuildId),
      {
        updateViaCache: "none",
      },
    );

    registrationRef.current = registration;

    if (registration.waiting) {
      activateWaitingWorker(targetBuildId);
      return;
    }

    if (registration.installing) {
      watchInstallingWorker(registration.installing, targetBuildId);
      return;
    }

    await registration.update().catch(() => undefined);
    scheduleReload(targetBuildId);
  });

  const checkForNewVersion = useEffectEvent(async () => {
    try {
      const remoteVersion = await fetchAppVersion();

      if (!isNewAppVersion(remoteVersion)) {
        return;
      }

      setPendingBuildId(remoteVersion.buildId);
      pendingBuildIdRef.current = remoteVersion.buildId;
      await ensureLatestServiceWorker(remoteVersion.buildId);
    } catch {
      // Ignore transient network failures and check again on the next focus/interval.
    }
  });

  const handleControllerChange = useEffectEvent(() => {
    if (controllerChangeHandledRef.current) {
      return;
    }

    if (!pendingBuildIdRef.current) {
      return;
    }

    controllerChangeHandledRef.current = true;
    reloadToLatest(pendingBuildIdRef.current);
  });

  const handleVisibilityOrFocus = useEffectEvent(() => {
    if (document.visibilityState === "hidden") {
      return;
    }

    void checkForNewVersion();
    registrationRef.current?.update().catch(() => undefined);
  });

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }

    clearReloadAttemptForCurrentBuild();

    const canUseServiceWorker = "serviceWorker" in navigator;

    if (canUseServiceWorker) {
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        handleControllerChange,
      );
      void registerCurrentServiceWorker();
    }

    void checkForNewVersion();

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void checkForNewVersion();
      }
    }, UPDATE_CHECK_INTERVAL_MS);

    return () => {
      if (reloadTimerRef.current) {
        window.clearTimeout(reloadTimerRef.current);
      }

      if (canUseServiceWorker) {
        navigator.serviceWorker.removeEventListener(
          "controllerchange",
          handleControllerChange,
        );
      }
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.clearInterval(intervalId);
    };
  }, []);

  if (!pendingBuildId || pendingBuildId === APP_BUILD_ID) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 mx-auto max-w-[520px] px-4">
      <div className="theme-card-shell pointer-events-auto rounded-[24px] border px-4 py-4 shadow-[var(--shadow-card)] backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">发现新版本</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              系统正在切换到最新页面；如果没有自动刷新，可以手动点一次更新。
            </p>
          </div>
          <Button
            className="shrink-0"
            onClick={() => {
              registrationRef.current?.update().catch(() => undefined);
              registrationRef.current?.waiting?.postMessage({
                type: "SKIP_WAITING",
              });

              if (!hasAttemptedReload(pendingBuildId)) {
                markReloadAttempt(pendingBuildId);
              }

              window.location.reload();
            }}
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            立即更新
          </Button>
        </div>
      </div>
    </div>
  );
}
