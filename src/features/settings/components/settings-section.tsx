"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";

export function SettingsSection({
  children,
  description,
  icon,
  isOpen,
  onToggle,
  summary,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  summary?: ReactNode;
  title: string;
}) {
  return (
    <Card>
      <button
        aria-expanded={isOpen}
        className="w-full rounded-[20px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        onClick={onToggle}
        type="button"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <div className="rounded-[20px] bg-[var(--accent-soft)] p-3 text-[var(--accent-strong)]">
              {icon}
            </div>
            <div className="min-w-0">
              <CardTitle>{title}</CardTitle>
              <CardDescription className="mt-2">{description}</CardDescription>
            </div>
          </div>
          <div
            className={cn(
              "theme-elevated-surface mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition-transform",
              isOpen ? "rotate-180" : "rotate-0",
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {summary ? <div className="mt-4">{summary}</div> : null}
      </button>

      {isOpen ? (
        <div className="mt-5 border-t border-[color:var(--panel-border-soft)] pt-5">
          {children}
        </div>
      ) : null}
    </Card>
  );
}
