"use client";

import { useEffect, useRef } from "react";

type BottleDiagramProps = {
  className?: string;
  width?: number;
};

export function BottleDiagram({ className, width = 200 }: BottleDiagramProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cricket = root.querySelector<SVGGElement>("#cricket");
    if (!cricket) return;

    const motion = cricket.animate(
      [
        { transform: "translate(0px, 0px) rotate(0deg)", offset: 0 },
        { transform: "translate(2px, -8px) rotate(-6deg)", offset: 0.25 },
        { transform: "translate(4px, -12px) rotate(0deg)", offset: 0.5 },
        { transform: "translate(2px, -6px) rotate(4deg)", offset: 0.75 },
        { transform: "translate(0px, 0px) rotate(0deg)", offset: 1 },
      ],
      {
        duration: 2200,
        iterations: Number.POSITIVE_INFINITY,
        easing: "ease-in-out",
      },
    );

    return () => {
      motion.cancel();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{ width, maxWidth: "100%", background: "#0d1e2c" }}
      aria-label="Closed bottle ecosystem diagram aligned to TEKS B.12A and B.12B"
      role="img"
    >
      <style>{`
        .bs-bottle text { font-family: Outfit, sans-serif; fill: #d6f6ec; }
        .bs-bottle .mono { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; }

        @keyframes gentleSway {
          0%, 100% { transform: rotate(-1.2deg); }
          50% { transform: rotate(1.2deg); }
        }

        @keyframes inchworm {
          0% { transform: translateX(0px) scaleX(1); }
          20% { transform: translateX(2px) scaleX(1.06); }
          40% { transform: translateX(4px) scaleX(0.95); }
          60% { transform: translateX(6px) scaleX(1.05); }
          80% { transform: translateX(8px) scaleX(0.96); }
          100% { transform: translateX(10px) scaleX(1); }
        }

        @keyframes fishDrift {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(8px) translateY(-2px); }
        }

        @keyframes bubbleUp {
          0% { transform: translateY(0px); opacity: 0.15; }
          40% { opacity: 0.55; }
          100% { transform: translateY(-26px); opacity: 0; }
        }

        @keyframes evapUp {
          0% { transform: translateY(0px) scale(1); opacity: 0.2; }
          45% { opacity: 0.55; }
          100% { transform: translateY(-34px) scale(0.72); opacity: 0; }
        }

        .bs-bottle .plant-sway {
          transform-origin: 78px 160px;
          animation: gentleSway 3.6s ease-in-out infinite;
        }

        .bs-bottle .superworm {
          transform-origin: 88px 238px;
          animation: inchworm 2.8s ease-in-out infinite alternate;
        }

        .bs-bottle .fish {
          transform-origin: 78px 360px;
          animation: fishDrift 4.2s ease-in-out infinite;
        }

        .bs-bottle .bubble-1 { animation: bubbleUp 2.1s ease-in infinite; }
        .bs-bottle .bubble-2 { animation: bubbleUp 2.8s ease-in infinite 0.4s; }
        .bs-bottle .bubble-3 { animation: bubbleUp 2.4s ease-in infinite 0.9s; }

        .bs-bottle .evap-1 { animation: evapUp 2.3s ease-out infinite; }
        .bs-bottle .evap-2 { animation: evapUp 2.8s ease-out infinite 0.7s; }
        .bs-bottle .evap-3 { animation: evapUp 3.1s ease-out infinite 1.1s; }
      `}</style>

      <svg
        className="bs-bottle"
        viewBox="0 0 260 520"
        width="100%"
        height="auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="outerClip">
            <path d="M90 42 H120 C122 42 124 44 124 46 V66 C124 73 127 81 132 88 C145 105 150 126 150 150 V427 C150 451 130 470 105 470 C80 470 60 451 60 427 V150 C60 126 65 105 78 88 C83 81 86 73 86 66 V46 C86 44 88 42 90 42 Z" />
          </clipPath>
        </defs>

        <rect x="0" y="0" width="260" height="520" fill="#0d1e2c" />

        <g>
          <rect
            x="91"
            y="22"
            width="28"
            height="14"
            rx="3"
            fill="#083a3b"
            stroke="#00d4aa"
            strokeWidth="2"
          />
          <path
            d="M90 42 H120 C122 42 124 44 124 46 V66 C124 73 127 81 132 88 C145 105 150 126 150 150 V427 C150 451 130 470 105 470 C80 470 60 451 60 427 V150 C60 126 65 105 78 88 C83 81 86 73 86 66 V46 C86 44 88 42 90 42 Z"
            fill="none"
            stroke="#00d4aa"
            strokeWidth="3"
          />
        </g>

        <g clipPath="url(#outerClip)">
          <rect x="60" y="96" width="90" height="118" fill="#133e2a" />
          <rect x="60" y="214" width="90" height="36" fill="#132b20" />
          <rect x="60" y="250" width="90" height="88" fill="#0f2030" />
          <rect x="60" y="338" width="90" height="132" fill="#123f4f" />

          <path
            d="M70 214 Q105 176 140 214 L140 248 Q105 272 70 248 Z"
            fill="#6a3d17"
            stroke="#c8841a"
            strokeWidth="1.5"
            opacity="0.9"
          />

          <line
            x1="104"
            y1="243"
            x2="104"
            y2="379"
            stroke="#d4c44a"
            strokeWidth="2"
            strokeDasharray="5 4"
            opacity="0.95"
          />

          <ellipse
            cx="86"
            cy="452"
            rx="20"
            ry="8"
            fill="#4b5a63"
            opacity="0.9"
          />
          <ellipse
            cx="110"
            cy="450"
            rx="19"
            ry="8"
            fill="#596974"
            opacity="0.95"
          />
          <ellipse
            cx="129"
            cy="454"
            rx="14"
            ry="6"
            fill="#657985"
            opacity="0.9"
          />

          <g className="plant-sway">
            <line
              x1="84"
              y1="214"
              x2="84"
              y2="170"
              stroke="#4ade80"
              strokeWidth="2"
            />
            <path
              d="M84 188 C72 182 72 170 84 166"
              fill="none"
              stroke="#4ade80"
              strokeWidth="2"
            />
            <path
              d="M84 176 C97 172 98 160 86 156"
              fill="none"
              stroke="#4ade80"
              strokeWidth="2"
            />

            <line
              x1="101"
              y1="214"
              x2="101"
              y2="162"
              stroke="#5be38f"
              strokeWidth="2"
            />
            <path
              d="M101 188 C112 182 113 171 103 165"
              fill="none"
              stroke="#5be38f"
              strokeWidth="2"
            />
            <path
              d="M101 176 C90 171 89 160 99 154"
              fill="none"
              stroke="#5be38f"
              strokeWidth="2"
            />
          </g>

          <g className="superworm" transform="translate(0,0)">
            <path
              d="M76 236 C80 231 88 231 92 236 C96 241 104 241 108 236"
              fill="none"
              stroke="#d9a14a"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="108" cy="236" r="2" fill="#1b1b1b" />
          </g>

          <g id="cricket" transform="translate(0,0)">
            <ellipse cx="126" cy="231" rx="6" ry="4" fill="#6e7d2a" />
            <circle cx="132" cy="229" r="2.1" fill="#6e7d2a" />
            <line
              x1="122"
              y1="234"
              x2="117"
              y2="240"
              stroke="#8ea33a"
              strokeWidth="1.3"
            />
            <line
              x1="128"
              y1="234"
              x2="132"
              y2="241"
              stroke="#8ea33a"
              strokeWidth="1.3"
            />
            <line
              x1="133"
              y1="227"
              x2="138"
              y2="222"
              stroke="#9cb545"
              strokeWidth="1"
            />
          </g>

          <g className="fish">
            <ellipse cx="95" cy="370" rx="9" ry="5" fill="#5ec5ff" />
            <polygon points="86,370 79,365 79,375" fill="#5ec5ff" />
            <circle cx="98" cy="369" r="1" fill="#06263a" />
          </g>

          <g opacity="0.9">
            <path
              d="M70 427 C75 420 80 418 84 422"
              fill="none"
              stroke="#3ccf8e"
              strokeWidth="2"
            />
            <path
              d="M121 440 C126 430 132 428 138 432"
              fill="none"
              stroke="#3ccf8e"
              strokeWidth="2"
            />
            <path
              d="M92 438 C97 430 102 428 106 432"
              fill="none"
              stroke="#3ccf8e"
              strokeWidth="2"
            />
          </g>

          <g>
            <circle
              className="bubble-1"
              cx="114"
              cy="410"
              r="2.4"
              fill="#bcecff"
            />
            <circle
              className="bubble-2"
              cx="121"
              cy="424"
              r="1.9"
              fill="#c7f0ff"
            />
            <circle
              className="bubble-3"
              cx="88"
              cy="416"
              r="2.1"
              fill="#bcecff"
            />
          </g>

          <g>
            <ellipse
              className="evap-1"
              cx="94"
              cy="336"
              rx="2.2"
              ry="3.2"
              fill="#9ae6ff"
            />
            <ellipse
              className="evap-2"
              cx="107"
              cy="338"
              rx="2"
              ry="3"
              fill="#b3ecff"
            />
            <ellipse
              className="evap-3"
              cx="121"
              cy="337"
              rx="1.8"
              ry="2.8"
              fill="#9ae6ff"
            />
          </g>
        </g>

        <g stroke="#1f4d59" strokeWidth="1.4" fill="none" opacity="0.85">
          <path d="M151 152 H194" />
          <path d="M151 230 H194" />
          <path d="M151 312 H194" />
          <path d="M151 380 H194" />
        </g>

        <g>
          <text x="198" y="156" fontSize="12" fill="#4ade80" className="mono">
            Plants
          </text>
          <text x="198" y="234" fontSize="12" fill="#c8841a" className="mono">
            Soil
          </text>
          <text x="198" y="316" fontSize="12" fill="#d4c44a" className="mono">
            Cotton String
          </text>
          <text x="198" y="384" fontSize="12" fill="#38bdf8" className="mono">
            Water
          </text>
        </g>

        <g>
          <rect
            x="70"
            y="486"
            width="114"
            height="20"
            rx="10"
            fill="#0c2f3d"
            stroke="#00d4aa"
            strokeWidth="1.5"
          />
          <text
            x="127"
            y="500"
            textAnchor="middle"
            fontSize="10"
            fill="#7ee9cf"
            className="mono"
          >
            TEKS B.12A · B.12B
          </text>
        </g>
      </svg>
    </div>
  );
}
