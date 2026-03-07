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
      <div className="flex h-14 w-full items-center justify-between gap-4 py-1">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-linear-to-r from-bs-teal to-[#0099aa] text-sm shadow-[var(--bs-teal-glow)]">
            ⚡
          </div>
          <div>
            <div className="text-sm font-semibold text-bs-text">
              Bio<span className="text-bs-teal">Spark</span>
            </div>
            <div className="text-xs text-bs-text-muted">
              STAAR Biology • Practice & Mastery
            </div>
          </div>
        </Link>

        <LangToggle />

        <div className="hidden items-center gap-2 md:flex">
          <Pill
            tone="white"
            className="border-bs-teal/55 bg-[var(--bs-teal-dim)] text-bs-teal"
          >
            STAAR aligned
          </Pill>
          <Pill
            tone="white"
            className="border-bs-teal/55 bg-[var(--bs-teal-dim)] text-bs-teal"
          >
            Interactive
          </Pill>
          <Pill
            tone="white"
            className="border-bs-teal/55 bg-[var(--bs-teal-dim)] text-bs-teal"
          >
            Practice/Test
          </Pill>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={rightPrimaryHref}
            className="rounded-full border border-bs-teal/55 bg-[var(--bs-teal-dim)] px-4 py-2 text-sm font-semibold text-bs-teal transition hover:bg-bs-teal hover:text-[#04231f]"
          >
            {rightPrimaryLabel}
          </Link>

          {teacher ? (
            /* Authenticated teacher — show name badge + logout */
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-xl border border-bs-border bg-bs-raised px-3 py-2 sm:flex">
                <div className="grid h-6 w-6 place-items-center rounded-full bg-bs-overlay text-xs font-bold text-bs-text">
                  {teacher.name.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-bs-text">
                  {teacher.name}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-bs-coral/50 bg-bs-coral px-4 py-2 text-sm font-semibold text-[#2b0b0b] transition hover:brightness-105"
              >
                Sign Out
              </button>
            </div>
          ) : (
            /* Unauthenticated — show Sign In link */
            <Link
              href="/teacher/login"
              className="rounded-full border border-bs-border bg-transparent px-4 py-2 text-sm font-semibold text-bs-text transition hover:border-bs-teal/55 hover:text-bs-teal"
            >
              Teacher Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
