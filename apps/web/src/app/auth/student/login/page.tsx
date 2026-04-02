"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ValidateResponse {
  ok: boolean;
  normalizedName?: string;
  reason?: string;
}

export default function StudentLoginPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [period, setPeriod] = useState("");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const fetchSuggestion = useCallback(async (value: string) => {
    if (value.trim().length < 2) {
      setSuggestion(null);
      return;
    }
    try {
      const res = await fetch("/api/student/validate-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value }),
      });
      const data: ValidateResponse = await res.json();
      if (
        data.ok &&
        data.normalizedName &&
        data.normalizedName.toLowerCase() !== value.trim().toLowerCase()
      ) {
        setSuggestion(data.normalizedName);
      } else {
        setSuggestion(null);
      }
    } catch (err) {
      console.error("[StudentLogin] suggestion fetch failed:", err);
      setSuggestion(null);
    }
  }, []);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setName(value);
    setError(null);
    setSuggestion(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestion(value), 400);
  }

  function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setSuggestion(null);
    }
  }

  function handlePeriodChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPeriod(e.target.value);
    setError(null);
  }

  function handleSuggestionClick() {
    if (suggestion) {
      setName(suggestion);
      setSuggestion(null);
    }
  }

  async function handleLogin() {
    if (!name.trim() || !period) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/student/validate-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), period }),
      });
      const data: ValidateResponse = await res.json();

      if (!data.ok) {
        setError(
          "We couldn't find that name in this period. Double-check with your teacher."
        );
        setLoading(false);
        return;
      }

      const finalName = data.normalizedName ?? name.trim();
      localStorage.setItem(
        "biospark:student:session",
        JSON.stringify({ name: finalName, period, loginAt: Date.now() })
      );

      router.replace("/student/dashboard");
    } catch (err) {
      console.error("[StudentLogin] login request failed:", err);
      setError("Connection error. Please check your internet and try again.");
      setLoading(false);
    }
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
            Enter your name to pick up where you left off
          </p>
        </div>

        {/* Login card */}
        <div className="w-full max-w-sm rounded-2xl border border-[#00d4aa]/20 bg-[#132638] p-8">
          <div className="flex flex-col gap-5">
            {/* Name input */}
            <div>
              <input
                ref={nameInputRef}
                type="text"
                aria-label="Your first name"
                placeholder="Your first name..."
                value={name}
                onChange={handleNameChange}
                onKeyDown={handleNameKeyDown}
                disabled={loading}
                className="w-full bg-[#0d1e2c] border border-[#00d4aa]/30 rounded-xl px-4 py-3
                           text-[#e8f4f0] placeholder-[#5a8070] text-base
                           focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa]/40
                           transition-all duration-200 disabled:opacity-50"
              />
              {suggestion && (
                <button
                  type="button"
                  onClick={handleSuggestionClick}
                  className="mt-1.5 text-sm text-[#00d4aa] cursor-pointer hover:underline text-left"
                >
                  Did you mean {suggestion}? &rarr;
                </button>
              )}
            </div>

            {/* Period selector */}
            <select
              aria-label="Select your class period"
              value={period}
              onChange={handlePeriodChange}
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

            {/* Submit button */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={!name.trim() || !period || loading}
              className="w-full bg-[#00d4aa] text-[#0d1e2c] font-bold rounded-xl py-3
                         text-base tracking-wide
                         hover:bg-[#00e8bb] transition-all duration-200
                         disabled:opacity-40 disabled:cursor-not-allowed
                         active:scale-95"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {loading ? (
                <span className="student-login-btn-pulsing">Logging in...</span>
              ) : (
                "Let's go \u2192"
              )}
            </button>

            {/* Error message */}
            {error && (
              <p role="alert" className="text-sm text-[#ff6b6b] text-center -mt-1">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-4 text-xs text-[#5a8070] text-center">
          Not you? Ask your teacher to check your name.
        </p>
      </div>
    </div>
  );
}
