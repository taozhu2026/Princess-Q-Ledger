"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/shared/config/navigation";
import { cn } from "@/shared/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[520px] px-4 pb-4">
      <div className="grid grid-cols-4 rounded-[26px] border border-[var(--border)] bg-[var(--card)]/92 px-2 py-2 shadow-[0_24px_40px_rgba(21,31,29,0.12)] backdrop-blur">
        {navigationItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition",
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--muted)]",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
