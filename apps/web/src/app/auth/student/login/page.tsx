"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStudentAuth } from "@/lib/studentAuth";

export default function StudentLoginPage() {
  const router = useRouter();
  const { login } = useStudentAuth();

  const [schoolId, setSchoolId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schoolIdRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    schoolIdRef.current?.focus();
  }, []);

  function handleSchoolIdChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSchoolId(e.target.value);
    setError(null);
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
    setError(null);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!schoolId.trim() || !password) return;

    setLoading(true);
    setError(null);

    const result = login(schoolId, password);
    if (!result.ok) {
      setError(result.error ?? "Login failed.");
      setLoading(false);
      return;
    }

    router.replace("/student/dashboard");
  }

  return (
    <div
      className="relative min-h-dvh overflow-hidden bg-[#0d1e2c] flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Animated background orbs - classes defined in globals.css */}
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

      {/* Wordmark top-left */}
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
            Welcome back, scientist
          </h1>
          <p className="mt-2 text-sm text-[#9abcb0]">
            Sign in with your school ID and password
          </p>
        </div>

        {/* Login card */}
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl border border-[#00d4aa]/20 bg-[#132638] p-8"
        >
          <div className="flex flex-col gap-5">
            {/* School ID input */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="schoolId"
                className="text-sm font-medium text-[#9abcb0]"
              >
                School ID
              </label>
              <input
                ref={schoolIdRef}
                id="schoolId"
                type="text"
                aria-label="School ID"
                placeholder="e.g. S12345"
                value={schoolId}
                onChange={handleSchoolIdChange}
                disabled={loading}
                autoComplete="username"
                className="w-full bg-[#0d1e2c] border border-[#00d4aa]/30 rounded-xl px-4 py-3
                           text-[#e8f4f0] placeholder-[#5a8070] text-base
                           focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa]/40
                           transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* Password input */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#9abcb0]"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                aria-label="Password"
                placeholder="Your password"
                value={password}
                onChange={handlePasswordChange}
                disabled={loading}
                autoComplete="current-password"
                className="w-full bg-[#0d1e2c] border border-[#00d4aa]/30 rounded-xl px-4 py-3
                           text-[#e8f4f0] placeholder-[#5a8070] text-base
                           focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa]/40
                           transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!schoolId.trim() || !password || loading}
              className="w-full bg-[#00d4aa] text-[#0d1e2c] font-bold rounded-xl py-3
                         text-base tracking-wide
                         hover:bg-[#00e8bb] transition-all duration-200
                         disabled:opacity-40 disabled:cursor-not-allowed
                         active:scale-95"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {loading ? (
                <span className="student-login-btn-pulsing">Signing in...</span>
              ) : (
                "Sign in \u2192"
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

        {/* Register link */}
        <p className="mt-4 text-sm text-[#9abcb0] text-center">
          First time?{" "}
          <Link
            href="/auth/student/register"
            className="text-[#00d4aa] font-semibold hover:underline"
          >
            Set up your account
          </Link>
        </p>

        {/* Footer */}
        <p className="mt-3 text-xs text-[#5a8070] text-center">
          Forgot your password? Ask your teacher to reset it.
        </p>
      </div>
    </div>
  );
}
