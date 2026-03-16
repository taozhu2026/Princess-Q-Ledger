import type { ReactNode } from "react";

import { CatIllustration } from "@/shared/ui/cat-illustration";

export function EmptyState({
  title,
  description,
  action,
  mood = "sleeping",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  mood?: "sleeping" | "happy" | "confused";
}) {
  return (
    <div className="theme-surface-card-strong overflow-hidden rounded-[28px] border border-dashed px-5 py-6 text-center shadow-[var(--shadow-soft)]">
      <div className="relative flex justify-center">
        <div className="absolute top-4 h-20 w-20 rounded-full bg-[var(--highlight-soft)] blur-2xl" />
        <CatIllustration className="relative z-10 h-28 w-28" mood={mood} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-[280px] text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
