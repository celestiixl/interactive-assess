"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import FormHelperText from "@mui/joy/FormHelperText";
import { useTeacherAuth } from "@/lib/teacherAuth";
import { BlurText, SpotlightCard, ShinyText } from "@/components/ui";

export default function TeacherLoginPage() {
  const { login } = useTeacherAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const result = login(email, password);
    if (!result.ok) {
      setError(result.error ?? "Login failed.");
      return;
    }

    startTransition(() => {
      router.replace("/teacher/dashboard");
    });
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Gradient header band */}
      <div className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/30 bg-white/20 text-sm font-bold text-white">
              BS
            </div>
            <div>
              <div className="text-sm font-semibold text-white">BioSpark</div>
              <div className="text-xs text-white/70">
                STAAR Biology • Practice & Mastery
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Centred login card */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <BlurText
              text="Teacher Sign In"
              className="text-3xl font-semibold tracking-tight text-slate-900"
              delay={80}
              animateBy="words"
            />
            <p className="mt-2 text-slate-600">
              Access your dashboard, item bank, and AI grading tools.
            </p>
          </div>

          <SpotlightCard
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg"
            spotlightColor="rgba(14,165,233,0.14)"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <FormControl error={!!error}>
                <FormLabel
                  sx={{ color: "rgba(241,245,249,0.92)", fontWeight: 600 }}
                >
                  Email address
                </FormLabel>
                <Input
                  type="email"
                  placeholder="teacher@biospark.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  size="md"
                  sx={{ borderRadius: "14px" }}
                />
              </FormControl>

              <FormControl error={!!error}>
                <FormLabel
                  sx={{ color: "rgba(241,245,249,0.92)", fontWeight: 600 }}
                >
                  Password
                </FormLabel>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  size="md"
                  sx={{ borderRadius: "14px" }}
                />
                {error && (
                  <FormHelperText sx={{ color: "#fda4af", fontWeight: 500 }}>
                    {error}
                  </FormHelperText>
                )}
              </FormControl>

              <Button
                type="submit"
                variant="solid"
                color="primary"
                size="lg"
                loading={isPending}
                fullWidth
                sx={{
                  borderRadius: "14px",
                  background: "linear-gradient(to right, #0ea5e9, #2563eb)",
                  fontWeight: 700,
                  mt: 1,
                  "&:hover": {
                    background: "linear-gradient(to right, #0284c7, #1d4ed8)",
                  },
                }}
              >
                Sign in to BioSpark
              </Button>
            </form>

            {/* Demo credentials hint */}
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm">
              <div className="font-semibold text-blue-800">
                Demo credentials
              </div>
              <div className="mt-1 text-blue-700">
                <span className="font-medium">Email:</span> teacher@biospark.app
              </div>
              <div className="text-blue-700">
                <span className="font-medium">Password:</span> biospark
              </div>
            </div>
          </SpotlightCard>

          <p className="mt-6 text-center text-sm text-slate-500">
            Student?{" "}
            <Link
              href="/student/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
