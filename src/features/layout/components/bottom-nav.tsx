"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/shared/config/navigation";
import { cn } from "@/shared/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[520px] px-4 pb-4">
      <div className="theme-nav-shell grid grid-cols-4 rounded-[28px] border px-2 py-2 shadow-[0_20px_34px_rgba(111,159,134,0.14)] backdrop-blur">
        {navigationItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-[20px] px-2 py-2 text-[11px] font-medium transition duration-200 ease-out",
                active
                  ? "theme-active-pill text-[var(--accent-strong)] shadow-[0_8px_16px_rgba(111,159,134,0.12)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface)]",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  active ? "theme-elevated-surface" : "bg-transparent",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
