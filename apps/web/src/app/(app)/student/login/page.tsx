"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* NOTE: Users and sessions are stored in localStorage as a temporary
 * solution. A real backend with hashed passwords will replace this later. */

const WELCOME_SCREEN_DURATION_MS = 2200;

/* ─── types ───────────────────────────────────────────────── */
interface StoredUser {
  firstName: string;
  lastName: string;
  classCode: string;
  username: string;
  password: string;
}

/* ─── localStorage helpers ────────────────────────────────── */
const USERS_KEY = "biospark_users";
const SESSION_KEY = "biospark_current_user";
const REMEMBER_KEY = "biospark_remember_me";

function loadUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as StoredUser[];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveSession(username: string, remember: boolean) {
  sessionStorage.setItem(SESSION_KEY, username);
  if (remember) {
    localStorage.setItem(REMEMBER_KEY, username);
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
}

/* ─── page ─────────────────────────────────────────────────── */
export default function StudentLoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");

  /* ── already logged in? ── */
  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBER_KEY);
    const session = sessionStorage.getItem(SESSION_KEY);
    if (remembered || session) {
      router.replace("/student/dashboard");
    }
  }, [router]);

  return (
    <main className="min-h-dvh text-slate-900">
      {/* GRADIENT HEADER */}
      <div className="ia-header px-6 py-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white">
          🌿 BioSpark
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Welcome to BioSpark
        </h1>
        <p className="mt-2 text-sm text-white/80">
          Your biology mastery adventure starts here.
        </p>
      </div>

      {/* CARD */}
      <div className="mx-auto -mt-4 max-w-md px-4 pb-16">
        <div className="ia-card p-0 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`flex-1 py-4 text-sm font-semibold transition ${
                tab === "login"
                  ? "border-b-2 border-blue-600 text-blue-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={`flex-1 py-4 text-sm font-semibold transition ${
                tab === "signup"
                  ? "border-b-2 border-blue-600 text-blue-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="p-6">
            {tab === "login" ? (
              <LoginForm onSwitchToSignup={() => setTab("signup")} />
            ) : (
              <SignupForm onSwitchToLogin={() => setTab("login")} />
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Need help?{" "}
          <Link href="/assessment" className="font-semibold text-blue-600 hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}

/* ─── login form ────────────────────────────────────────────── */
function LoginForm({ onSwitchToSignup }: { onSwitchToSignup: () => void }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const users = loadUsers();
    const match = users.find(
      (u) => u.username === username.trim() && u.password === password,
    );

    if (!match) {
      setError("Username or password is incorrect. Please try again.");
      setLoading(false);
      return;
    }

    saveSession(match.username, remember);
    router.push("/student/dashboard");
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="login-username">
          Username
        </label>
        <input
          ref={usernameRef}
          id="login-username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Enter your username"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="login-password">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-blue-600"
          />
          Remember me
        </label>
        <button
          type="button"
          onClick={() => alert("Please ask your teacher to reset your password.")}
          className="text-xs font-semibold text-blue-600 hover:underline"
        >
          Forgot password?
        </button>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="ia-btn-primary w-full justify-center py-3">
        {loading ? "Logging in…" : "Log In"}
      </button>

      <p className="text-center text-sm text-slate-500">
        New to BioSpark?{" "}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-semibold text-blue-600 hover:underline"
        >
          Sign up here
        </button>
      </p>
    </form>
  );
}

/* ─── signup form ───────────────────────────────────────────── */
function SignupForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const firstNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstNameRef.current?.focus();
  }, []);

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const uname = username.trim();
    const pwd = password;
    const cc = classCode.trim().toUpperCase();

    if (uname.length < 3 || uname.length > 30) {
      setError("Username must be 3–30 characters.");
      return;
    }
    if (pwd.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const users = loadUsers();
    if (users.some((u) => u.username === uname)) {
      setError("That username is already taken. Pick a different one!");
      return;
    }

    const newUser: StoredUser = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      classCode: cc,
      username: uname,
      password: pwd,
    };
    saveUsers([...users, newUser]);
    saveSession(uname, false);

    setLoading(true);
    setSuccess(true);

    setTimeout(() => {
      router.push("/student/dashboard");
    }, WELCOME_SCREEN_DURATION_MS);
  }

  if (success) {
    return (
      <div className="py-6 text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">
          Welcome to BioSpark, {firstName}!
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Your account is ready. Get ready to explore biology like never before!
        </p>
        <p className="mt-4 text-xs text-slate-400">Taking you to your dashboard…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="signup-firstname">
            First name
          </label>
          <input
            ref={firstNameRef}
            id="signup-firstname"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            placeholder="Alex"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="signup-lastname">
            Last name
          </label>
          <input
            id="signup-lastname"
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            placeholder="Rivera"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="signup-classcode">
          Class code{" "}
          <span className="font-normal text-slate-400">(from your teacher)</span>
        </label>
        <input
          id="signup-classcode"
          type="text"
          value={classCode}
          onChange={(e) => setClassCode(e.target.value)}
          required
          placeholder="e.g. BIO101"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-mono text-slate-900 uppercase placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="signup-username">
          Pick a username
        </label>
        <input
          id="signup-username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="e.g. alexrivera9"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="signup-password">
          Pick a password
        </label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="At least 6 characters"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="ia-btn-primary w-full justify-center py-3">
        Create my account
      </button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-blue-600 hover:underline"
        >
          Log in here
        </button>
      </p>
    </form>
  );
}
