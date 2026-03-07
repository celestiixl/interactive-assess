"use client";

export default function PopulationGeneticsPreview() {
  return (
    <div className="mt-3 rounded-2xl border border-bs-border bg-bs-raised p-3">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-bs-text-muted">
        Preview
      </div>

      <svg
        viewBox="0 0 280 110"
        className="h-28 w-full rounded-xl border border-bs-border-soft bg-bs-surface transition-transform duration-500 ease-out hover:scale-[1.01]"
        role="img"
        aria-label="Animated preview of allele frequency changing across generations"
      >
        <rect x="0" y="0" width="280" height="110" fill="rgba(13,30,44,0.35)" />

        <line
          x1="20"
          y1="88"
          x2="260"
          y2="88"
          stroke="rgba(154,188,176,0.35)"
          strokeWidth="1"
        />
        <line
          x1="20"
          y1="20"
          x2="20"
          y2="88"
          stroke="rgba(154,188,176,0.35)"
          strokeWidth="1"
        />

        <polyline
          points="20,74 50,68 80,58 110,64 140,52 170,47 200,40 230,36 260,30"
          fill="none"
          stroke="var(--bs-teal)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 5px rgba(0,212,170,0.7))" }}
          strokeDasharray="320"
          strokeDashoffset="320"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="320"
            to="0"
            dur="2.8s"
            begin="0s"
            repeatCount="indefinite"
          />
        </polyline>

        <circle cx="20" cy="74" r="4" fill="var(--bs-amber)">
          <animate
            attributeName="cx"
            values="20;260;20"
            dur="2.8s"
            begin="0s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values="74;68;58;64;52;47;40;36;30;74"
            keyTimes="0;0.111;0.222;0.333;0.444;0.555;0.666;0.777;0.888;1"
            dur="2.8s"
            begin="0s"
            repeatCount="indefinite"
          />
        </circle>

        <text
          x="24"
          y="16"
          fill="var(--bs-text-sub)"
          fontSize="10"
          fontFamily="JetBrains Mono, monospace"
        >
          p(A)
        </text>
        <text
          x="224"
          y="102"
          fill="var(--bs-text-muted)"
          fontSize="10"
          fontFamily="JetBrains Mono, monospace"
        >
          generations
        </text>
      </svg>
    </div>
  );
}
