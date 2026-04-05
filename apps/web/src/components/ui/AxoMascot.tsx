"use client"
// Client component: AxoMascot
// Inline SVG axolotl mascot with CSS idle animations
// Props: size (number, default 120), className (string, optional)
// Animations: breathing body pulse, gill flutter, tail sway, eye blink
// All animations loop infinitely, offsets so they never peak simultaneously
// No external dependencies — pure SVG + CSS keyframes
// Transparent background — works on any surface color

interface AxoMascotProps {
  size?: number;
  className?: string;
}

export function AxoMascot({ size = 120, className }: AxoMascotProps) {
  // viewBox is 200x180, so height = size * (180/200)
  const height = Math.round(size * 0.9);

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 200 180"
      role="img"
      aria-label="Axo the axolotl mascot"
      className={className}
      style={{ overflow: "visible" }}
    >
      <style>{`
        @keyframes axo-breathe {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.02); }
        }
        @keyframes axo-gill-left {
          0%, 100% { transform: rotate(0deg); }
          50%       { transform: rotate(-8deg); }
        }
        @keyframes axo-gill-right {
          0%, 100% { transform: rotate(0deg); }
          50%       { transform: rotate(8deg); }
        }
        @keyframes axo-tail {
          0%, 100% { transform: rotate(0deg); }
          50%       { transform: rotate(6deg); }
        }
        @keyframes axo-blink {
          0%, 90%, 100% { transform: scaleY(0); }
          92%, 98%      { transform: scaleY(1); }
        }
        #axo-body {
          animation: axo-breathe 2.5s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        #axo-gills-left {
          animation: axo-gill-left 1.8s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: 84px 90px;
        }
        #axo-gills-right {
          animation: axo-gill-right 1.8s ease-in-out infinite 0.2s;
          transform-box: fill-box;
          transform-origin: 116px 90px;
        }
        #axo-tail {
          animation: axo-tail 3s ease-in-out infinite 0.7s;
          transform-box: fill-box;
          transform-origin: 65px 118px;
        }
        #axo-eyelid-left {
          animation: axo-blink 4s ease-in-out infinite 1s;
          transform-box: fill-box;
          transform-origin: center;
        }
        #axo-eyelid-right {
          animation: axo-blink 4s ease-in-out infinite 1.1s;
          transform-box: fill-box;
          transform-origin: center;
        }
        @media (prefers-reduced-motion: reduce) {
          #axo-body, #axo-gills-left, #axo-gills-right,
          #axo-tail, #axo-eyelid-left, #axo-eyelid-right {
            animation: none;
          }
        }
      `}</style>

      {/* ── Tail ── */}
      <g id="axo-tail">
        <path
          d="M 68 118 C 50 112, 28 108, 22 120 C 16 132, 34 144, 52 138 C 60 135, 65 128, 68 118 Z"
          fill="#5BBFB5"
          stroke="#3D2B1F"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </g>

      {/* ── Body + Belly ── */}
      <g id="axo-body">
        {/* Main body */}
        <ellipse
          cx="110"
          cy="115"
          rx="52"
          ry="40"
          fill="#5BBFB5"
          stroke="#3D2B1F"
          strokeWidth="2"
        />
        {/* Belly overlay */}
        <ellipse
          cx="114"
          cy="122"
          rx="34"
          ry="24"
          fill="#F5D5B8"
          stroke="none"
        />
        {/* Head */}
        <ellipse
          cx="110"
          cy="82"
          rx="38"
          ry="34"
          fill="#5BBFB5"
          stroke="#3D2B1F"
          strokeWidth="2"
        />
        {/* Head-body join cover (blends head into body) */}
        <ellipse
          cx="110"
          cy="103"
          rx="36"
          ry="14"
          fill="#5BBFB5"
          stroke="none"
        />

        {/* ── Legs ── */}
        <g id="axo-legs">
          {/* Front-left leg */}
          <rect x="76" y="128" width="13" height="22" rx="6" ry="6"
            fill="#5BBFB5" stroke="#3D2B1F" strokeWidth="1.5" />
          {/* Front-right leg */}
          <rect x="96" y="130" width="13" height="22" rx="6" ry="6"
            fill="#5BBFB5" stroke="#3D2B1F" strokeWidth="1.5" />
          {/* Rear-left leg */}
          <rect x="118" y="133" width="13" height="20" rx="6" ry="6"
            fill="#5BBFB5" stroke="#3D2B1F" strokeWidth="1.5" />
          {/* Rear-right leg */}
          <rect x="136" y="130" width="13" height="22" rx="6" ry="6"
            fill="#5BBFB5" stroke="#3D2B1F" strokeWidth="1.5" />
        </g>
      </g>

      {/* ── Gills Left ── */}
      <g id="axo-gills-left">
        {/* plume 1 — leftmost */}
        <ellipse cx="74" cy="68" rx="6" ry="16"
          transform="rotate(-40 74 90)"
          fill="#F0907A" stroke="#C86450" strokeWidth="1" />
        {/* plume 2 — middle */}
        <ellipse cx="78" cy="58" rx="6" ry="16"
          transform="rotate(-20 78 90)"
          fill="#F0907A" stroke="#C86450" strokeWidth="1" />
        {/* plume 3 — rightmost of left set */}
        <ellipse cx="84" cy="55" rx="6" ry="16"
          transform="rotate(-5 84 90)"
          fill="#F0907A" stroke="#C86450" strokeWidth="1" />
      </g>

      {/* ── Gills Right ── */}
      <g id="axo-gills-right">
        {/* plume 1 — leftmost of right set */}
        <ellipse cx="116" cy="55" rx="6" ry="16"
          transform="rotate(5 116 90)"
          fill="#F0907A" stroke="#C86450" strokeWidth="1" />
        {/* plume 2 — middle */}
        <ellipse cx="122" cy="58" rx="6" ry="16"
          transform="rotate(20 122 90)"
          fill="#F0907A" stroke="#C86450" strokeWidth="1" />
        {/* plume 3 — rightmost */}
        <ellipse cx="126" cy="68" rx="6" ry="16"
          transform="rotate(40 126 90)"
          fill="#F0907A" stroke="#C86450" strokeWidth="1" />
      </g>

      {/* ── Eyes ── */}
      <g id="axo-eyes">
        {/* Left eye */}
        <g>
          <circle cx="97" cy="82" r="10" fill="#3D2B1F" />
          <circle cx="100" cy="79" r="3.5" fill="white" />
          {/* Eyelid */}
          <rect id="axo-eyelid-left" x="87" y="72" width="20" height="10" rx="4"
            fill="#5BBFB5" />
        </g>
        {/* Right eye */}
        <g>
          <circle cx="123" cy="82" r="10" fill="#3D2B1F" />
          <circle cx="126" cy="79" r="3.5" fill="white" />
          {/* Eyelid */}
          <rect id="axo-eyelid-right" x="113" y="72" width="20" height="10" rx="4"
            fill="#5BBFB5" />
        </g>
        {/* Blush marks */}
        <circle cx="90" cy="93" r="7" fill="#F4A0A0" opacity="0.5" />
        <circle cx="130" cy="93" r="7" fill="#F4A0A0" opacity="0.5" />
        {/* Smile */}
        <path
          d="M 103 99 Q 110 104 117 99"
          fill="none"
          stroke="#3D2B1F"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
