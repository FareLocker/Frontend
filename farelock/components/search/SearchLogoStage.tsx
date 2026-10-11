"use client";

import LogoIntro from "@/components/LogoIntro";

/** Shared stage size for the search loading logo. */
export default function SearchLogoStage({
  onComplete,
  loop = false,
}: {
  onComplete?: () => void;
  loop?: boolean;
}) {
  return (
    <div
      role="status"
      className="flex min-h-[360px] flex-col items-center justify-center py-10 sm:min-h-[480px]"
    >
      <span className="sr-only">Loading fares</span>
      <div className="aspect-[732/95] w-full max-w-4xl">
        <LogoIntro
          start="lock"
          upTo="logo"
          loop={loop}
          logoWidth={0.96}
          onComplete={onComplete}
        />
      </div>
    </div>
  );
}
