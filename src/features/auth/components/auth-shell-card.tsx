import type { PropsWithChildren, ReactNode } from "react";
import { ChevronLeft, PawPrint } from "lucide-react";

import { ButtonLink } from "@/shared/ui/button-link";
import { CatIllustration } from "@/shared/ui/cat-illustration";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";

export function AuthShellCard({
  children,
  description,
  footer,
  mood = "happy",
  title,
}: PropsWithChildren<{
  description: string;
  footer?: ReactNode;
  mood?: "happy" | "sleeping" | "confused";
  title: string;
}>) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[460px] items-center">
      <Card className="theme-card-hero w-full overflow-hidden">
        <ButtonLink className="mb-4 w-fit px-3" href="/" size="sm" variant="ghost">
          <ChevronLeft className="mr-1 h-4 w-4" />
          回到首页
        </ButtonLink>

        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[var(--accent-strong)]">
            <PawPrint className="h-3.5 w-3.5" />
            ACCOUNT
          </div>
          <CatIllustration className="mt-4 h-28 w-28" mood={mood} />
          <CardTitle className="mt-3 text-center text-[24px] tracking-[-0.02em]">
            {title}
          </CardTitle>
          <CardDescription className="mt-3 text-center">
            {description}
          </CardDescription>
        </div>

        <div className="mt-6 space-y-4">{children}</div>

        {footer ? <div className="mt-6">{footer}</div> : null}
      </Card>
    </div>
  );
}
