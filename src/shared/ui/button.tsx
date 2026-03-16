"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--accent)] px-4 text-white shadow-[0_18px_30px_rgba(38,79,53,0.18)] hover:opacity-95",
        secondary:
          "bg-[var(--accent-soft)] px-4 text-[var(--foreground)] hover:bg-[var(--surface-strong)]",
        ghost: "px-3 text-[var(--foreground)] hover:bg-[var(--surface-strong)]",
        danger: "bg-[var(--danger)] px-4 text-white hover:opacity-95",
      },
      size: {
        sm: "h-9 text-sm",
        md: "h-11 text-sm",
        lg: "h-12 text-base",
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
