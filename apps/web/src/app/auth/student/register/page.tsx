"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStudentAuth } from "@/lib/studentAuth";

export default function StudentRegisterPage() {
  const router = useRouter();
  const setStudent = useStudentAuth((s) => s.setStudent);

  const [displayName, setDisplayName] = useState("");
  const [period, setPeriod] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim(), period: Number(period) }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Registration failed.");
        setLoading(false);
        return;
      }

      const student = await res.json() as { id: string; displayName: string; period: number };
      setStudent({ id: student.id, displayName: student.displayName, period: student.period });
      router.replace("/student/dashboard");
    } catch {
      setError("Could not connect. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      className="relative min-h-dvh overflow-hidden bg-[#0d1e2c] flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Animated background orbs */}
      <div
        className="student-login-orb-teal pointer-events-none absolute top-[-200px] left-[-150px] w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #00d4aa 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="student-login-orb-amber pointer-events-none absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #f5a623 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Wordmark */}
      <div className="absolute top-4 left-5 z-10">
        <Link
          href="/"
          className="text-sm font-bold text-[#00d4aa] tracking-wide"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          BioSpark
        </Link>
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16">
        {/* Hero */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00d4aa]/15 border border-[#00d4aa]/30 text-2xl">
            <span role="img" aria-label="spark">
              &#x26A1;
            </span>
          </div>
          <h1
            className="text-3xl font-bold text-[#e8f4f0]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Set up your account
          </h1>
          <p className="mt-2 text-sm text-[#9abcb0]">
            Enter your name and class period to get started
          </p>
        </div>

        {/* Register card */}
        <form
          onSubmit={handleRegister}
          className="w-full max-w-sm rounded-2xl border border-[#00d4aa]/20 bg-[#132638] p-8"
        >
          <div className="flex flex-col gap-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="displayName"
                className="text-sm font-medium text-[#9abcb0]"
              >
                Your name
              </label>
              <input
                ref={nameRef}
                id="displayName"
                type="text"
                aria-label="Your full name"
                placeholder="First and last name"
                value={displayName}
                onChange={(e) => { setDisplayName(e.target.value); setError(null); }}
                disabled={loading}
                autoComplete="name"
                className="w-full bg-[#0d1e2c] border border-[#00d4aa]/30 rounded-xl px-4 py-3
                           text-[#e8f4f0] placeholder-[#5a8070] text-base
                           focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa]/40
                           transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* Period */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="period"
                className="text-sm font-medium text-[#9abcb0]"
              >
                Class period
              </label>
              <select
                id="period"
                aria-label="Select your class period"
                value={period}
                onChange={(e) => { setPeriod(e.target.value); setError(null); }}
                disabled={loading}
                className="w-full bg-[#0d1e2c] border border-[#00d4aa]/30 rounded-xl px-4 py-3
                           text-[#e8f4f0] text-base
                           focus:outline-none focus:border-[#00d4aa]
                           disabled:opacity-50"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                  <option key={p} value={p}>Period {p}</option>
                ))}
              </select>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!displayName.trim() || loading}
              className="w-full bg-[#00d4aa] text-[#0d1e2c] font-bold rounded-xl py-3
                         text-base tracking-wide
                         hover:bg-[#00e8bb] transition-all duration-200
                         disabled:opacity-40 disabled:cursor-not-allowed
                         active:scale-95"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {loading ? (
                <span className="student-login-btn-pulsing">
                  Creating account...
                </span>
              ) : (
                "Create account \u2192"
              )}
            </button>

            {/* Error message */}
            {error && (
              <p
                role="alert"
                className="text-sm text-[#ff6b6b] text-center -mt-1"
              >
                {error}
              </p>
            )}
          </div>
        </form>

        {/* Login link */}
        <p className="mt-4 text-sm text-[#9abcb0] text-center">
          Already have an account?{" "}
          <Link
            href="/auth/student/login"
            className="text-[#00d4aa] font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
