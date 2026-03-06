"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pill } from "./Pill";
import LangToggle from "./LangToggle";
import { useTeacherAuth } from "@/lib/teacherAuth";

export function Topbar({
  rightPrimaryHref = "/practice",
  rightPrimaryLabel = "Open Practice",
}: {
  rightPrimaryHref?: string;
  rightPrimaryLabel?: string;
}) {
  const { teacher, logout } = useTeacherAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/teacher/login");
  }

  return (
    <header className="w-full">
      <div className="flex w-full items-center justify-between gap-4 py-2">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/30 bg-white/20 text-sm font-bold text-white">
            BS
          </div>
          <div>
            <div className="text-sm font-semibold text-white">BioSpark</div>
            <div className="text-xs text-white/70">
              STAAR Biology • Practice & Mastery
            </div>
          </div>
        </Link>

        <LangToggle />

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

          {teacher ? (
            /* Authenticated teacher — show name badge + logout */
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-3 py-2 sm:flex">
                <div className="grid h-6 w-6 place-items-center rounded-full bg-white/30 text-xs font-bold text-white">
                  {teacher.name.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-white">
                  {teacher.name}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
              >
                Sign Out
              </button>
            </div>
          ) : (
            /* Unauthenticated — show Sign In link */
            <Link
              href="/teacher/login"
              className="rounded-xl border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
            >
              Teacher Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
