import { cn } from "@/shared/lib/utils";

type CatMood = "sleeping" | "happy" | "confused";

function Face({ mood }: { mood: CatMood }) {
  if (mood === "sleeping") {
    return (
      <>
        <path d="M70 84c5-6 11-6 16 0" fill="none" stroke="#6F9F86" strokeLinecap="round" strokeWidth="4" />
        <path d="M108 84c5-6 11-6 16 0" fill="none" stroke="#6F9F86" strokeLinecap="round" strokeWidth="4" />
        <path d="M90 104c8 7 18 7 26 0" fill="none" stroke="#D39B7F" strokeLinecap="round" strokeWidth="4" />
      </>
    );
  }

  if (mood === "confused") {
    return (
      <>
        <circle cx="78" cy="84" fill="#6F9F86" r="5" />
        <circle cx="118" cy="84" fill="#6F9F86" r="5" />
        <path d="M90 108c7-4 14-5 21-1" fill="none" stroke="#D27F79" strokeLinecap="round" strokeWidth="4" />
      </>
    );
  }

  return (
    <>
      <circle cx="78" cy="84" fill="#6F9F86" r="5" />
      <circle cx="118" cy="84" fill="#6F9F86" r="5" />
      <path d="M90 102c7 8 17 8 24 0" fill="none" stroke="#D39B7F" strokeLinecap="round" strokeWidth="4" />
    </>
  );
}

export function CatIllustration({
  className,
  mood = "sleeping",
}: {
  className?: string;
  mood?: CatMood;
}) {
  return (
    <div
      className={cn(
        "relative flex h-32 w-32 items-center justify-center rounded-[36px] bg-[linear-gradient(180deg,var(--accent-soft),var(--highlight-soft))] shadow-[0_10px_24px_rgba(111,159,134,0.12)]",
        className,
      )}
    >
      <div className="paw-bounce absolute right-3 top-3 text-[var(--accent)]/60">
        <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
          <path
            d="M7 13c-1.8 0-3 1.3-3 2.7C4 17.3 5.6 19 8 19c1.7 0 3-1 4-1s2.3 1 4 1c2.4 0 4-1.7 4-3.3 0-1.4-1.2-2.7-3-2.7-1.2 0-1.9.4-2.7 1-.7.5-1.2 1-2.3 1s-1.6-.5-2.3-1C8.9 13.4 8.2 13 7 13Z"
            fill="currentColor"
          />
          <circle cx="7" cy="8" fill="currentColor" r="2" />
          <circle cx="11" cy="6" fill="currentColor" r="2" />
          <circle cx="15" cy="6" fill="currentColor" r="2" />
          <circle cx="19" cy="8" fill="currentColor" r="2" />
        </svg>
      </div>

      <svg fill="none" viewBox="0 0 196 160" className="h-24 w-28">
        <path
          d="M46 56 66 22c2-4 7-4 9 1l9 22M150 56l-20-34c-2-4-7-4-9 1l-9 22"
          fill="#F7D5A8"
          stroke="#D9A676"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <rect
          x="40"
          y="40"
          width="116"
          height="88"
          rx="42"
          fill="#FFF8F0"
          stroke="#E9D6BE"
          strokeWidth="4"
        />
        <ellipse cx="98" cy="116" rx="20" ry="10" fill="#F4D6D6" opacity="0.7" />
        <Face mood={mood} />
        <path d="M96 90 99 95l3-5" fill="none" stroke="#D39B7F" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        <path d="M62 96c-7 0-11 3-15 7M62 102c-8 1-12 4-17 8M134 96c7 0 11 3 15 7M134 102c8 1 12 4 17 8" stroke="#DCC7B2" strokeLinecap="round" strokeWidth="3" />
      </svg>
    </div>
  );
}
