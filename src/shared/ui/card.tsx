import type { PropsWithChildren } from "react";

import { cn } from "@/shared/lib/utils";

export function Card({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={cn(
        "card-rise rounded-[24px] border border-[color:var(--panel-border)] bg-[var(--card)]/96 p-5 shadow-[var(--shadow-card)] backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardTitle({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <h2 className={cn("text-[15px] font-semibold tracking-[0.01em] text-[var(--foreground)]", className)}>
      {children}
    </h2>
  );
}

export function CardDescription({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <p className={cn("text-sm leading-6 text-[var(--muted)]", className)}>
      {children}
    </p>
  );
}
