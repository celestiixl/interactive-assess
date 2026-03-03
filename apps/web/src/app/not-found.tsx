import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Gradient header */}
      <div className="ia-header w-full">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center gap-3 px-6 py-5">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/30 bg-white/20 text-sm font-bold text-white">
            BS
          </div>
          <div>
            <div className="text-sm font-semibold text-white">BioSpark</div>
            <div className="text-xs text-white/70">
              STAAR Biology • Practice &amp; Mastery
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="ia-card w-full max-w-md p-10 text-center">
          {/* 404 badge */}
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-linear-to-br from-sky-500 to-indigo-600 text-3xl font-bold text-white shadow-lg">
            404
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Specimen not found
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            This page doesn&apos;t exist in the BioSpark ecosystem. It may have
            been moved, deleted, or you may have followed a broken link.
          </p>

          {/* Accent pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="ia-pill" data-tone="teal">
              <span className="ia-dot" data-tone="teal" />
              Biology
            </span>
            <span className="ia-pill" data-tone="amber">
              <span className="ia-dot" data-tone="amber" />
              STAAR
            </span>
            <span className="ia-pill" data-tone="violet">
              <span className="ia-dot" data-tone="violet" />
              Practice
            </span>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className="ia-btn-primary">
              Back to home
            </Link>
            <Link href="/assessment" className="ia-btn">
              Go to Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
