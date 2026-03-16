import type { InputHTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-[20px] border border-white/70 bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none shadow-[var(--shadow-soft)] transition-[border-color,box-shadow,background-color] duration-200 ease-out placeholder:text-[var(--muted)] focus:border-[rgba(111,159,134,0.3)] focus:bg-white focus:shadow-[0_12px_24px_rgba(111,159,134,0.12)]",
        className,
      )}
      {...props}
    />
  );
}
