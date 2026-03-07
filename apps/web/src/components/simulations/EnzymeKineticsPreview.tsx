export default function EnzymeKineticsPreview() {
  return (
    <div className="mt-3 rounded-2xl border border-bs-border bg-bs-raised p-3">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-bs-text-muted">
        Preview
      </div>
      <svg
        viewBox="0 0 280 110"
        className="h-28 w-full rounded-xl border border-bs-border-soft bg-bs-surface transition-transform duration-500 ease-out hover:scale-[1.01]"
        role="img"
        aria-label="Looping preview of enzyme lock-and-key interactions"
      >
        <rect x="0" y="0" width="280" height="110" fill="rgba(13,30,44,0.45)" />

        <circle
          cx="86"
          cy="56"
          r="26"
          fill="rgba(26,49,72,0.95)"
          stroke="var(--bs-teal)"
          strokeWidth="2.5"
        />

        <path
          d="M 104 56 A 16 16 0 0 1 86 72 A 16 16 0 0 1 86 40"
          fill="none"
          stroke="var(--bs-surface)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        <path
          d="M 214 42 L 194 56 L 214 70"
          fill="rgba(245,166,35,0.35)"
          stroke="var(--bs-amber)"
          strokeWidth="2"
          strokeLinejoin="round"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0;-78 0;-78 0;0 0"
            keyTimes="0;0.32;0.68;1"
            dur="3.2s"
            repeatCount="indefinite"
          />
        </path>

        <circle cx="120" cy="56" r="5" fill="var(--bs-success)">
          <animate
            attributeName="opacity"
            values="0;0;0.95;0"
            keyTimes="0;0.35;0.62;1"
            dur="3.2s"
            repeatCount="indefinite"
          />
        </circle>

        <text
          x="18"
          y="20"
          fill="var(--bs-text-sub)"
          fontSize="10"
          fontFamily="Outfit, sans-serif"
        >
          lock-and-key binding loop
        </text>
      </svg>
    </div>
  );
}
