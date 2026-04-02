"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStudentAuth } from "@/lib/studentAuth";

export default function StudentRegisterPage() {
  const router = useRouter();
  const { register } = useStudentAuth();

  const [schoolId, setSchoolId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [period, setPeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schoolIdRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    schoolIdRef.current?.focus();
  }, []);

  function clearError() {
    setError(null);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!schoolId.trim() || !name.trim() || !password) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = register(schoolId, name, password, period || undefined);
    if (!result.ok) {
      setError(result.error ?? "Registration failed.");
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
            Create your password to get started
          </p>
        </div>

        {/* Register card */}
        <form
          onSubmit={handleRegister}
          className="w-full max-w-sm rounded-2xl border border-[#00d4aa]/20 bg-[#132638] p-8"
        >
          <div className="flex flex-col gap-5">
            {/* School ID */}
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
                onChange={(e) => { setSchoolId(e.target.value); clearError(); }}
                disabled={loading}
                autoComplete="username"
                className="w-full bg-[#0d1e2c] border border-[#00d4aa]/30 rounded-xl px-4 py-3
                           text-[#e8f4f0] placeholder-[#5a8070] text-base
                           focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa]/40
                           transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="text-sm font-medium text-[#9abcb0]"
              >
                Your name
              </label>
              <input
                id="name"
                type="text"
                aria-label="Your full name"
                placeholder="First and last name"
                value={name}
                onChange={(e) => { setName(e.target.value); clearError(); }}
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
                onChange={(e) => { setPeriod(e.target.value); clearError(); }}
                disabled={loading}
                className="w-full bg-[#0d1e2c] border border-[#00d4aa]/30 rounded-xl px-4 py-3
                           text-[#e8f4f0] text-base
                           focus:outline-none focus:border-[#00d4aa]
                           disabled:opacity-50"
              >
                <option value="">Select your class period...</option>
                <option value="1">Period 1</option>
                <option value="2">Period 2</option>
                <option value="3">Period 3</option>
                <option value="4">Period 4</option>
                <option value="5">Period 5</option>
                <option value="6">Period 6</option>
                <option value="7">Period 7</option>
              </select>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#9abcb0]"
              >
                Create a password
              </label>
              <input
                id="password"
                type="password"
                aria-label="Create a password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                disabled={loading}
                autoComplete="new-password"
                className="w-full bg-[#0d1e2c] border border-[#00d4aa]/30 rounded-xl px-4 py-3
                           text-[#e8f4f0] placeholder-[#5a8070] text-base
                           focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa]/40
                           transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-[#9abcb0]"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                aria-label="Confirm your password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }}
                disabled={loading}
                autoComplete="new-password"
                className="w-full bg-[#0d1e2c] border border-[#00d4aa]/30 rounded-xl px-4 py-3
                           text-[#e8f4f0] placeholder-[#5a8070] text-base
                           focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa]/40
                           transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={
                !schoolId.trim() ||
                !name.trim() ||
                !password ||
                !confirmPassword ||
                loading
              }
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
