"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/shared/ui/button";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";

interface DeferredInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
  }>;
}

export function InstallPromptCard() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<DeferredInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as DeferredInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <CardTitle>安装到主屏幕</CardTitle>
          <CardDescription className="mt-2">
            首版已经支持独立窗口打开、基础缓存和离线草稿。装到手机主屏幕后会更像原生 App。
          </CardDescription>
        </div>
        <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
          <Download className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          disabled={!deferredPrompt || installed}
          onClick={async () => {
            if (!deferredPrompt) {
              return;
            }

            await deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            setDeferredPrompt(null);
          }}
        >
          {installed ? "已安装" : deferredPrompt ? "立即安装" : "浏览器安装提示待命中"}
        </Button>
        <p className="self-center text-sm text-[var(--muted)]">
          iPhone 也可以通过浏览器的“添加到主屏幕”安装。
        </p>
      </div>
    </Card>
  );
}
