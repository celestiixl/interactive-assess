import Link from "next/link";
import { Pill } from "./Pill";
import LangToggle from "./LangToggle";

export function Topbar({
  rightPrimaryHref = "/practice",
  rightPrimaryLabel = "Open Practice",
  rightSecondaryHref = "/teacher/dashboard",
  rightSecondaryLabel = "Teacher",
}: {
  rightPrimaryHref?: string;
  rightPrimaryLabel?: string;
  rightSecondaryHref?: string;
  rightSecondaryLabel?: string;
}) {
  return (
    <header className="w-full">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-4 px-6 py-4">
        
        <LangToggle />
<div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/30 bg-white/20 text-sm font-bold text-white">
            BS
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              BioSpark
            </div>
            <div className="text-xs text-white/70">
              STAAR Biology • Practice & Mastery
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Pill tone="white">STAAR aligned</Pill>
          <Pill tone="white">Interactive</Pill>
          <Pill tone="white">Practice/Test</Pill>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={rightPrimaryHref}
            className="rounded-xl border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
          >
            {rightPrimaryLabel}
          </Link>
          <Link
            href={rightSecondaryHref}
            className="rounded-xl border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
          >
            {rightSecondaryLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}