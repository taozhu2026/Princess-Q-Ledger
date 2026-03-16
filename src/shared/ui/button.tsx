"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full border font-medium transition-[transform,background-color,border-color,box-shadow,opacity] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] px-4 text-white shadow-[0_10px_20px_rgba(111,159,134,0.24)] hover:brightness-[1.03]",
        secondary:
          "border-[rgba(111,159,134,0.14)] bg-[var(--accent-soft)] px-4 text-[var(--accent-strong)] shadow-[0_8px_18px_rgba(111,159,134,0.08)] hover:bg-[var(--surface-strong)]",
        ghost:
          "border-transparent bg-transparent px-3 text-[var(--foreground)] hover:bg-[var(--surface-strong)]",
        danger:
          "border-transparent bg-[linear-gradient(135deg,var(--danger),#e09d96)] px-4 text-white shadow-[0_10px_20px_rgba(210,127,121,0.2)] hover:brightness-[1.03]",
      },
      size: {
        sm: "h-10 text-sm",
        md: "h-11 text-sm",
        lg: "h-12 px-5 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      type={type}
      {...props}
    />
  );
}
