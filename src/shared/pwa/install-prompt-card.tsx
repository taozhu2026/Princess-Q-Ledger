"use client";

import { Download, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/shared/ui/button";
import { CatIllustration } from "@/shared/ui/cat-illustration";
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
            现在已经支持独立窗口打开、基础缓存和离线草稿。装到手机主屏幕后，会更像一只随手可开的记账小工具。
          </CardDescription>
        </div>
        <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>

      <div className="theme-accent-card mt-5 flex items-center gap-4 rounded-[24px] px-4 py-4">
        <CatIllustration className="h-24 w-24 shrink-0" mood="happy" />
        <div>
          <p className="text-sm font-semibold">装到主屏幕后，打开就像进入自己的小 App。</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            记一笔、看统计、处理草稿都会更顺手，弱网下也不容易打断节奏。
          </p>
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
          <Download className="mr-2 h-4 w-4" />
          {installed ? "已安装" : deferredPrompt ? "立即安装" : "等待浏览器提示"}
        </Button>
        <p className="self-center text-sm text-[var(--muted)]">
          iPhone 也可以通过浏览器里的“添加到主屏幕”完成安装。
        </p>
      </div>
    </Card>
  );
}
