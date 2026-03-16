import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";

type ButtonLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  VariantProps<typeof buttonVariants>;

export function ButtonLink({
  className,
  size,
  variant,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonVariants({ size, variant }), className)}
      {...props}
    />
  );
}
