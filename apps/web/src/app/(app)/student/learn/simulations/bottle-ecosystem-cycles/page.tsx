"use client";

import { useState, useRef } from "react";
import { BackLink } from "@/components/nav/BackLink";
import { PageBanner, PageContent } from "@/components/ui";
import StudentFloatingDock from "@/components/student/StudentFloatingDock";

// ── Types ──────────────────────────────────────────────────────────────────

interface AssemblyState {
  bottle1Cut: boolean;
  bottle2Cut: boolean;
  topFlipped: boolean;
  assembled: boolean;
  stringThreaded: boolean;
}

interface BottleOrganism {
  id: string;
  name: string;
  role: "producer" | "consumer" | "decomposer";
  zone: "terrestrial" | "aquatic";
  svgKey: string;
  emoji: string;
  color: string;
}

type CycleType = "water" | "carbon" | "nitrogen";

// CycleStep: id, cycleType ("water"|"carbon"|"nitrogen"), label, description, animationKey string
// Documented type for future cycle content authoring (not yet instantiated in this file)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface CycleStep {
  id: string;
  cycleType: CycleType;
  label: string;
  description: string;
  animationKey: string;
}

interface StudentPrediction {
  sceneId: string;
  questionText: string;
  studentAnswer: string;
  wasCorrect: boolean | null;
}

interface BottleLabState {
  assemblyState: AssemblyState;
  organisms: BottleOrganism[];
  placedOrganisms: string[];
  completedScenes: string[];
  predictions: StudentPrediction[];
  currentScene: number;
  cycleScore: Record<string, number>;
}

// ── Static data ─────────────────────────────────────────────────────────────

const ALL_ORGANISMS: BottleOrganism[] = [
  { id: "plant", name: "Aquatic Plant", role: "producer", zone: "aquatic", svgKey: "plant", emoji: "🌿", color: "#22c55e" },
  { id: "fish", name: "Fish", role: "consumer", zone: "aquatic", svgKey: "fish", emoji: "🐟", color: "#60a5fa" },
  { id: "cricket", name: "Cricket", role: "consumer", zone: "terrestrial", svgKey: "cricket", emoji: "🦗", color: "#a78bfa" },
  { id: "worm", name: "Worm", role: "decomposer", zone: "terrestrial", svgKey: "worm", emoji: "🪱", color: "#f59e0b" },
  { id: "seeds", name: "Seeds", role: "producer", zone: "terrestrial", svgKey: "seeds", emoji: "🌱", color: "#4ade80" },
];

const CYCLE_COLORS: Record<CycleType, string> = {
  water: "#60a5fa",
  carbon: "#22c55e",
  nitrogen: "#f59e0b",
};

// ── CER scoring constants ────────────────────────────────────────────────
const DEFAULT_CER_MAX_SCORE = 3; // matches the number of rubric criteria
const CER_PROFICIENCY_THRESHOLD = 0.66; // 66% — minimum fraction to earn "proficient" feedback

const SCENE_META = [
  { id: "assemble", label: "Cut & Assemble", icon: "✂️", cycleType: null },
  { id: "organisms", label: "Add Organisms", icon: "🧬", cycleType: null },
  { id: "water", label: "Water Cycle", icon: "💧", cycleType: "water" as CycleType },
  { id: "carbon", label: "Carbon Cycle", icon: "🌿", cycleType: "carbon" as CycleType },
  { id: "nitrogen", label: "Nitrogen Cycle", icon: "🪱", cycleType: "nitrogen" as CycleType },
  { id: "reflect", label: "Reflect & Connect", icon: "✍️", cycleType: null },
];

// ── Shake CSS injection ───────────────────────────────────────────────────

const SHAKE_KEYFRAMES = `
@keyframes bel-shake {
  0%,100% { transform: translateX(0); }
  15%     { transform: translateX(-8px); }
  35%     { transform: translateX(8px); }
  55%     { transform: translateX(-6px); }
  75%     { transform: translateX(6px); }
}
@keyframes bel-flash-red {
  0%,100% { box-shadow: none; }
  30%     { box-shadow: 0 0 0 3px #ef444488; }
  60%     { box-shadow: 0 0 0 3px #ef4444cc; }
}
.bel-shake { animation: bel-shake 0.45s ease, bel-flash-red 0.45s ease; }

@keyframes bel-scalpel-progress {
  from { width: 0; }
}
@keyframes bel-cut-split {
  0%   { opacity:1; transform: translateY(0); }
  100% { opacity:0.6; transform: translateY(4px); }
}
@keyframes bel-flip-in {
  0%   { transform: scaleY(1) translateY(-20px); opacity: 0; }
  50%  { transform: scaleY(-1) translateY(0);  opacity: 1; }
  100% { transform: scaleY(1) translateY(0);   opacity: 1; }
}
`;

// ── Assembly SVG (Scene 0) ────────────────────────────────────────────────

interface BottleAssemblySVGProps {
  assembly: AssemblyState;
}

function BottleAssemblySVG({ assembly }: BottleAssemblySVGProps) {
  const { bottle1Cut, bottle2Cut, assembled, stringThreaded } = assembly;

  // After full assembly: wide 2-liter proportions — ONE outer silhouette + interior neck
  // cx=80, body half=65 (130px total), viewBox 160×330
  if (assembled) {
    // Outer: straight walls x=15/x=145, Q-rounded base at y=295→311
    const outerPath = "M 15 10 L 15 295 Q 80 311 145 295 L 145 10";
    // Interior neck: fast Q-bezier fan-in from outer walls (x=15/145) at y=105
    // → neck (x=70/90) at y=128 → cap rect y=140 (20px wide, 16px tall)
    const intNeck =
      "M 15 105 Q 15 118 70 128 L 70 140 L 90 140 L 90 128 Q 145 118 145 105";
    return (
      <svg viewBox="0 0 160 330" width="160" height="330" aria-label="Assembled bottle ecosystem">
        <defs>
          <clipPath id="asse-outer-clip">
            <path d={`${outerPath} Z`} />
          </clipPath>
        </defs>

        {/* ── Zone fills clipped to outer bottle shape ── */}
        {/* Plant air zone: y=10–90 */}
        <rect x="15" y="10"  width="130" height="80"  fill="#f0fdf4" clipPath="url(#asse-outer-clip)" />
        {/* Soil zone: y=90–145 (covers shoulder + neck area) */}
        <rect x="15" y="90"  width="130" height="55"  fill="#b5651d" clipPath="url(#asse-outer-clip)" />
        {/* Soil surface dome */}
        <path d="M 16 90 Q 80 73 144 90" fill="none" stroke="#7c2d12" strokeWidth="1.5" clipPath="url(#asse-outer-clip)" />
        {/* Aquatic air gap: y=157–169 */}
        <rect x="15" y="157" width="130" height="12"  fill="#f0f9ff" clipPath="url(#asse-outer-clip)" />
        {/* Water zone: y=169–295 */}
        <rect x="15" y="169" width="130" height="126" fill="#add8e6" clipPath="url(#asse-outer-clip)" />
        {/* Gravel ellipses at base */}
        <ellipse cx="45"  cy="286" rx="14" ry="6" fill="#94a3b8" opacity="0.6" clipPath="url(#asse-outer-clip)" />
        <ellipse cx="80"  cy="284" rx="16" ry="6" fill="#94a3b8" opacity="0.6" clipPath="url(#asse-outer-clip)" />
        <ellipse cx="116" cy="287" rx="13" ry="6" fill="#94a3b8" opacity="0.6" clipPath="url(#asse-outer-clip)" />
        <ellipse cx="62"  cy="292" rx="11" ry="5" fill="#94a3b8" opacity="0.6" clipPath="url(#asse-outer-clip)" />
        <ellipse cx="100" cy="291" rx="12" ry="5" fill="#94a3b8" opacity="0.6" clipPath="url(#asse-outer-clip)" />

        {/* Cotton string from cap down through water to gravel */}
        {stringThreaded && (
          <line x1="80" y1="156" x2="80" y2="288" stroke="#e8c84a" strokeWidth="2" strokeDasharray="4,3" />
        )}

        {/* ── Outer silhouette ── */}
        <path d={outerPath} fill="none" stroke="#64748b" strokeWidth="1.8" />
        {/* Dashed top cut edge */}
        <line x1="15" y1="10" x2="145" y2="10" stroke="#e53e3e" strokeWidth="1.5" strokeDasharray="5,3" />

        {/* ── Interior neck: fast-flaring Q-bezier ── */}
        <path d={intNeck} fill="none" stroke="#64748b" strokeWidth="1.5" />
        {/* Cap rect at waist: 20px wide, 16px tall */}
        <rect x="70" y="140" width="20" height="16" fill="#e5e7eb" stroke="#64748b" strokeWidth="1.5" />

        {/* ── Zone labels ── */}
        <text x="80" y="54"  textAnchor="middle" fontSize="8" fill="#4ade80" fontFamily="Outfit,sans-serif">PLANTS</text>
        <text x="80" y="118" textAnchor="middle" fontSize="8" fill="#a16207" fontFamily="Outfit,sans-serif">SOIL</text>
        <text x="80" y="225" textAnchor="middle" fontSize="8" fill="#1e40af" fontFamily="Outfit,sans-serif">AQUATIC</text>

        {/* JOINED label */}
        <rect x="50" y="172" width="60" height="13" rx="6" fill="#00d4aa22" />
        <text x="80" y="182" textAnchor="middle" fontSize="7" fill="#00d4aa" fontFamily="Outfit,sans-serif" fontWeight="bold">JOINED ✓</text>
      </svg>
    );
  }

  // ── Pre-assembly: three-column instructional diagram ────────────────────
  // viewBox: 0 0 280 420
  // Col 1 (center x=45):  full Bottle 1, cut line at 35% of body
  // Col 2 (center x=137): full Bottle 2, cut line at 60% of body
  // Col 3 (center x=231): assembly result — inverted top piece, arrow, bottom piece, arrow, label

  // Style constants (per spec)
  const STR = "#64748b";  // bottle outline stroke
  const CUT = "#e53e3e";  // cut line / arrow colour
  const LBL = "#94a3b8";  // bottle label colour

  // 2-liter bottle shape constants (viewBox per-column: ~100px wide, body=90px)
  const bty   = 14;   // y where bottle cap starts
  const cpW   = 11;   // cap half-width   → 22px total
  const nkW   = 8;    // neck half-width  → 16px total
  const bW    = 45;   // body half-width  → 90px total
  const capH  = 10;
  const neckH = 14;
  const shH   = 22;   // shoulder height — short so it fans out fast (2-liter shape)
  const bodyH = 200;
  const baseH = 12;

  // Absolute y positions (same for both full bottles)
  const neckY = bty + capH;         // 24
  const shY   = neckY + neckH;      // 38  (top of shoulder = bottom of neck)
  const bodyY = shY + shH;          // 60  (body starts = bottom of shoulder)
  const baseY = bodyY + bodyH;      // 260
  const btmY  = baseY + baseH;      // 272  (Q-base lowest point)

  // Cut-line absolute y positions
  const cut1Y = bodyY + Math.round(bodyH * 0.35);  // 130
  const cut2Y = bodyY + Math.round(bodyH * 0.60);  // 180

  // Column centre x values — spaced to fit 90px-wide bodies
  const b1cx = 50;
  const b2cx = 150;
  const acx  = 250;

  // Full-bottle outline path — fast Q-bezier shoulders for broad 2-liter fan-out
  function bottlePath(cx: number): string {
    const cL = cx - cpW, cR = cx + cpW;
    const nL = cx - nkW, nR = cx + nkW;
    const bL = cx - bW,  bR = cx + bW;
    return (
      `M ${cL} ${bty} L ${cR} ${bty}` +
      ` L ${cR} ${neckY} L ${nR} ${neckY}` +
      ` L ${nR} ${shY}` +
      ` Q ${nR} ${shY + 10} ${bR} ${bodyY}` +   // right shoulder: fast bezier fan-out
      ` L ${bR} ${baseY}` +
      ` Q ${cx} ${btmY} ${bL} ${baseY}` +
      ` L ${bL} ${bodyY}` +
      ` Q ${nL} ${shY + 10} ${nL} ${shY}` +      // left shoulder: mirrors right, going up
      ` L ${nL} ${neckY} L ${cL} ${neckY}` +
      ` Z`
    );
  }

  // Assembly column geometry (recomputed for 2-liter proportions)
  const topPieceH = cut1Y - bty;       // 116: height of inverted top piece
  const invBodyH  = cut1Y - bodyY;     // 70:  body portion of top piece
  const botBodyH  = baseY - cut2Y;     // 80:  body portion of bottom piece

  const tp_y = bty;  // 14: top of assembled bottle (cut edge)

  // Single assembled bottle in Col 3:
  // Outer walls straight (bW=45), interior neck uses Q-bezier fan-in
  const jctShY  = tp_y + invBodyH;           // 84:  inverted shoulder junction
  const jctNkY  = jctShY + shH;              // 106: neck–shoulder junction
  const jctCpY  = jctNkY + neckH;            // 120: cap–neck junction
  const jctCpBY = tp_y  + topPieceH;         // 130: cap bottom / waist = cut1Y ✓
  const assmBodyEnd = jctCpBY + botBodyH;    // 210: body end
  const assmBtmY    = assmBodyEnd + baseH;   // 222: Q-base lowest point
  const assmLabelY  = assmBtmY + 15;         // 237: label y


  return (
    <svg
      viewBox="0 0 300 295"
      width="300"
      height="295"
      aria-label="Three-column bottle assembly diagram"
    >
      {/* ── COLUMN 1: Bottle 1 ──────────────────────────────────────────── */}
      <text x={b1cx} y="12" textAnchor="middle" fontSize="11" fill={LBL} fontFamily="Outfit,sans-serif">
        Bottle 1
      </text>
      <path
        d={bottlePath(b1cx)}
        fill="none"
        stroke={bottle1Cut ? CUT : STR}
        strokeWidth="1.8"
      />
      {/* Cut line */}
      <line
        x1={b1cx - bW} y1={cut1Y} x2={b1cx + bW} y2={cut1Y}
        stroke={CUT}
        strokeWidth={bottle1Cut ? "2.5" : "1.5"}
        strokeDasharray={bottle1Cut ? undefined : "5,3"}
      />
      <text
        x={b1cx} y={cut1Y - 4}
        textAnchor="middle" fontSize="8" fill={CUT} fontFamily="Outfit,sans-serif"
        fontWeight={bottle1Cut ? "700" : "400"}
      >
        {bottle1Cut ? "✓ cut" : "cut here"}
      </text>

      {/* ── COLUMN 2: Bottle 2 ──────────────────────────────────────────── */}
      <text x={b2cx} y="12" textAnchor="middle" fontSize="11" fill={LBL} fontFamily="Outfit,sans-serif">
        Bottle 2
      </text>
      <path
        d={bottlePath(b2cx)}
        fill="none"
        stroke={bottle2Cut ? CUT : STR}
        strokeWidth="1.8"
      />
      {/* Cut line */}
      <line
        x1={b2cx - bW} y1={cut2Y} x2={b2cx + bW} y2={cut2Y}
        stroke={CUT}
        strokeWidth={bottle2Cut ? "2.5" : "1.5"}
        strokeDasharray={bottle2Cut ? undefined : "5,3"}
      />
      <text
        x={b2cx} y={cut2Y - 4}
        textAnchor="middle" fontSize="8" fill={CUT} fontFamily="Outfit,sans-serif"
        fontWeight={bottle2Cut ? "700" : "400"}
      >
        {bottle2Cut ? "✓ cut" : "cut here"}
      </text>

      {/* ── COLUMN 3: Assembly result (ONE connected assembled bottle) ─────── */}
      <text x={acx} y="12" textAnchor="middle" fontSize="11" fill={LBL} fontFamily="Outfit,sans-serif">
        Assembly
      </text>

      {/* Outer wall: straight sides, rounded base — no pinch on the exterior */}
      <path
        d={
          `M ${acx - bW} ${tp_y}` +
          ` L ${acx - bW} ${assmBodyEnd}` +
          ` Q ${acx} ${assmBtmY} ${acx + bW} ${assmBodyEnd}` +
          ` L ${acx + bW} ${tp_y}`
        }
        fill="none"
        stroke={STR}
        strokeWidth="1.8"
      />
      {/* Dashed cut edge at top (open end of the inverted top piece) */}
      <line
        x1={acx - bW} y1={tp_y} x2={acx + bW} y2={tp_y}
        stroke={CUT} strokeWidth="1.5" strokeDasharray="5,3"
      />

      {/* Interior neck detail: inverted Q-bezier fan-in from outer walls */}
      <path
        d={
          `M ${acx - bW} ${jctShY}` +
          ` Q ${acx - nkW} ${jctShY + 10} ${acx - nkW} ${jctNkY}` +
          ` L ${acx - nkW} ${jctCpY}` +
          ` L ${acx - cpW} ${jctCpY}` +
          ` L ${acx - cpW} ${jctCpBY}` +
          ` L ${acx + cpW} ${jctCpBY}` +
          ` L ${acx + cpW} ${jctCpY}` +
          ` L ${acx + nkW} ${jctCpY}` +
          ` L ${acx + nkW} ${jctNkY}` +
          ` Q ${acx + nkW} ${jctShY + 10} ${acx + bW} ${jctShY}`
        }
        fill="none"
        stroke={STR}
        strokeWidth="1.5"
      />
      {/* Cap rect: physical bottle cap at the interior waist */}
      <rect
        x={acx - cpW} y={jctCpBY} width={cpW * 2} height="8"
        fill="#e5e7eb" stroke={STR} strokeWidth="1.5"
      />

      {/* Result label */}
      <text x={acx} y={assmLabelY} textAnchor="middle" fontSize="9" fill={LBL} fontFamily="Outfit,sans-serif">
        nested &amp; assembled
      </text>
    </svg>
  );
}

// ── Scene 0: Cut & Assemble ───────────────────────────────────────────────

type CutBottle = "bottle1" | "bottle2";

interface CutAndAssembleSceneProps {
  assembly: AssemblyState;
  onAssemblyChange: (next: AssemblyState) => void;
}

function CutAndAssembleScene({ assembly, onAssemblyChange }: CutAndAssembleSceneProps) {
  const [scalpelActive, setScalpelActive] = useState(false);
  const [dragProgress, setDragProgress] = useState(0); // 0-100
  const [activeCut, setActiveCut] = useState<CutBottle | null>(null);
  const [wrongFlash, setWrongFlash] = useState<CutBottle | null>(null);
  const [shakingEl, setShakingEl] = useState<string | null>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const cutZoneRef1 = useRef<HTMLDivElement>(null);
  const cutZoneRef2 = useRef<HTMLDivElement>(null);

  function triggerShake(id: string) {
    setShakingEl(id);
    setTimeout(() => setShakingEl(null), 500);
  }

  function handleCutPointerDown(bottle: CutBottle, e: React.PointerEvent<HTMLDivElement>) {
    if (!scalpelActive) {
      triggerShake(`no-scalpel-${bottle}`);
      return;
    }
    const already = bottle === "bottle1" ? assembly.bottle1Cut : assembly.bottle2Cut;
    if (already) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    dragStartX.current = e.clientX;
    setActiveCut(bottle);
    setDragProgress(0);
  }

  function handleCutPointerMove(bottle: CutBottle, e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging.current || activeCut !== bottle) return;
    const ref = bottle === "bottle1" ? cutZoneRef1 : cutZoneRef2;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const moved = e.clientX - dragStartX.current;
    const pct = Math.max(0, Math.min(100, (moved / rect.width) * 100));
    setDragProgress(pct);
    if (pct >= 85) {
      isDragging.current = false;
      setActiveCut(null);
      setDragProgress(0);
      onAssemblyChange({ ...assembly, [bottle === "bottle1" ? "bottle1Cut" : "bottle2Cut"]: true });
    }
  }

  function handleCutPointerUp(bottle: CutBottle) {
    if (!isDragging.current || activeCut !== bottle) return;
    isDragging.current = false;
    if (dragProgress < 85) {
      setWrongFlash(bottle);
      triggerShake(`cut-${bottle}`);
      setTimeout(() => setWrongFlash(null), 500);
    }
    setDragProgress(0);
    setActiveCut(null);
  }

  function handleFlipNest() {
    onAssemblyChange({ ...assembly, topFlipped: true, assembled: true });
  }

  function handleThreadString() {
    onAssemblyChange({ ...assembly, stringThreaded: true });
  }

  const bothCut = assembly.bottle1Cut && assembly.bottle2Cut;
  const step = !bothCut ? "cut" : !assembly.assembled ? "nest" : !assembly.stringThreaded ? "string" : "done";

  return (
    <div className="space-y-4">
      <style>{SHAKE_KEYFRAMES}</style>
      <div className="rounded-2xl p-4" style={{ background: "#132638", border: "1px solid #1e3a52" }}>
        <h3 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: 15, color: "#e2e8f0", marginBottom: 6 }}>
          ✂️ Cut &amp; Assemble Your Bottle
        </h3>
        <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
          You need two plastic bottles. Cut each at the marked line, flip the top of Bottle 1, and nest it into Bottle 2 to form the terrarium.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "cut1", label: "1. Cut Bottle 1", done: assembly.bottle1Cut },
          { key: "cut2", label: "2. Cut Bottle 2", done: assembly.bottle2Cut },
          { key: "nest", label: "3. Flip & Nest", done: assembly.assembled },
          { key: "string", label: "4. Thread String", done: assembly.stringThreaded },
        ].map((s) => (
          <span
            key={s.key}
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: s.done ? "#00d4aa22" : "#0d1e2c",
              border: `1px solid ${s.done ? "#00d4aa" : "#1e3a52"}`,
              color: s.done ? "#00d4aa" : "#64748b",
              fontFamily: "Outfit,sans-serif",
            }}
          >
            {s.done ? "✅" : "○"} {s.label}
          </span>
        ))}
      </div>

      {/* Scalpel pickup */}
      {step === "cut" && (
        <div className="rounded-2xl p-4" style={{ background: "#0d1e2c", border: "1px solid #1e3a52" }}>
          <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#e2e8f0", marginBottom: 10 }}>
            {scalpelActive
              ? "🔪 Scalpel ready! Drag left → right across a dashed cut line."
              : "First, pick up the scalpel tool to start cutting."}
          </p>
          {!scalpelActive && (
            <button
              type="button"
              aria-label="Pick up scalpel tool"
              onClick={() => setScalpelActive(true)}
              className="rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: "#f59e0b", color: "#0d1e2c", fontFamily: "Outfit,sans-serif" }}
            >
              🔪 Pick Up Scalpel
            </button>
          )}

          {scalpelActive && (
            <div className="flex flex-col gap-4">
              {/* Bottle 1 cut zone */}
              {!assembly.bottle1Cut && (
                <div>
                  <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 12, color: "#f59e0b", marginBottom: 6 }}>
                    Drag across Bottle 1 cut line:
                  </p>
                  <div
                    ref={cutZoneRef1}
                    className={`relative select-none overflow-hidden rounded-xl ${shakingEl === "cut-bottle1" ? "bel-shake" : ""}`}
                    style={{
                      height: 48,
                      background: wrongFlash === "bottle1" ? "#ef444422" : "#132638",
                      border: `2px dashed ${wrongFlash === "bottle1" ? "#ef4444" : "#f59e0b"}`,
                      cursor: "ew-resize",
                      touchAction: "none",
                    }}
                    onPointerDown={(e) => handleCutPointerDown("bottle1", e)}
                    onPointerMove={(e) => handleCutPointerMove("bottle1", e)}
                    onPointerUp={() => handleCutPointerUp("bottle1")}
                    onPointerLeave={() => handleCutPointerUp("bottle1")}
                    role="slider"
                    aria-label="Drag to cut Bottle 1"
                    aria-valuenow={Math.round(activeCut === "bottle1" ? dragProgress : 0)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      style={{
                        position: "absolute", top: 0, left: 0, height: "100%",
                        width: `${activeCut === "bottle1" ? dragProgress : 0}%`,
                        background: "#f59e0b33",
                        transition: activeCut === "bottle1" ? "none" : "width 0.2s",
                      }}
                    />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                      <span style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#f59e0b" }}>
                        {activeCut === "bottle1" ? `🔪 ${Math.round(dragProgress)}%` : "→ drag here →"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {assembly.bottle1Cut && (
                <div className="rounded-xl p-3" style={{ background: "#00d4aa11", border: "1px solid #00d4aa44" }}>
                  <span style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#00d4aa" }}>✅ Bottle 1 cut!</span>
                </div>
              )}

              {/* Bottle 2 cut zone */}
              {!assembly.bottle2Cut && (
                <div>
                  <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 12, color: "#f59e0b", marginBottom: 6 }}>
                    Now drag across Bottle 2 cut line:
                  </p>
                  <div
                    ref={cutZoneRef2}
                    className={`relative select-none overflow-hidden rounded-xl ${shakingEl === "cut-bottle2" ? "bel-shake" : ""}`}
                    style={{
                      height: 48,
                      background: wrongFlash === "bottle2" ? "#ef444422" : "#132638",
                      border: `2px dashed ${wrongFlash === "bottle2" ? "#ef4444" : "#f59e0b"}`,
                      cursor: assembly.bottle1Cut ? "ew-resize" : "not-allowed",
                      opacity: assembly.bottle1Cut ? 1 : 0.4,
                      touchAction: "none",
                    }}
                    onPointerDown={(e) => assembly.bottle1Cut && handleCutPointerDown("bottle2", e)}
                    onPointerMove={(e) => assembly.bottle1Cut && handleCutPointerMove("bottle2", e)}
                    onPointerUp={() => assembly.bottle1Cut && handleCutPointerUp("bottle2")}
                    onPointerLeave={() => assembly.bottle1Cut && handleCutPointerUp("bottle2")}
                    role="slider"
                    aria-label="Drag to cut Bottle 2"
                    aria-disabled={!assembly.bottle1Cut}
                    aria-valuenow={Math.round(activeCut === "bottle2" ? dragProgress : 0)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      style={{
                        position: "absolute", top: 0, left: 0, height: "100%",
                        width: `${activeCut === "bottle2" ? dragProgress : 0}%`,
                        background: "#f59e0b33",
                        transition: activeCut === "bottle2" ? "none" : "width 0.2s",
                      }}
                    />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                      <span style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: assembly.bottle1Cut ? "#f59e0b" : "#64748b" }}>
                        {activeCut === "bottle2" ? `🔪 ${Math.round(dragProgress)}%` : assembly.bottle1Cut ? "→ drag here →" : "Cut Bottle 1 first"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {assembly.bottle2Cut && (
                <div className="rounded-xl p-3" style={{ background: "#00d4aa11", border: "1px solid #00d4aa44" }}>
                  <span style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#00d4aa" }}>✅ Bottle 2 cut!</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Flip & Nest step */}
      {step === "nest" && (
        <div className="rounded-2xl p-5" style={{ background: "#132638", border: "1px solid #1e3a52" }}>
          <h4 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: 14, color: "#e2e8f0", marginBottom: 8 }}>
            🔄 Flip &amp; Nest the Top Piece
          </h4>
          <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 12 }}>
            Take the <strong style={{ color: "#e2e8f0" }}>top section of Bottle 1</strong> (the part with the cap). Flip it upside-down
            so the cap points downward, then nest it inside the <strong style={{ color: "#e2e8f0" }}>bottom of Bottle 2</strong>.
            The cap hangs down like a funnel, connecting the two chambers.
          </p>
          {/* Visual diagram */}
          <div className="flex items-center justify-center gap-6 mb-4" aria-hidden="true">
            <div className="flex flex-col items-center gap-1">
              <span style={{ fontSize: 28 }}>🍶</span>
              <span style={{ fontSize: 10, color: "#64748b", fontFamily: "Outfit,sans-serif" }}>top piece</span>
            </div>
            <span style={{ fontSize: 20, color: "#94a3b8" }}>→</span>
            <div className="flex flex-col items-center gap-1">
              <span style={{ fontSize: 28 }}>🔄</span>
              <span style={{ fontSize: 10, color: "#64748b", fontFamily: "Outfit,sans-serif" }}>flip</span>
            </div>
            <span style={{ fontSize: 20, color: "#94a3b8" }}>→</span>
            <div className="flex flex-col items-center gap-1">
              <span style={{ fontSize: 28 }}>🫙</span>
              <span style={{ fontSize: 10, color: "#64748b", fontFamily: "Outfit,sans-serif" }}>nest in Bottle 2</span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Flip and nest top piece of Bottle 1 into Bottle 2"
            onClick={handleFlipNest}
            className="rounded-full px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: "#6366f1", color: "#fff", fontFamily: "Outfit,sans-serif" }}
          >
            🔄 Flip &amp; Nest Top Piece
          </button>
        </div>
      )}

      {/* Thread string step */}
      {step === "string" && (
        <div className="rounded-2xl p-5" style={{ background: "#132638", border: "1px solid #1e3a52" }}>
          <h4 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: 14, color: "#e2e8f0", marginBottom: 8 }}>
            🧵 Thread the Cotton String
          </h4>
          <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 12 }}>
            Thread a piece of cotton string through the bottle cap hole. This acts as a wick, allowing water to travel
            from the aquatic zone down through the soil — connecting the two chambers.
          </p>
          <div className="flex items-center gap-3 mb-4" aria-hidden="true">
            <span style={{ fontSize: 24 }}>🧵</span>
            <span style={{ fontSize: 18, color: "#94a3b8" }}>→</span>
            <span style={{ fontSize: 24 }}>🔩</span>
            <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "Outfit,sans-serif" }}>(cap hole)</span>
          </div>
          <button
            type="button"
            aria-label="Thread cotton string through cap"
            onClick={handleThreadString}
            className="rounded-full px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: "#d4a574", color: "#1a0a00", fontFamily: "Outfit,sans-serif" }}
          >
            🧵 Thread String Through Cap
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="rounded-2xl p-4" style={{ background: "#00d4aa11", border: "1px solid #00d4aa44" }}>
          <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 14, color: "#00d4aa", fontWeight: 700 }}>
            ✅ Bottle assembled! Your terrarium is ready to receive organisms.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Assembled Bottle SVG (Scenes 1+) ─────────────────────────────────────

interface BottleSVGProps {
  placedOrganisms: string[];
  activeOrganismIds: string[];
  cycleType: CycleType | null;
  animating: boolean;
}

function BottleSVG({ placedOrganisms, activeOrganismIds, cycleType, animating }: BottleSVGProps) {
  const placed = ALL_ORGANISMS.filter((o) => placedOrganisms.includes(o.id));
  const aquatic = placed.filter((o) => o.zone === "aquatic");
  const terrestrial = placed.filter((o) => o.zone === "terrestrial");

  // Wide 2-liter proportions: cx=80, body half=65 (130px total), viewBox 160×360
  // Outer: straight walls x=15/x=145, Q-rounded base at y=335→351
  const outerPath = "M 15 10 L 15 335 Q 80 351 145 335 L 145 10";
  // Interior neck: fast Q-bezier fan-in from outer walls (x=15/145) at y=125
  // → neck (x=70/90) at y=148 → cap rect y=148 (20px wide, 14px tall)
  const intNeck =
    "M 15 125 Q 15 138 70 148 L 70 162 L 90 162 L 90 148 Q 145 138 145 125";

  return (
    <svg viewBox="0 0 160 360" width="160" height="360" aria-label="Bottle ecosystem diagram"
      style={{ filter: "drop-shadow(0 0 24px #00d4aa33)" }}>
      <defs>
        <clipPath id="btl-outer-clip">
          <path d={`${outerPath} Z`} />
        </clipPath>
      </defs>

      {/* ── Zone fills clipped to outer silhouette ── */}
      {/* Plant air zone: y=10–100 */}
      <rect x="15" y="10"  width="130" height="90"  fill="#f0fdf4" clipPath="url(#btl-outer-clip)" />
      {/* Soil zone: y=100–165 (covers shoulder + neck area) */}
      <rect x="15" y="100" width="130" height="65"  fill="#b5651d" clipPath="url(#btl-outer-clip)" />
      {/* Soil surface dome */}
      <path d="M 16 100 Q 80 83 144 100" fill="none" stroke="#7c2d12" strokeWidth="1.5" clipPath="url(#btl-outer-clip)" />
      {/* Aquatic air gap: y=170–182 */}
      <rect x="15" y="170" width="130" height="12"  fill="#f0f9ff" clipPath="url(#btl-outer-clip)" />
      {/* Water zone: y=182–335 */}
      <rect x="15" y="182" width="130" height="153" fill="#add8e6" clipPath="url(#btl-outer-clip)" />
      {/* Gravel ellipses at base */}
      <ellipse cx="45"  cy="323" rx="14" ry="6" fill="#94a3b8" opacity="0.6" clipPath="url(#btl-outer-clip)" />
      <ellipse cx="80"  cy="321" rx="16" ry="6" fill="#94a3b8" opacity="0.6" clipPath="url(#btl-outer-clip)" />
      <ellipse cx="116" cy="324" rx="13" ry="6" fill="#94a3b8" opacity="0.6" clipPath="url(#btl-outer-clip)" />
      <ellipse cx="62"  cy="330" rx="11" ry="5" fill="#94a3b8" opacity="0.6" clipPath="url(#btl-outer-clip)" />
      <ellipse cx="100" cy="329" rx="12" ry="5" fill="#94a3b8" opacity="0.6" clipPath="url(#btl-outer-clip)" />

      {/* ── Zone labels ── */}
      <text x="80" y="58"  textAnchor="middle" fontSize="9" fill="#4ade80" fontFamily="Outfit,sans-serif">AIR</text>
      <text x="80" y="145" textAnchor="middle" fontSize="9" fill="#a16207" fontFamily="Outfit,sans-serif">SOIL</text>
      <text x="80" y="265" textAnchor="middle" fontSize="9" fill="#60a5fa" fontFamily="Outfit,sans-serif">AQUATIC</text>

      {aquatic.map((org, i) => {
        const isActive = activeOrganismIds.includes(org.id);
        const cx = 45 + i * 50; const cy = 200;
        return (
          <g key={org.id}>
            {isActive && <circle cx={cx} cy={cy} r="18" fill={org.color} opacity="0.18">
              <animate attributeName="r" values="18;24;18" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.18;0.32;0.18" dur="1.5s" repeatCount="indefinite" />
            </circle>}
            <text x={cx} y={cy + 6} textAnchor="middle" fontSize="20" fontFamily="serif">{org.emoji}</text>
          </g>
        );
      })}
      {terrestrial.map((org, i) => {
        const isActive = activeOrganismIds.includes(org.id);
        const cx = 35 + i * 40; const cy = 70;
        return (
          <g key={org.id}>
            {isActive && <circle cx={cx} cy={cy} r="16" fill={org.color} opacity="0.18">
              <animate attributeName="r" values="16;22;16" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.18;0.32;0.18" dur="1.5s" repeatCount="indefinite" />
            </circle>}
            <text x={cx} y={cy + 6} textAnchor="middle" fontSize="18" fontFamily="serif">{org.emoji}</text>
          </g>
        );
      })}

      {/* Cotton string from cap waist down through water to gravel */}
      <line x1="80" y1="162" x2="80" y2="327" stroke="#e8c84a" strokeWidth="2" strokeDasharray="4,3" />

      {/* ── Single outer silhouette (straight walls, Q-rounded base) ── */}
      <path d={outerPath} fill="none" stroke="#64748b" strokeWidth="2" />
      {/* Dashed top cut edge */}
      <line x1="15" y1="10" x2="145" y2="10" stroke="#e53e3e" strokeWidth="1.5" strokeDasharray="5,3" />

      {/* ── Interior neck: fast Q-bezier fan-in ── */}
      <path d={intNeck} fill="none" stroke="#64748b" strokeWidth="1.8" />
      {/* Cap rect: 20px wide, 14px tall */}
      <rect x="70" y="148" width="20" height="14" fill="#e5e7eb" stroke="#64748b" strokeWidth="1.5" />

      {/* Water cycle animation */}
      {cycleType === "water" && animating && (
        <g>
          <circle cx="80" cy="170" r="4" fill="#60a5fa" opacity="0.8">
            <animateMotion dur="2s" repeatCount="indefinite" path="M 0 0 C 0 -70 15 -130 5 -150" />
            <animate attributeName="opacity" values="0.8;0.2;0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="105" cy="165" r="3" fill="#60a5fa" opacity="0.7">
            <animateMotion dur="2.5s" repeatCount="indefinite" begin="0.5s" path="M 0 0 C 8 -60 -8 -115 4 -140" />
            <animate attributeName="opacity" values="0.7;0.3;0" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
          </circle>
          <circle cx="22" cy="65" r="3" fill="#60a5fa" opacity="0.6">
            <animateMotion dur="3s" repeatCount="indefinite" begin="1s" path="M 0 0 L 0 100" />
          </circle>
          <circle cx="138" cy="75" r="3" fill="#60a5fa" opacity="0.6">
            <animateMotion dur="3.5s" repeatCount="indefinite" begin="1.5s" path="M 0 0 L 0 90" />
          </circle>
          <text x="80" y="95" textAnchor="middle" fontSize="8" fill="#60a5fa" fontFamily="Outfit,sans-serif" opacity="0.8">evaporation ↑</text>
          <text x="36" y="130" textAnchor="middle" fontSize="7" fill="#60a5fa" fontFamily="Outfit,sans-serif" opacity="0.7">condensation</text>
        </g>
      )}

      {/* Carbon cycle animation */}
      {cycleType === "carbon" && animating && (
        <g>
          <text x="70" y="175" fontSize="8" fill="#22c55e" fontFamily="Outfit,sans-serif" opacity="0">
            CO₂
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
            <animateMotion dur="2s" repeatCount="indefinite" path="M 0 0 L -15 -65" />
          </text>
          <text x="110" y="130" fontSize="8" fill="#22c55e" fontFamily="Outfit,sans-serif" opacity="0">
            CO₂
            <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
            <animateMotion dur="2.5s" repeatCount="indefinite" begin="0.5s" path="M 0 0 L -22 -50" />
          </text>
          <text x="42" y="118" fontSize="8" fill="#4ade80" fontFamily="Outfit,sans-serif" opacity="0">
            O₂ →
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1s" />
            <animateMotion dur="2s" repeatCount="indefinite" begin="1s" path="M 0 0 L 0 -35" />
          </text>
          <text x="80" y="52" textAnchor="middle" fontSize="8" fill="#22c55e" fontFamily="Outfit,sans-serif" opacity="0.8">photosynthesis ↓</text>
          <text x="80" y="152" textAnchor="middle" fontSize="8" fill="#22c55e" fontFamily="Outfit,sans-serif" opacity="0.7">respiration ↑</text>
        </g>
      )}

      {/* Nitrogen cycle animation */}
      {cycleType === "nitrogen" && animating && (
        <g>
          <circle cx="65" cy="225" r="4" fill="#f59e0b" opacity="0">
            <animate attributeName="opacity" values="0;0.9;0" dur="2s" repeatCount="indefinite" />
            <animateMotion dur="2s" repeatCount="indefinite" path="M 0 0 L 8 25" />
          </circle>
          <line x1="58" y1="255" x2="58" y2="285" stroke="#f59e0b" strokeWidth="2" opacity="0">
            <animate attributeName="opacity" values="0;0.8;0" dur="2s" repeatCount="indefinite" begin="0.8s" />
          </line>
          <text x="80" y="228" textAnchor="middle" fontSize="7" fill="#f59e0b" fontFamily="Outfit,sans-serif" opacity="0.8">decomposition</text>
          <text x="80" y="315" textAnchor="middle" fontSize="7" fill="#f59e0b" fontFamily="Outfit,sans-serif" opacity="0.8">N absorbed by roots</text>
          <circle cx="80" cy="250" r="5" fill="#f59e0b" opacity="0">
            <animate attributeName="opacity" values="0;0.7;0" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
            <animateMotion dur="1.5s" repeatCount="indefinite" begin="0.3s" path="M 0 0 C 8 4 -4 8 4 12" />
          </circle>
        </g>
      )}

      <rect x="35" y="344" width="90" height="14" rx="7" fill="#132638" />
      <text x="80" y="355" textAnchor="middle" fontSize="8" fill="#00d4aa" fontFamily="Outfit,sans-serif" fontWeight="bold">
        BOTTLE ECOSYSTEM
      </text>
    </svg>
  );
}

// ── Scene 1: Add Organisms (drag-to-zone) ────────────────────────────────

interface AddOrganismsSceneProps {
  placedOrganisms: string[];
  onPlace: (id: string, zone: "terrestrial" | "aquatic") => void;
  onRemove: (id: string) => void;
  shakeId: string | null;
}

function AddOrganismsScene({ placedOrganisms, onPlace, onRemove, shakeId }: AddOrganismsSceneProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const trayOrganisms = ALL_ORGANISMS.filter((o) => !placedOrganisms.includes(o.id));
  const allPlaced = placedOrganisms.length === ALL_ORGANISMS.length;

  function handleOrganismClick(id: string) {
    setSelected((prev) => (prev === id ? null : id));
  }

  function handleZoneDrop(zone: "terrestrial" | "aquatic") {
    if (!selected) return;
    const org = ALL_ORGANISMS.find((o) => o.id === selected);
    if (!org) return;
    onPlace(selected, zone);
    setSelected(null);
  }

  return (
    <div className="space-y-4">
      <style>{SHAKE_KEYFRAMES}</style>
      <div className="rounded-2xl p-4" style={{ background: "#132638", border: "1px solid #1e3a52" }}>
        <h3 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: 15, color: "#e2e8f0", marginBottom: 6 }}>
          🧬 Add Your Organisms
        </h3>
        <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
          Select an organism from the tray below, then click the correct zone in the bottle.
          Terrestrial organisms live in the top (air/soil) chamber. Aquatic organisms live in the bottom chamber.
        </p>
      </div>

      {/* Drop zones */}
      <div className="grid grid-cols-2 gap-3">
        {/* Terrestrial zone */}
        <button
          type="button"
          aria-label="Drop in terrestrial zone (top)"
          onClick={() => handleZoneDrop("terrestrial")}
          disabled={!selected}
          className="rounded-2xl p-4 text-left transition-all"
          style={{
            background: selected ? "#1a2a1a" : "#0d1e2c",
            border: `2px ${selected ? "solid" : "dashed"} ${selected ? "#4ade80" : "#1e3a52"}`,
            cursor: selected ? "pointer" : "default",
            minHeight: 90,
          }}
        >
          <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 12, color: "#4ade80", fontWeight: 700, marginBottom: 4 }}>
            🌱 TERRESTRIAL (top)
          </div>
          <div className="flex flex-wrap gap-1">
            {ALL_ORGANISMS.filter((o) => o.zone === "terrestrial" && placedOrganisms.includes(o.id)).map((o) => (
              <span
                key={o.id}
                className={shakeId === o.id ? "bel-shake" : ""}
                style={{ fontSize: 20 }}
                title={o.name}
              >{o.emoji}</span>
            ))}
          </div>
          {selected && ALL_ORGANISMS.find((o) => o.id === selected)?.zone === "terrestrial" && (
            <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 11, color: "#4ade80", marginTop: 4 }}>
              ↑ Click to place here
            </div>
          )}
          {selected && ALL_ORGANISMS.find((o) => o.id === selected)?.zone !== "terrestrial" && (
            <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 11, color: "#ef4444", marginTop: 4 }}>
              ✗ Wrong zone for this organism
            </div>
          )}
        </button>

        {/* Aquatic zone */}
        <button
          type="button"
          aria-label="Drop in aquatic zone (bottom)"
          onClick={() => handleZoneDrop("aquatic")}
          disabled={!selected}
          className="rounded-2xl p-4 text-left transition-all"
          style={{
            background: selected ? "#0a2540" : "#0d1e2c",
            border: `2px ${selected ? "solid" : "dashed"} ${selected ? "#60a5fa" : "#1e3a52"}`,
            cursor: selected ? "pointer" : "default",
            minHeight: 90,
          }}
        >
          <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 12, color: "#60a5fa", fontWeight: 700, marginBottom: 4 }}>
            💧 AQUATIC (bottom)
          </div>
          <div className="flex flex-wrap gap-1">
            {ALL_ORGANISMS.filter((o) => o.zone === "aquatic" && placedOrganisms.includes(o.id)).map((o) => (
              <span
                key={o.id}
                className={shakeId === o.id ? "bel-shake" : ""}
                style={{ fontSize: 20 }}
                title={o.name}
              >{o.emoji}</span>
            ))}
          </div>
          {selected && ALL_ORGANISMS.find((o) => o.id === selected)?.zone === "aquatic" && (
            <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 11, color: "#60a5fa", marginTop: 4 }}>
              ↑ Click to place here
            </div>
          )}
          {selected && ALL_ORGANISMS.find((o) => o.id === selected)?.zone !== "aquatic" && (
            <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 11, color: "#ef4444", marginTop: 4 }}>
              ✗ Wrong zone for this organism
            </div>
          )}
        </button>
      </div>

      {/* Organism tray */}
      <div className="rounded-2xl p-3" style={{ background: "#0d1e2c", border: "1px solid #1e3a52" }}>
        <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
          🗂 Organism Tray — click to select
        </p>
        {trayOrganisms.length === 0 ? (
          <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#00d4aa" }}>All organisms placed! ✓</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {trayOrganisms.map((org) => (
              <button
                key={org.id}
                type="button"
                aria-pressed={selected === org.id}
                aria-label={`Select ${org.name} (${org.role}, ${org.zone})`}
                onClick={() => handleOrganismClick(org.id)}
                className={`rounded-xl p-2 transition-all hover:opacity-80 ${shakeId === org.id ? "bel-shake" : ""}`}
                style={{
                  background: selected === org.id ? `${org.color}33` : "#132638",
                  border: `2px solid ${selected === org.id ? org.color : "#1e3a52"}`,
                }}
              >
                <div style={{ fontSize: 22 }}>{org.emoji}</div>
                <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 10, color: selected === org.id ? org.color : "#94a3b8", marginTop: 2 }}>
                  {org.name}
                </div>
                <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 9, color: "#64748b", textTransform: "capitalize" }}>
                  {org.zone}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Placed list */}
      {placedOrganisms.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: "#132638", border: "1px solid #1e3a52" }}>
          <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            Placed — click to return to tray
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_ORGANISMS.filter((o) => placedOrganisms.includes(o.id)).map((org) => (
              <button
                key={org.id}
                type="button"
                aria-label={`Remove ${org.name} back to tray`}
                onClick={() => onRemove(org.id)}
                className="rounded-xl px-3 py-1 text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ background: `${org.color}22`, border: `1px solid ${org.color}`, color: org.color, fontFamily: "Outfit,sans-serif" }}
              >
                {org.emoji} {org.name} ×
              </button>
            ))}
          </div>
        </div>
      )}

      {allPlaced && (
        <div className="rounded-xl p-3" style={{ background: "#00d4aa11", border: "1px solid #00d4aa44" }}>
          <span style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#00d4aa" }}>
            ✅ All organisms placed in their correct zones — ecosystem is ready!
          </span>
        </div>
      )}
    </div>
  );
}

// ── Prediction Gate ───────────────────────────────────────────────────────

interface PredictionGateProps {
  question: string;
  options?: string[];
  onSubmit: (answer: string) => void;
  submitted: boolean;
}

function PredictionGate({ question, options, onSubmit, submitted }: PredictionGateProps) {
  const [answer, setAnswer] = useState("");

  if (submitted) return null;

  return (
    <div className="rounded-2xl p-5" style={{ background: "#132638", border: "1px solid #1e3a52" }}>
      <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#f59e0b", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        🔒 Prediction Gate
      </p>
      <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 14, color: "#e2e8f0", marginBottom: 12, lineHeight: 1.6 }}>
        {question}
      </p>
      {options ? (
        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              aria-pressed={answer === opt}
              onClick={() => setAnswer(opt)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-left transition-all"
              style={{
                background: answer === opt ? "#00d4aa22" : "#0d1e2c",
                border: `1px solid ${answer === opt ? "#00d4aa" : "#1e3a52"}`,
                color: answer === opt ? "#00d4aa" : "#94a3b8",
                fontFamily: "Outfit,sans-serif",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <textarea
          aria-label="Prediction answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={2}
          placeholder="Type your prediction…"
          className="w-full resize-none rounded-xl p-3 text-sm outline-none"
          style={{ background: "#0d1e2c", border: "1px solid #1e3a52", color: "#e2e8f0", fontFamily: "Outfit,sans-serif" }}
        />
      )}
      <button
        type="button"
        aria-label="Submit prediction to unlock animation"
        onClick={() => answer.trim() && onSubmit(answer)}
        disabled={!answer.trim()}
        className="mt-3 rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
        style={{ background: "#00d4aa", color: "#0d1e2c", fontFamily: "Outfit,sans-serif" }}
      >
        Submit Prediction →
      </button>
    </div>
  );
}

// ── Scene 2: Water Cycle ──────────────────────────────────────────────────

interface WaterCycleSceneProps {
  prediction: StudentPrediction | undefined;
  onPrediction: (answer: string) => void;
  animating: boolean;
}

function WaterCycleScene({ prediction, onPrediction, animating }: WaterCycleSceneProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: "#132638", border: "1px solid #1e3a52" }}>
        <h3 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: 15, color: "#60a5fa", marginBottom: 6 }}>💧 Water Cycle</h3>
        <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
          Water evaporates from the aquatic zone, condenses on the bottle walls, and drips back down. This is a closed loop — no water enters or leaves the sealed bottle.
        </p>
      </div>
      <PredictionGate
        question="Before the animation plays: Where does the water go after it evaporates from the aquatic zone?"
        options={[
          "It condenses on the bottle walls and drips back down",
          "It escapes through the bottle cap",
          "It is absorbed directly by the soil without condensing",
          "It disappears and is lost from the system",
        ]}
        onSubmit={onPrediction}
        submitted={!!prediction}
      />
      {animating && prediction && (
        <div className="rounded-2xl p-4" style={{ background: "#0a2540", border: "1px solid #1e4a7a" }}>
          <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#60a5fa", fontWeight: 600, marginBottom: 8 }}>🔵 Water Cycle Steps (animated in bottle)</p>
          <ol style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#94a3b8", lineHeight: 2, paddingLeft: 20 }}>
            <li>☀️ Heat evaporates water from the aquatic zone</li>
            <li>💨 Water vapor rises and hits the cool bottle walls</li>
            <li>💧 Vapor condenses into droplets on glass surface</li>
            <li>⬇️ Droplets drip down into soil and aquatic zone</li>
          </ol>
        </div>
      )}
      {prediction && (
        <div className="rounded-xl p-3" style={{ background: "#132638", border: "1px solid #1e3a52", fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#94a3b8" }}>
          <span style={{ color: "#60a5fa", fontWeight: 600 }}>Your prediction: </span>{prediction.studentAnswer}
        </div>
      )}
    </div>
  );
}

// ── Scene 3: Carbon Cycle ─────────────────────────────────────────────────

interface CarbonCycleSceneProps {
  prediction: StudentPrediction | undefined;
  onPrediction: (answer: string) => void;
  animating: boolean;
}

function CarbonCycleScene({ prediction, onPrediction, animating }: CarbonCycleSceneProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: "#132638", border: "1px solid #1e3a52" }}>
        <h3 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: 15, color: "#22c55e", marginBottom: 6 }}>🌿 Carbon Cycle</h3>
        <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
          Carbon flows as CO₂ is released by the fish and cricket during cellular respiration, then captured by the plant during photosynthesis to produce oxygen and glucose.
        </p>
      </div>
      <PredictionGate
        question="Identify the producer in this carbon cycle before the arrows appear. Which organism converts CO₂ into glucose using light energy?"
        options={[
          "Aquatic Plant 🌿 — uses CO₂ + light → glucose + O₂",
          "Fish 🐟 — breaks down glucose for energy",
          "Cricket 🦗 — consumes organic matter",
          "Worm 🪱 — decomposes dead organic material",
        ]}
        onSubmit={onPrediction}
        submitted={!!prediction}
      />
      {animating && prediction && (
        <div className="rounded-2xl p-4" style={{ background: "#0a1f0a", border: "1px solid #1a3a1a" }}>
          <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#22c55e", fontWeight: 600, marginBottom: 8 }}>🟢 Carbon Cycle Arrows (animated in bottle)</p>
          <div className="space-y-2" style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#94a3b8" }}>
            {[
              "Fish & Cricket respiration releases CO₂",
              "Aquatic Plant absorbs CO₂ for photosynthesis",
              "Plant releases O₂ — consumed by fish & cricket",
              "Glucose stored in plant tissues feeds consumers",
            ].map((line) => (
              <div key={line} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#22c55e", fontWeight: 700 }}>→</span>{line}
              </div>
            ))}
          </div>
        </div>
      )}
      {prediction && (
        <div className="rounded-xl p-3" style={{ background: "#132638", border: "1px solid #1e3a52", fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#94a3b8" }}>
          <span style={{ color: "#22c55e", fontWeight: 600 }}>Your prediction: </span>{prediction.studentAnswer}
        </div>
      )}
    </div>
  );
}

// ── Scene 4: Nitrogen Cycle ───────────────────────────────────────────────

type NitrogenRankItem = { id: string; label: string };

const NITROGEN_STEPS: NitrogenRankItem[] = [
  { id: "a", label: "Organisms die and leave dead matter in the soil" },
  { id: "b", label: "Worm decomposes dead matter into simpler compounds" },
  { id: "c", label: "Nitrogen compounds dissolve in soil water" },
  { id: "d", label: "Plant roots absorb nitrogen from soil water" },
];

const CORRECT_NITROGEN_ORDER = ["a", "b", "c", "d"];

interface NitrogenCycleSceneProps {
  prediction: StudentPrediction | undefined;
  onPrediction: (answer: string) => void;
  animating: boolean;
}

function NitrogenCycleScene({ prediction, onPrediction, animating }: NitrogenCycleSceneProps) {
  const [order, setOrder] = useState<NitrogenRankItem[]>([...NITROGEN_STEPS]);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const isCorrect = order.map((o) => o.id).join(",") === CORRECT_NITROGEN_ORDER.join(",");

  function handleDragStart(index: number) { dragItem.current = index; }
  function handleDragEnter(index: number) { dragOverItem.current = index; }
  function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newOrder = [...order];
    const dragged = newOrder.splice(dragItem.current, 1)[0];
    newOrder.splice(dragOverItem.current, 0, dragged);
    setOrder(newOrder);
    dragItem.current = null;
    dragOverItem.current = null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: "#132638", border: "1px solid #1e3a52" }}>
        <h3 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: 15, color: "#f59e0b", marginBottom: 6 }}>🪱 Nitrogen Cycle</h3>
        <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
          Worms are decomposers that break down dead organic matter into nitrogen compounds. These compounds are absorbed by plant roots, completing the nitrogen cycle inside the bottle.
        </p>
      </div>

      {!prediction ? (
        <div className="rounded-2xl p-4" style={{ background: "#132638", border: "1px solid #1e3a52" }}>
          <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#f59e0b", fontWeight: 600, marginBottom: 4 }}>🔒 Prediction Gate</p>
          <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#e2e8f0", marginBottom: 12, lineHeight: 1.6 }}>
            Drag to rank these events in the correct order — what happens first, second, third, fourth?
          </p>
          <div className="space-y-2">
            {order.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className="flex cursor-grab items-center gap-3 rounded-xl p-3 transition-all active:cursor-grabbing"
                style={{ background: "#0d1e2c", border: "1px solid #1e3a52" }}
                aria-label={`Step ${index + 1}: ${item.label}. Drag to reorder.`}
              >
                <span style={{ color: "#64748b", fontSize: 12, fontFamily: "Outfit,sans-serif", minWidth: 20 }}>{index + 1}.</span>
                <span style={{ color: "#94a3b8", fontSize: 13, fontFamily: "Outfit,sans-serif", lineHeight: 1.4 }}>{item.label}</span>
                <span style={{ color: "#64748b", marginLeft: "auto" }}>⠿</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            aria-label="Submit nitrogen cycle ranking"
            onClick={() => onPrediction(order.map((i) => i.label).join(" → "))}
            className="mt-4 rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: "#f59e0b", color: "#0d1e2c", fontFamily: "Outfit,sans-serif" }}
          >
            Submit Ranking →
          </button>
        </div>
      ) : null}

      {animating && prediction && (
        <div className="rounded-2xl p-4" style={{ background: "#1a0f00", border: "1px solid #3a2200" }}>
          <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#f59e0b", fontWeight: 600, marginBottom: 8 }}>🟡 Nitrogen Cycle (animated in bottle)</p>
          <ol style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#94a3b8", lineHeight: 2, paddingLeft: 20 }}>
            {NITROGEN_STEPS.map((step, i) => (
              <li key={step.id} style={{ color: isCorrect && order[i]?.id === step.id ? "#f59e0b" : "#94a3b8" }}>{step.label}</li>
            ))}
          </ol>
          {isCorrect && <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#f59e0b", marginTop: 8, fontWeight: 600 }}>✅ You ranked the steps correctly!</div>}
        </div>
      )}

      {prediction && (
        <div className="rounded-xl p-3" style={{ background: "#132638", border: "1px solid #1e3a52", fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#94a3b8" }}>
          <span style={{ color: "#f59e0b", fontWeight: 600 }}>Your ranking: </span>submitted ✓
        </div>
      )}
    </div>
  );
}

// ── Scene 5: Reflect & Connect ────────────────────────────────────────────

interface ReflectSceneProps {
  predictions: StudentPrediction[];
  submitted: boolean;
  feedback: string | null;
  onSubmit: (text: string) => Promise<void>;
}

function ReflectScene({ predictions, submitted, feedback, onSubmit }: ReflectSceneProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!text.trim() || loading) return;
    setLoading(true);
    await onSubmit(text);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: "#132638", border: "1px solid #1e3a52" }}>
        <h3 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: 15, color: "#e2e8f0", marginBottom: 6 }}>✍️ Reflect &amp; Connect</h3>
        <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
          Now that you&apos;ve observed all three cycles, use what you know to answer this CER prompt.
        </p>
      </div>

      {predictions.length > 0 && (
        <div className="rounded-2xl p-4 space-y-2" style={{ background: "#0d1e2c", border: "1px solid #1e3a52" }}>
          <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            📋 Your Earlier Predictions (use as evidence)
          </p>
          {predictions.map((p) => (
            <div key={p.sceneId} className="rounded-xl p-3" style={{ background: "#132638", border: "1px solid #1e3a52" }}>
              <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 11, color: "#64748b", marginBottom: 2 }}>{p.questionText.slice(0, 60)}…</p>
              <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#94a3b8" }}>{p.studentAnswer}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl p-5" style={{ background: "#132638", border: "1px solid #1e3a52" }}>
        <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 14, color: "#e2e8f0", fontWeight: 600, marginBottom: 4 }}>CER Prompt</p>
        <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 14, color: "#cbd5e1", lineHeight: 1.6, marginBottom: 12 }}>
          &ldquo;Predict what happens if you remove the worms from the bottle ecosystem. Use one cycle to explain your reasoning.&rdquo;
        </p>
        <textarea
          aria-label="CER response"
          disabled={submitted}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Write your Claim, Evidence, and Reasoning here…&#10;&#10;Claim: If the worms are removed...&#10;Evidence: From the nitrogen cycle, I observed that...&#10;Reasoning: This matters because..."
          className="w-full resize-none rounded-xl p-3 text-sm outline-none"
          style={{ background: "#0d1e2c", border: "1px solid #1e3a52", color: "#e2e8f0", fontFamily: "Outfit,sans-serif", opacity: submitted ? 0.6 : 1 }}
        />
        {feedback && (
          <div className="mt-3 rounded-xl p-3" style={{ background: "#00d4aa11", border: "1px solid #00d4aa44", fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>
            <span style={{ color: "#00d4aa", fontWeight: 600 }}>Feedback: </span>{feedback}
          </div>
        )}
        {!submitted && (
          <button
            type="button"
            aria-label="Submit CER reflection"
            onClick={handleSubmit}
            disabled={!text.trim() || loading}
            className="mt-3 rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: "#00d4aa", color: "#0d1e2c", fontFamily: "Outfit,sans-serif" }}
          >
            {loading ? "Scoring…" : "Submit CER →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function BottleEcosystemCyclesPage() {
  const [labState, setLabState] = useState<BottleLabState>({
    assemblyState: {
      bottle1Cut: false,
      bottle2Cut: false,
      topFlipped: false,
      assembled: false,
      stringThreaded: false,
    },
    organisms: ALL_ORGANISMS,
    placedOrganisms: [],
    completedScenes: [],
    predictions: [],
    currentScene: 0,
    cycleScore: {},
  });

  const [animating, setAnimating] = useState(false);
  const [reflectionSubmitted, setReflectionSubmitted] = useState(false);
  const [reflectionFeedback, setReflectionFeedback] = useState<string | null>(null);
  // Shake feedback for wrong-zone placement
  const [shakeOrganismId, setShakeOrganismId] = useState<string | null>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentSceneMeta = SCENE_META[labState.currentScene];
  const allOrganismsPlaced = labState.placedOrganisms.length === ALL_ORGANISMS.length;
  const assemblyComplete = labState.assemblyState.stringThreaded;

  // ── Assembly change ──
  function handleAssemblyChange(next: AssemblyState) {
    setLabState((prev) => ({ ...prev, assemblyState: next }));
  }

  // ── Place organism into a zone (with wrong-zone shake) ──
  function handlePlaceOrganism(id: string, zone: "terrestrial" | "aquatic") {
    const org = ALL_ORGANISMS.find((o) => o.id === id);
    if (!org) return;
    if (org.zone !== zone) {
      // Wrong zone: shake + reject
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      setShakeOrganismId(id);
      shakeTimerRef.current = setTimeout(() => setShakeOrganismId(null), 500);
      return;
    }
    setLabState((prev) => ({
      ...prev,
      placedOrganisms: prev.placedOrganisms.includes(id)
        ? prev.placedOrganisms
        : [...prev.placedOrganisms, id],
    }));
  }

  // ── Remove organism back to tray ──
  function handleRemoveOrganism(id: string) {
    setLabState((prev) => ({
      ...prev,
      placedOrganisms: prev.placedOrganisms.filter((o) => o !== id),
    }));
  }

  function getPrediction(sceneId: string) {
    return labState.predictions.find((p) => p.sceneId === sceneId);
  }

  function addPrediction(sceneId: string, questionText: string, answer: string) {
    setLabState((prev) => ({
      ...prev,
      predictions: [
        ...prev.predictions.filter((p) => p.sceneId !== sceneId),
        { sceneId, questionText, studentAnswer: answer, wasCorrect: null },
      ],
    }));
    setAnimating(true);
  }

  function goToScene(index: number) {
    const sceneId = SCENE_META[index]?.id ?? "";
    const canNavigate =
      index === 0 ||
      labState.completedScenes.includes(sceneId) ||
      index === labState.currentScene ||
      (index === labState.currentScene + 1 && labState.completedScenes.includes(SCENE_META[labState.currentScene]?.id ?? ""));
    if (!canNavigate) return;
    setLabState((prev) => ({ ...prev, currentScene: index }));
    setAnimating(false);
  }

  function completeCurrentScene() {
    const sceneId = currentSceneMeta.id;
    setLabState((prev) => ({
      ...prev,
      completedScenes: prev.completedScenes.includes(sceneId)
        ? prev.completedScenes
        : [...prev.completedScenes, sceneId],
      currentScene: Math.min(prev.currentScene + 1, SCENE_META.length - 1),
    }));
    setAnimating(false);
  }

  // ── Reflection CER submission ──
  async function handleReflectionSubmit(text: string) {
    try {
      const res = await fetch("/api/score/cer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          rubric: {
            criteria: [
              "States a clear claim about what happens when worms are removed",
              "References a specific cycle (nitrogen, water, or carbon) as evidence",
              "Explains the reasoning connecting the evidence to the claim",
            ],
          },
        }),
      });
      const data = await res.json();
      const score: number = typeof data.score === "number" ? data.score : 0;
      const max: number = typeof data.maxScore === "number" ? data.maxScore : DEFAULT_CER_MAX_SCORE;
      if (score >= max * CER_PROFICIENCY_THRESHOLD) {
        setReflectionFeedback("Excellent CER! You identified that removing the worms would disrupt the nitrogen cycle, preventing decomposition of dead matter and starving plant roots of nitrogen compounds.");
      } else {
        setReflectionFeedback("Good start! Make sure your response includes: a Claim (what happens without worms), Evidence (from a specific cycle you observed), and Reasoning (why that cycle breakdown matters for the whole ecosystem).");
      }
      setLabState((prev) => ({ ...prev, cycleScore: { ...prev.cycleScore, reflect: score } }));
    } catch {
      setReflectionFeedback("Unable to score right now. Key idea: removing worms disrupts the nitrogen cycle — dead matter piles up, nitrogen compounds decrease, and plants lose their key nutrient source.");
    }
    setReflectionSubmitted(true);
    setLabState((prev) => ({
      ...prev,
      completedScenes: prev.completedScenes.includes("reflect") ? prev.completedScenes : [...prev.completedScenes, "reflect"],
    }));
  }

  // ── Active organisms per cycle ──
  const activeOrganismIds: string[] = (() => {
    if (!animating) return [];
    switch (currentSceneMeta.cycleType) {
      case "water": return ["fish", "plant"];
      case "carbon": return ["fish", "cricket", "plant"];
      case "nitrogen": return ["worm", "plant"];
      default: return [];
    }
  })();

  // ── Left panel content (bottle vis changes per scene) ──
  const showAssemblyVis = labState.currentScene === 0;

  return (
    <main className="ia-vh-page flex h-dvh flex-col overflow-hidden" style={{ background: "#0d1e2c", color: "#e2e8f0" }}>
      <BackLink href="/student/learn/unit-7" label="Back to unit" />
      <PageBanner
        title="Bottle Ecosystem Cycles Lab"
        subtitle="Build, populate & explore water, carbon & nitrogen cycles — TEKS B.12A & B.12B"
      >
      </PageBanner>

      <PageContent className="flex-1 overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-6xl gap-0 overflow-hidden" style={{ fontFamily: "Outfit,sans-serif" }}>

          {/* ── Left Sidebar: Scene Progress ── */}
          <aside
            className="hidden w-56 shrink-0 flex-col gap-2 overflow-y-auto p-4 md:flex"
            style={{ borderRight: "1px solid #1e3a52" }}
            aria-label="Scene progress navigation"
          >
            <p style={{ fontFamily: "Outfit,sans-serif", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              Progress
            </p>
            {SCENE_META.map((scene, index) => {
              const isCompleted = labState.completedScenes.includes(scene.id);
              const isCurrent = labState.currentScene === index;
              const isLocked =
                index > 0 &&
                !isCompleted &&
                !isCurrent &&
                !(index === 1 && assemblyComplete) &&
                !(index === labState.currentScene + 1 && labState.completedScenes.includes(SCENE_META[labState.currentScene]?.id ?? ""));

              return (
                <button
                  key={scene.id}
                  type="button"
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${scene.label}${isCompleted ? " (completed)" : isLocked ? " (locked)" : ""}`}
                  onClick={() => !isLocked && goToScene(index)}
                  disabled={isLocked}
                  className="flex items-center gap-3 rounded-xl p-3 text-left transition-all"
                  style={{
                    background: isCurrent ? "#132638" : "transparent",
                    border: `1px solid ${isCurrent ? "#1e3a52" : "transparent"}`,
                    cursor: isLocked ? "not-allowed" : "pointer",
                    opacity: isLocked ? 0.4 : 1,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{isCompleted ? "✅" : scene.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? "#e2e8f0" : "#94a3b8", fontFamily: "Outfit,sans-serif" }}>
                      {scene.label}
                    </div>
                    {scene.cycleType && (
                      <div style={{ fontSize: 10, color: CYCLE_COLORS[scene.cycleType], fontFamily: "Outfit,sans-serif", marginTop: 1 }}>
                        {scene.cycleType} cycle
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            <div className="mt-auto pt-4 space-y-1">
              {["B.12A", "B.12B"].map((code) => (
                <span key={code} className="block rounded-full px-3 py-1 text-center text-xs font-semibold"
                  style={{ background: "#00d4aa22", color: "#00d4aa", border: "1px solid #00d4aa44" }}>
                  TEKS {code}
                </span>
              ))}
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex flex-1 flex-col overflow-hidden md:flex-row">

            {/* Left visualization panel */}
            <div
              className="flex shrink-0 items-center justify-center p-6"
              style={{ borderRight: "1px solid #1e3a52", minWidth: 260 }}
              aria-label="Bottle visualization"
            >
              <div className="flex flex-col items-center gap-4">
                {showAssemblyVis ? (
                  <BottleAssemblySVG assembly={labState.assemblyState} />
                ) : (
                  <>
                    <BottleSVG
                      placedOrganisms={labState.placedOrganisms}
                      activeOrganismIds={activeOrganismIds}
                      cycleType={currentSceneMeta.cycleType}
                      animating={animating}
                    />
                    {currentSceneMeta.cycleType && (
                      <div className="flex flex-wrap justify-center gap-3">
                        {(["water", "carbon", "nitrogen"] as CycleType[]).map((ct) => (
                          <span key={ct} className="rounded-full px-3 py-1 text-xs font-semibold"
                            style={{
                              background: `${CYCLE_COLORS[ct]}22`,
                              color: CYCLE_COLORS[ct],
                              border: `1px solid ${CYCLE_COLORS[ct]}44`,
                              opacity: currentSceneMeta.cycleType === ct ? 1 : 0.35,
                              textTransform: "capitalize",
                            }}>
                            {ct}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Scene content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Mobile scene nav */}
              <div className="mb-4 flex gap-2 overflow-x-auto md:hidden">
                {SCENE_META.map((scene, index) => {
                  const isCompleted = labState.completedScenes.includes(scene.id);
                  const isCurrent = labState.currentScene === index;
                  return (
                    <button key={scene.id} type="button" aria-current={isCurrent ? "step" : undefined}
                      onClick={() => goToScene(index)}
                      className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
                      style={{
                        background: isCurrent ? "#132638" : "transparent",
                        border: `1px solid ${isCurrent ? "#1e3a52" : "transparent"}`,
                        color: isCompleted ? "#00d4aa" : isCurrent ? "#e2e8f0" : "#94a3b8",
                      }}>
                      {isCompleted ? "✅" : scene.icon} {scene.label}
                    </button>
                  );
                })}
              </div>

              {/* Scene 0: Cut & Assemble */}
              {labState.currentScene === 0 && (
                <>
                  <CutAndAssembleScene
                    assembly={labState.assemblyState}
                    onAssemblyChange={handleAssemblyChange}
                  />
                  {assemblyComplete && (
                    <button
                      type="button"
                      aria-label="Proceed to add organisms"
                      onClick={completeCurrentScene}
                      className="mt-4 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
                      style={{ background: "#00d4aa", color: "#0d1e2c" }}
                    >
                      Next: Add Organisms →
                    </button>
                  )}
                </>
              )}

              {/* Scene 1: Add Organisms */}
              {labState.currentScene === 1 && (
                <>
                  <AddOrganismsScene
                    placedOrganisms={labState.placedOrganisms}
                    onPlace={handlePlaceOrganism}
                    onRemove={handleRemoveOrganism}
                    shakeId={shakeOrganismId}
                  />
                  {allOrganismsPlaced && (
                    <button
                      type="button"
                      aria-label="Proceed to Water Cycle"
                      onClick={completeCurrentScene}
                      className="mt-4 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
                      style={{ background: "#00d4aa", color: "#0d1e2c" }}
                    >
                      Next: Water Cycle →
                    </button>
                  )}
                </>
              )}

              {/* Scene 2: Water Cycle */}
              {labState.currentScene === 2 && (
                <>
                  <WaterCycleScene
                    prediction={getPrediction("water")}
                    onPrediction={(answer) => addPrediction("water", "Before the animation plays: Where does the water go after it evaporates from the aquatic zone?", answer)}
                    animating={animating}
                  />
                  {getPrediction("water") && (
                    <button type="button" aria-label="Continue to Carbon Cycle" onClick={completeCurrentScene}
                      className="mt-4 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
                      style={{ background: "#60a5fa", color: "#0d1e2c" }}>
                      Next: Carbon Cycle →
                    </button>
                  )}
                </>
              )}

              {/* Scene 3: Carbon Cycle */}
              {labState.currentScene === 3 && (
                <>
                  <CarbonCycleScene
                    prediction={getPrediction("carbon")}
                    onPrediction={(answer) => addPrediction("carbon", "Identify the producer in this carbon cycle before the arrows appear.", answer)}
                    animating={animating}
                  />
                  {getPrediction("carbon") && (
                    <button type="button" aria-label="Continue to Nitrogen Cycle" onClick={completeCurrentScene}
                      className="mt-4 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
                      style={{ background: "#22c55e", color: "#0d1e2c" }}>
                      Next: Nitrogen Cycle →
                    </button>
                  )}
                </>
              )}

              {/* Scene 4: Nitrogen Cycle */}
              {labState.currentScene === 4 && (
                <>
                  <NitrogenCycleScene
                    prediction={getPrediction("nitrogen")}
                    onPrediction={(answer) => addPrediction("nitrogen", "Rank these nitrogen cycle events from first to last.", answer)}
                    animating={animating}
                  />
                  {getPrediction("nitrogen") && (
                    <button type="button" aria-label="Continue to Reflect and Connect" onClick={completeCurrentScene}
                      className="mt-4 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
                      style={{ background: "#f59e0b", color: "#0d1e2c" }}>
                      Next: Reflect &amp; Connect →
                    </button>
                  )}
                </>
              )}

              {/* Scene 5: Reflect & Connect */}
              {labState.currentScene === 5 && (
                <ReflectScene
                  predictions={labState.predictions}
                  submitted={reflectionSubmitted}
                  feedback={reflectionFeedback}
                  onSubmit={handleReflectionSubmit}
                />
              )}
            </div>
          </div>
        </div>
      </PageContent>

      <StudentFloatingDock />
    </main>
  );
}
