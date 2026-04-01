// @ts-nocheck
"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const T = {
  bg: "#0d1e2c",
  surface: "#132638",
  raised: "#1a3148",
  overlay: "#213d58",
  border: "#1e3f5a",
  borderSoft: "#162f45",
  teal: "#00d4aa",
  tealDim: "rgba(0,212,170,0.15)",
  tealGlow: "0 0 16px rgba(0,212,170,0.3)",
  amber: "#f5a623",
  amberDim: "rgba(245,166,35,0.15)",
  coral: "#ff6b6b",
  success: "#34d399",
  warning: "#fbbf24",
  info: "#60a5fa",
  violet: "#a78bfa",
  pink: "#f472b6",
  text: "#e8f4f0",
  textSub: "#9abcb0",
  textMuted: "#5a8070",
  font: "'DynaPuff',sans-serif",
  mono: "'JetBrains Mono',monospace",
};

const lerp = (a, b, t) => a + (b - a) * t;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const rand = (lo, hi) => Math.random() * (hi - lo) + lo;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const ENZ_R = 32;
const SUB_R = 13;
const BIND_D = ENZ_R + 4;
const BIND_FRAMES = 110;

function Badge({ children, color }) {
  const c = color || T.teal;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 999,
        background: c + "22",
        border: "1px solid " + c + "44",
        color: c,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

function Chip({ label, value, color }) {
  return (
    <div
      style={{
        background: T.raised,
        border: "1px solid " + T.border,
        borderRadius: 10,
        padding: "8px 12px",
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: T.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 700,
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: T.mono,
          fontSize: 15,
          fontWeight: 700,
          color: color || T.teal,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Slider({
  icon,
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  hint,
  valueColor,
}) {
  return (
    <div style={{ marginBottom: 15 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 12, color: T.text }}>
          {icon} {label}
        </span>
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 12,
            fontWeight: 700,
            color: valueColor || T.teal,
          }}
        >
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: T.teal, cursor: "pointer" }}
      />
      {hint ? (
        <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}

function calcFactors(sm, tc, ph) {
  const subFactor = sm / (20 + sm);
  let tempFactor = Math.exp(-0.005 * (tc - 37) * (tc - 37));
  if (tc > 60) tempFactor *= Math.max(0, 1 - (tc - 60) / 20);
  const pHFactor = Math.exp(-0.3 * (ph - 7.0) * (ph - 7.0));
  const distortion = Math.max(
    tc > 45 ? clamp((tc - 45) / 35, 0, 1) : 0,
    Math.abs(ph - 7) > 2 ? clamp((Math.abs(ph - 7) - 2) / 5, 0, 1) : 0,
  );
  return {
    subFactor,
    tempFactor,
    pHFactor,
    distortion,
    combined: subFactor * tempFactor * pHFactor,
  };
}

function drawEnzymeA(ctx, x, y, r, distortion, bound, fill, stroke) {
  const d = distortion;
  const baseOpen = 0.48;
  const mouthOpen = baseOpen + d * 0.55;
  const mouthShift = d * 0.6;

  ctx.save();
  ctx.translate(x, y);
  if (d > 0) ctx.rotate(d * Math.sin(Date.now() * 0.001) * 0.07);

  ctx.shadowBlur = bound ? 22 : 10;
  ctx.shadowColor = bound ? stroke + "cc" : stroke + "55";

  ctx.beginPath();
  const startAngle = mouthShift + mouthOpen;
  const endAngle = Math.PI * 2 + mouthShift - mouthOpen;
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, r, startAngle, endAngle, false);
  ctx.closePath();

  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2.5;
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (d < 0.5) {
    ctx.fillStyle = stroke + "cc";
    ctx.font = "600 7px " + T.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("active site", 0, -r - 4);
    ctx.textBaseline = "alphabetic";
  }

  if (d > 0.45) {
    ctx.fillStyle = T.coral + "cc";
    ctx.font = "bold 7px " + T.mono;
    ctx.textAlign = "center";
    ctx.fillText("DENATURED", 0, -r - 7);
  }

  ctx.restore();
}

function drawEnzymeB(ctx, x, y, r, distortion, bound, fill, stroke) {
  const d = distortion;
  const notchR = r * 0.4 * (1 - d * 0.75);
  const iy = -Math.sqrt(Math.max(0, r * r - notchR * notchR));
  const ix = notchR;
  const bodyAngleR = Math.atan2(iy, ix);
  const bodyAngleL = Math.atan2(iy, -ix);
  const ncy = iy;
  const notchAngleR = Math.atan2(iy - ncy, ix);
  const notchAngleL = Math.atan2(iy - ncy, -ix);

  ctx.save();
  ctx.translate(x, y);
  if (d > 0) ctx.rotate(d * Math.sin(Date.now() * 0.001) * 0.06);
  ctx.shadowBlur = bound ? 22 : 10;
  ctx.shadowColor = bound ? stroke + "cc" : stroke + "55";

  ctx.beginPath();
  ctx.arc(0, 0, r, bodyAngleR, bodyAngleL, false);
  ctx.arc(0, ncy, notchR, notchAngleL, notchAngleR, true);
  ctx.closePath();

  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2.5;
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(0, ncy, notchR - 2, notchAngleL, notchAngleR, true);
  ctx.lineTo(0, ncy);
  ctx.closePath();
  ctx.fillStyle = bound ? stroke + "44" : stroke + "22";
  ctx.fill();

  if (d < 0.5) {
    ctx.fillStyle = stroke + "cc";
    ctx.font = "600 7px " + T.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("active site", 0, -r - 4);
    ctx.textBaseline = "alphabetic";
  }

  if (d > 0.45) {
    ctx.fillStyle = T.coral + "cc";
    ctx.font = "bold 7px " + T.mono;
    ctx.textAlign = "center";
    ctx.fillText("DENATURED", 0, r + 14);
  }

  ctx.restore();
}

function drawSubstrateA(ctx, x, y, r, isProduct, alpha, angle) {
  const color = isProduct ? T.success : T.amber;
  const size = r * 0.7;
  const rot = angle !== undefined ? angle : 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha !== undefined && alpha !== null ? alpha : 1;
  ctx.shadowBlur = isProduct ? 14 : 5;
  ctx.shadowColor = color + "88";

  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size * 0.55, -size * 0.8);
  ctx.lineTo(-size * 0.55, size * 0.8);
  ctx.closePath();

  ctx.fillStyle = isProduct ? T.success + "55" : color + "44";
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.font = "bold 7px " + T.font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("A", -size * 0.1, 0);
  ctx.restore();
}

function drawSubstrateB(ctx, x, y, r, isProduct, alpha, angle) {
  const color = isProduct ? T.success : T.violet;
  const nr = ENZ_R * 0.38;
  const rot = angle !== undefined ? angle : 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha !== undefined && alpha !== null ? alpha : 1;
  ctx.shadowBlur = isProduct ? 14 : 5;
  ctx.shadowColor = color + "88";

  ctx.beginPath();
  ctx.arc(0, 0, nr, Math.PI, 0, false);
  ctx.closePath();

  ctx.fillStyle = isProduct ? T.success + "55" : color + "44";
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.font = "bold 7px " + T.font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("B", 0, -nr * 0.45);
  ctx.restore();
}

function drawEnzyme(ctx, enz, distortion) {
  if (enz.type === "A") {
    drawEnzymeA(
      ctx,
      enz.x,
      enz.y,
      ENZ_R,
      distortion,
      enz.bound,
      T.raised,
      enz.bound ? T.amber : T.teal,
    );
  } else {
    drawEnzymeB(
      ctx,
      enz.x,
      enz.y,
      ENZ_R,
      distortion,
      enz.bound,
      T.raised,
      enz.bound ? T.violet : T.violet,
    );
  }
}

function drawSubstrate(ctx, s) {
  const alpha = s.productAlpha !== undefined ? s.productAlpha : 1;
  const angle = s.angle !== undefined ? s.angle : 0;
  if (s.type === "A")
    drawSubstrateA(ctx, s.x, s.y, ENZ_R * 0.95, s.isProduct, alpha, angle);
  else drawSubstrateB(ctx, s.x, s.y, ENZ_R, s.isProduct, alpha, angle);
}

function LockKeyDiagram({ bondMode, binding }) {
  const ref = useRef(null);
  const raf = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const ER = 28;
    const CX = 100;
    const MOUTH_H = 0.48;
    const MOUTH_HALF = ER * Math.sin(MOUTH_H);

    function tri(cx, cy, depth, halfH, color, alpha, rot) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot || 0);
      ctx.globalAlpha = alpha || 1;
      ctx.beginPath();
      ctx.moveTo(depth, 0);
      ctx.lineTo(-depth * 0.5, -halfH);
      ctx.lineTo(-depth * 0.5, halfH);
      ctx.closePath();
      ctx.fillStyle = color + "55";
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    function triWithMidline(cx, cy, depth, halfH, color, alpha, rot) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot || 0);
      ctx.globalAlpha = alpha || 1;
      ctx.beginPath();
      ctx.moveTo(depth, 0);
      ctx.lineTo(-depth * 0.5, -halfH);
      ctx.lineTo(-depth * 0.5, halfH);
      ctx.closePath();
      ctx.fillStyle = color + "55";
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = color + "cc";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(depth * 0.85, 0);
      ctx.lineTo(-depth * 0.5, 0);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    function triHalf(cx, cy, depth, halfH, color, alpha, rot, sign) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot || 0);
      ctx.globalAlpha = alpha || 1;
      ctx.beginPath();
      ctx.moveTo(depth, 0);
      ctx.lineTo(-depth * 0.5, halfH * sign);
      ctx.lineTo(-depth * 0.5, 0);
      ctx.closePath();
      ctx.fillStyle = color + "55";
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    const W2 = 200;
    const H2 = 380;
    const dpr2 = window.devicePixelRatio || 1;
    canvas.width = W2 * dpr2;
    canvas.height = H2 * dpr2;
    canvas.style.width = W2 + "px";
    canvas.style.height = H2 + "px";
    ctx.scale(dpr2, dpr2);

    const CYCLE = 420;
    const P0_END = 100;
    const P1_END = 240;
    const P2_END = 340;

    let frame = 0;
    const loop = () => {
      raf.current = requestAnimationFrame(loop);
      frame++;
      ctx.clearRect(0, 0, W2, H2);
      ctx.fillStyle = T.surface;
      ctx.fillRect(0, 0, W2, H2);

      const TD = ER * 0.52;
      const TH = MOUTH_HALF * 0.65;
      const t = frame % CYCLE;

      function stepLabel(label, cy, color) {
        ctx.fillStyle = color || T.textSub;
        ctx.font = "600 10px " + T.font;
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(label, CX, cy - ER - 12);
      }

      const Y1 = 68;
      const Y2 = 190;
      const Y3 = 318;
      const EX = CX - 12;

      ctx.fillStyle = T.textMuted;
      ctx.font = "13px " + T.font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("↓", CX, Y1 + ER + 16);
      ctx.fillText("↓", CX, Y2 + ER + 16);
      ctx.textBaseline = "alphabetic";

      const DOCK_X = EX + ER + TD * 0.48;
      const START_X = EX + ER + TD * 0.58 + 6;
      const EXIT_START = EX + ER + 4;

      if (bondMode === "break") {
        stepLabel("① Substrate approaches", Y1);
        drawEnzymeA(ctx, EX, Y1, ER, 0, false, T.raised, T.teal);
        const bob1 = Math.sin(t * 0.04) * 5;
        triWithMidline(START_X + bob1, Y1, TD, TH, T.amber, 1, Math.PI);

        stepLabel("② Enzyme strains the bond", Y2);
        drawEnzymeA(ctx, EX, Y2, ER, 0, true, T.raised, T.amber);

        if (t < P0_END) {
          triWithMidline(START_X, Y2, TD, TH, T.amber, 0.25, Math.PI);
        } else if (t < P1_END) {
          const p = clamp((t - P0_END) / (P1_END - P0_END), 0, 1);

          if (p < 0.25) {
            const s = p / 0.25;
            triWithMidline(
              lerp(START_X, DOCK_X, s),
              Y2,
              TD,
              TH,
              T.amber,
              1,
              Math.PI,
            );
          } else if (p < 0.55) {
            const strain = (p - 0.25) / 0.3;
            const pulse = 0.6 + 0.4 * Math.abs(Math.sin(strain * Math.PI * 6));
            triWithMidline(DOCK_X, Y2, TD, TH, T.amber, pulse, Math.PI);
          } else {
            const crack = (p - 0.55) / 0.45;
            const sepV = crack * TH * 2.4;
            const slideOut = crack * TD * 0.5;
            triHalf(
              DOCK_X + slideOut,
              Y2 - sepV,
              TD,
              TH,
              T.amber,
              1,
              Math.PI,
              1,
            );
            triHalf(
              DOCK_X + slideOut,
              Y2 + sepV,
              TD,
              TH,
              T.amber,
              1,
              Math.PI,
              -1,
            );
          }

          ctx.globalAlpha = Math.min(1, p * 5);
          ctx.fillStyle = T.coral;
          ctx.font = "bold 9px " + T.font;
          ctx.textAlign = "center";
          ctx.fillText("✂ Breaking", CX, Y2 + ER + 14);
          ctx.globalAlpha = 1;
        }

        stepLabel("③ Two products released", Y3);
        drawEnzymeA(ctx, EX, Y3, ER, 0, false, T.raised, T.teal);

        if (t >= P1_END && t < P2_END) {
          const p = clamp((t - P1_END) / (P2_END - P1_END), 0, 1);
          const flyX = EXIT_START + p * 55;
          const sepV = TH * 0.4 + p * TH * 2.2;
          const alpha = p < 0.7 ? 1 : clamp(1 - (p - 0.7) / 0.3, 0, 1);
          triHalf(flyX, Y3 - sepV, TD, TH, T.success, alpha, 0, 1);
          triHalf(flyX + 2, Y3 + sepV, TD, TH, T.success, alpha, 0, -1);
        }
      } else {
        stepLabel("① Two pieces approach", Y1);
        drawEnzymeA(ctx, EX, Y1, ER, 0, false, T.raised, T.teal);
        const bob1 = Math.sin(t * 0.04) * 5;
        triHalf(
          START_X + bob1,
          Y1 - TH * 0.65,
          TD,
          TH,
          T.violet,
          1,
          Math.PI,
          1,
        );
        triHalf(
          START_X + bob1,
          Y1 + TH * 0.65,
          TD,
          TH,
          T.violet,
          1,
          Math.PI,
          -1,
        );

        stepLabel("② Enzyme joins the bond", Y2);
        drawEnzymeA(ctx, EX, Y2, ER, 0, true, T.raised, T.amber);

        if (t >= P0_END && t < P1_END) {
          const p = clamp((t - P0_END) / (P1_END - P0_END), 0, 1);
          if (p < 0.28) {
            const s = p / 0.28;
            const tx = lerp(START_X, DOCK_X, s);
            triHalf(tx, Y2 - TH * 0.65, TD, TH, T.violet, 1, Math.PI, 1);
            triHalf(tx, Y2 + TH * 0.65, TD, TH, T.violet, 1, Math.PI, -1);
          } else if (p < 0.65) {
            const s = (p - 0.28) / 0.37;
            const gap = TH * 0.65 * (1 - s);
            triHalf(DOCK_X, Y2 - gap, TD, TH, T.violet, 1, Math.PI, 1);
            triHalf(DOCK_X, Y2 + gap, TD, TH, T.violet, 1, Math.PI, -1);
          } else {
            triWithMidline(DOCK_X, Y2, TD, TH, T.success, 1, Math.PI);
          }

          ctx.globalAlpha = Math.min(1, p * 5);
          ctx.fillStyle = T.success;
          ctx.font = "bold 9px " + T.font;
          ctx.textAlign = "center";
          ctx.fillText("🔗 Joining", CX, Y2 + ER + 14);
          ctx.globalAlpha = 1;
        }

        stepLabel("③ Joined product released", Y3);
        drawEnzymeA(ctx, EX, Y3, ER, 0, false, T.raised, T.teal);

        if (t >= P1_END && t < P2_END) {
          const p = clamp((t - P1_END) / (P2_END - P1_END), 0, 1);
          const flyX = EXIT_START + p * 55;
          const alpha = p < 0.7 ? 1 : clamp(1 - (p - 0.7) / 0.3, 0, 1);
          triWithMidline(flyX, Y3, TD, TH, T.success, alpha, 0);
        }
      }
    };

    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [bondMode, binding]);

  return (
    <canvas
      ref={ref}
      style={{ display: "block", borderRadius: 10, width: "100%" }}
    />
  );
}

function ParticleWorld({
  substrate,
  tempC,
  pH,
  onRateUpdate,
  width = 610,
  height = 310,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const paramsRef = useRef({ substrate, tempC, pH });

  useEffect(() => {
    paramsRef.current = { substrate, tempC, pH };
  }, [substrate, tempC, pH]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const enzymes = [
      {
        x: width * 0.18,
        y: height * 0.38,
        vx: 0,
        vy: 0,
        type: "A",
        bound: false,
        boundSub: null,
        bindTimer: 0,
        dragging: false,
        pulse: rand(0, 6.28),
        id: 0,
      },
      {
        x: width * 0.45,
        y: height * 0.6,
        vx: 0,
        vy: 0,
        type: "A",
        bound: false,
        boundSub: null,
        bindTimer: 0,
        dragging: false,
        pulse: rand(0, 6.28),
        id: 1,
      },
      {
        x: width * 0.67,
        y: height * 0.32,
        vx: 0,
        vy: 0,
        type: "B",
        bound: false,
        boundSub: null,
        bindTimer: 0,
        dragging: false,
        pulse: rand(0, 6.28),
        id: 2,
      },
      {
        x: width * 0.88,
        y: height * 0.58,
        vx: 0,
        vy: 0,
        type: "B",
        bound: false,
        boundSub: null,
        bindTimer: 0,
        dragging: false,
        pulse: rand(0, 6.28),
        id: 3,
      },
    ];

    const makeSub = (type) => ({
      x: rand(20, width - 20),
      y: rand(20, height - 20),
      vx: rand(-0.6, 0.6),
      vy: rand(-0.6, 0.6),
      angle: rand(0, Math.PI * 2),
      angularV: rand(-0.018, 0.018),
      type: type || (Math.random() < 0.5 ? "A" : "B"),
      isProduct: false,
      productAlpha: 1,
      id: Math.random(),
      dragging: false,
    });
    const substrates = Array.from({ length: 10 }, () => makeSub());

    let dragTarget = null;
    let dragOX = 0;
    let dragOY = 0;
    let totalA = 0;
    let totalB = 0;
    let recentRxns = [];
    let frame = 0;
    let anyBinding = false;
    let lastBindType = "A";

    const getPos = (e) => {
      const r = canvas.getBoundingClientRect();
      const sx = width / r.width;
      const sy = height / r.height;
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
      return { x: cx * sx, y: cy * sy };
    };

    const onDown = (e) => {
      e.preventDefault();
      const p = getPos(e);
      for (const enz of enzymes) {
        if (dist(p, enz) < ENZ_R + 10) {
          dragTarget = { obj: enz };
          dragOX = p.x - enz.x;
          dragOY = p.y - enz.y;
          enz.dragging = true;
          return;
        }
      }
      for (const s of substrates) {
        if (!s.isProduct && dist(p, s) < SUB_R + 10) {
          dragTarget = { obj: s };
          dragOX = p.x - s.x;
          dragOY = p.y - s.y;
          s.dragging = true;
          return;
        }
      }
    };

    const onMove = (e) => {
      e.preventDefault();
      if (!dragTarget) return;
      const p = getPos(e);
      dragTarget.obj.x = p.x - dragOX;
      dragTarget.obj.y = p.y - dragOY;
      dragTarget.obj.vx = 0;
      dragTarget.obj.vy = 0;
    };

    const onUp = () => {
      if (dragTarget) {
        dragTarget.obj.dragging = false;
        dragTarget = null;
      }
    };

    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchstart", onDown, { passive: false });
    canvas.addEventListener("touchmove", onMove, { passive: false });
    canvas.addEventListener("touchend", onUp);

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      frame++;
      const { substrate: sm, tempC: tc, pH: ph } = paramsRef.current;
      const { subFactor, distortion, combined } = calcFactors(sm, tc, ph);
      const speedMult = 0.5 + subFactor * 1.3;
      const bindProb = combined * 0.055;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = T.bg;
      ctx.fillRect(0, 0, width, height);

      for (const s of substrates) {
        if (s.isProduct) {
          s.productAlpha -= 0.016;
          if (s.productAlpha <= 0) {
            s.isProduct = false;
            s.productAlpha = 1;
            s.x = rand(20, width - 20);
            s.y = rand(20, height - 20);
            s.vx = rand(-0.6, 0.6) * speedMult;
            s.vy = rand(-0.6, 0.6) * speedMult;
          }
          drawSubstrate(ctx, s);
          continue;
        }
        if (s.dragging) {
          drawSubstrate(ctx, s);
          continue;
        }
        s.vx += rand(-0.06, 0.06) * speedMult;
        s.vy += rand(-0.06, 0.06) * speedMult;
        const spd = Math.hypot(s.vx, s.vy);
        const maxS = 0.9 * speedMult;
        if (spd > maxS) {
          s.vx = (s.vx / spd) * maxS;
          s.vy = (s.vy / spd) * maxS;
        }
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < SUB_R) {
          s.x = SUB_R;
          s.vx = Math.abs(s.vx) * 0.95;
        }
        if (s.x > width - SUB_R) {
          s.x = width - SUB_R;
          s.vx = -Math.abs(s.vx) * 0.95;
        }
        if (s.y < SUB_R) {
          s.y = SUB_R;
          s.vy = Math.abs(s.vy) * 0.95;
        }
        if (s.y > height - SUB_R) {
          s.y = height - SUB_R;
          s.vy = -Math.abs(s.vy) * 0.95;
        }
        s.angle += s.angularV;
        drawSubstrate(ctx, s);
      }

      anyBinding = false;
      const now = Date.now();

      for (const enz of enzymes) {
        if (enz.bound && enz.boundSub) {
          enz.bindTimer++;
          anyBinding = true;
          lastBindType = enz.type;

          const enzB_ncy = -ENZ_R * 0.9165;
          const dockX = enz.type === "A" ? enz.x + ENZ_R * 0.74 : enz.x;
          const dockY = enz.type === "A" ? enz.y : enz.y + enzB_ncy;
          const dockAngle = enz.type === "A" ? Math.PI : Math.PI;

          enz.boundSub.x = lerp(enz.boundSub.x, dockX, 0.28);
          enz.boundSub.y = lerp(enz.boundSub.y, dockY, 0.28);
          let aDiff = dockAngle - enz.boundSub.angle;
          while (aDiff > Math.PI) aDiff -= Math.PI * 2;
          while (aDiff < -Math.PI) aDiff += Math.PI * 2;
          enz.boundSub.angle += aDiff * 0.18;
          enz.boundSub.vx = 0;
          enz.boundSub.vy = 0;

          if (enz.bindTimer > BIND_FRAMES) {
            enz.boundSub.isProduct = true;
            enz.boundSub.productAlpha = 1;
            enz.boundSub.vx = rand(-0.8, 0.8);
            enz.boundSub.vy = rand(-0.8, 0.8);
            enz.bound = false;
            enz.boundSub = null;
            enz.bindTimer = 0;
            recentRxns.push({ t: now, type: enz.type });
            if (enz.type === "A") totalA++;
            else totalB++;
          }
        } else {
          if (!enz.dragging) {
            enz.vy += Math.sin(frame * 0.006 + enz.pulse) * 0.01;
            enz.vx += Math.sin(frame * 0.01 + enz.pulse * 1.4) * 0.014;
            enz.vx *= 0.97;
            enz.vy *= 0.97;
            enz.x += enz.vx;
            enz.y += enz.vy;
            enz.x = clamp(enz.x, ENZ_R + 5, width - ENZ_R - 5);
            enz.y = clamp(enz.y, ENZ_R + 5, height - ENZ_R - 5);
          }

          if (distortion < 0.88) {
            for (const s of substrates) {
              if (s.isProduct || s.dragging) continue;
              const d2 = dist(enz, s);
              const match = s.type === enz.type;
              if (match && d2 < BIND_D + 8 && Math.random() < bindProb) {
                enz.bound = true;
                enz.boundSub = s;
                s.vx = 0;
                s.vy = 0;
                break;
              }
            }
          }
        }

        drawEnzyme(ctx, enz, distortion);
      }

      const target = 4 + Math.round(subFactor * 11);
      while (substrates.length < target) substrates.push(makeSub());
      while (substrates.length > target) {
        const fi = substrates.findIndex(
          (s) => !s.isProduct && !enzymes.some((e) => e.boundSub === s),
        );
        if (fi >= 0) substrates.splice(fi, 1);
        else break;
      }

      const windowMs = 3000;
      recentRxns = recentRxns.filter((r) => now - r.t < windowMs);
      const rate = Math.min(
        100,
        ((recentRxns.length / (windowMs / 1000)) * 100) / 3,
      );
      onRateUpdate(rate, totalA, totalB, distortion, anyBinding, lastBindType);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("touchstart", onDown);
      canvas.removeEventListener("touchmove", onMove);
      canvas.removeEventListener("touchend", onUp);
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        borderRadius: 12,
        cursor: "grab",
        width: "100%",
      }}
      title="Drag molecules — only matching shapes bind!"
    />
  );
}

function LiveRateChart({ rateHistory, width = 820, height = 110 }) {
  const ref = useRef(null);
  const histRef = useRef(rateHistory);
  const rafRef = useRef(null);

  useEffect(() => {
    histRef.current = rateHistory;
  }, [rateHistory]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const p = { t: 10, r: 14, b: 24, l: 36 };
    const W = width - p.l - p.r;
    const H = height - p.t - p.b;

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const rateHistory = histRef.current;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = T.surface;
      ctx.fillRect(0, 0, width, height);

      [0, 50, 100].forEach((v) => {
        const y = p.t + H - (H * v) / 100;
        ctx.strokeStyle = T.border;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(p.l, y);
        ctx.lineTo(p.l + W, y);
        ctx.stroke();
      });

      if (rateHistory.length < 2) return;

      const maxLen = 200;
      const data = rateHistory.slice(-maxLen);

      ctx.beginPath();
      data.forEach((v, i) => {
        const x = p.l + (i / (maxLen - 1)) * W;
        const y = p.t + H - (H * v) / 100;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = T.teal;
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height]);

  return (
    <canvas
      ref={ref}
      style={{ display: "block", borderRadius: 10, width: "100%" }}
    />
  );
}

export default function EnzymeKineticsLabV4() {
  const [substrate, setSubstrate] = useState(20);
  const [temp, setTemp] = useState(25);
  const [pH, setPH] = useState(7.0);
  const [rate, setRate] = useState(0);
  const [rxnA, setRxnA] = useState(0);
  const [rxnB, setRxnB] = useState(0);
  const [distort, setDistort] = useState(0);
  const [binding, setBinding] = useState(false);
  const [bindType, setBindType] = useState("A");
  const [rateHist, setRateHist] = useState([]);
  const [pOpen, setPOpen] = useState(false);
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [bondMode, setBondMode] = useState("break");

  const handleUpdate = useCallback((r, ra, rb, d, bnd, bt) => {
    setRate(r);
    setRxnA(ra);
    setRxnB(rb);
    setDistort(d);
    setBinding(bnd);
    setBindType(bt);
    setRateHist((h) => {
      const n = [...h, Math.round(r)];
      return n.length > 200 ? n.slice(-200) : n;
    });
  }, []);

  const f = calcFactors(substrate, temp, pH);
  const tempColor =
    temp >= 30 && temp <= 44
      ? T.success
      : temp >= 45 && temp <= 59
        ? T.warning
        : T.coral;
  const pHColor =
    pH >= 6 && pH <= 8
      ? T.success
      : (pH >= 5 && pH < 6) || (pH > 8 && pH <= 9)
        ? T.warning
        : T.coral;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        fontFamily: T.font,
        color: T.text,
      }}
    >
      <style>{`*{box-sizing:border-box;margin:0;padding:0}input[type=range]{cursor:pointer;height:4px;border-radius:99px}`}</style>

      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 20px",
          height: 50,
          background: T.surface + "ee",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid " + T.border,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "linear-gradient(135deg," + T.teal + ",#0099aa)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            boxShadow: T.tealGlow,
          }}
        >
          ⚡
        </div>
        <span
          style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.3px" }}
        >
          Bio<span style={{ color: T.teal }}>Spark</span>
        </span>
        <span style={{ fontSize: 11, color: T.textMuted }}>
          / Enzyme Kinetics - Lock & Key Specificity
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <Badge color={T.teal}>B.11B</Badge>
          <Badge color={T.violet}>Lock &amp; Key</Badge>
        </div>
      </nav>

      <div style={{ maxWidth: 930, margin: "0 auto", padding: "14px 14px" }}>
        <div
          style={{
            background: T.surface,
            border: "1px solid " + T.amber + "55",
            borderRadius: 14,
            padding: 16,
            marginBottom: 12,
            boxShadow: "0 0 18px rgba(245,166,35,0.1)",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
            Enzyme Kinetics Lab
          </div>
          <p
            style={{
              fontSize: 12,
              color: T.textSub,
              lineHeight: 1.65,
              marginBottom: 10,
            }}
          >
            Explore lock-and-key specificity with two enzyme families, substrate
            matching, and denaturation effects.
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button
              onClick={() => setBondMode("break")}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border:
                  "1px solid " +
                  (bondMode === "break" ? T.amber + "88" : T.border),
                background:
                  bondMode === "break" ? T.amber + "22" : "transparent",
                color: bondMode === "break" ? T.amber : T.textMuted,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              ✂ Breaking
            </button>
            <button
              onClick={() => setBondMode("join")}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border:
                  "1px solid " +
                  (bondMode === "join" ? T.violet + "88" : T.border),
                background:
                  bondMode === "join" ? T.violet + "22" : "transparent",
                color: bondMode === "join" ? T.violet : T.textMuted,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              🔗 Joining
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 200px",
            gap: 12,
            marginBottom: 12,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: T.surface,
              border: "1px solid " + T.border,
              borderRadius: 14,
              padding: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Molecular World
                </span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {distort > 0.4 ? (
                  <Badge color={T.coral}>Denatured</Badge>
                ) : null}
                <Badge
                  color={
                    rate > 85 ? T.success : rate > 40 ? T.warning : T.textMuted
                  }
                >
                  {rate.toFixed(0)} AU/s
                </Badge>
              </div>
            </div>
            <ParticleWorld
              substrate={substrate}
              tempC={temp}
              pH={pH}
              onRateUpdate={handleUpdate}
              width={680}
              height={310}
            />
          </div>

          <div
            style={{
              background: T.surface,
              border: "1px solid " + T.violet + "44",
              borderRadius: 14,
              padding: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.violet,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Reaction Steps
            </div>
            <LockKeyDiagram bondMode={bondMode} binding={binding} />
          </div>
        </div>

        <div
          style={{
            background: T.surface,
            border: "1px solid " + T.border,
            borderRadius: 14,
            padding: 14,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Live Reaction Rate
            </span>
          </div>
          <LiveRateChart rateHistory={rateHist} width={860} height={110} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "240px 1fr",
            gap: 12,
            marginBottom: 12,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: T.surface,
              border: "1px solid " + T.border,
              borderRadius: 14,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: T.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 14,
              }}
            >
              Adjust Conditions
            </div>
            <Slider
              icon="🧪"
              label="Substrate"
              value={substrate}
              min={1}
              max={100}
              step={1}
              onChange={setSubstrate}
              display={substrate + " mM"}
              valueColor={T.teal}
              hint="More molecules = more collisions"
            />
            <Slider
              icon="🌡️"
              label="Temperature"
              value={temp}
              min={0}
              max={80}
              step={1}
              onChange={setTemp}
              display={temp + "°C"}
              valueColor={tempColor}
              hint={
                temp > 60 ? "High heat warps active site" : "Optimal near 37°C"
              }
            />
            <Slider
              icon="⚗️"
              label="pH"
              value={pH}
              min={0}
              max={14}
              step={0.1}
              onChange={(v) => setPH(Math.round(v * 10) / 10)}
              display={"pH " + pH.toFixed(1)}
              valueColor={pHColor}
              hint="Neutral preserves shape"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 8,
              }}
            >
              <Chip
                label="Rate"
                value={rate.toFixed(0) + " AU"}
                color={rate > 85 ? T.success : rate > 40 ? T.warning : T.coral}
              />
              <Chip label="Rxns A" value={rxnA} color={T.teal} />
              <Chip label="Rxns B" value={rxnB} color={T.violet} />
              <Chip
                label="Shape"
                value={
                  distort > 0.6
                    ? "Denatured"
                    : distort > 0.2
                      ? "Warping"
                      : "Intact"
                }
                color={
                  distort > 0.6
                    ? T.coral
                    : distort > 0.2
                      ? T.warning
                      : T.success
                }
              />
            </div>

            <div
              style={{
                background: T.surface,
                border: "1px solid " + T.border,
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: T.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 10,
                }}
              >
                Factor contributions
              </div>
              {[
                {
                  label: "Substrate availability",
                  pct: Math.round(f.subFactor * 100),
                  color: T.teal,
                },
                {
                  label: "Temperature fitness",
                  pct: Math.round(f.tempFactor * 100),
                  color: T.amber,
                },
                {
                  label: "pH fitness",
                  pct: Math.round(f.pHFactor * 100),
                  color: T.info,
                },
              ].map(({ label, pct, color }) => (
                <div key={label} style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 3,
                    }}
                  >
                    <span style={{ fontSize: 11, color: T.textSub }}>
                      {label}
                    </span>
                    <span style={{ fontFamily: T.mono, fontSize: 11, color }}>
                      {pct}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 5,
                      background: T.raised,
                      borderRadius: 99,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: pct + "%",
                        background: color,
                        borderRadius: 99,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            background: T.surface,
            border: "1px solid " + T.border,
            borderRadius: 14,
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            <Badge color={T.teal}>B.11B</Badge>
            <Badge color={T.violet}>Lock &amp; Key Specificity</Badge>
          </div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: T.text,
              marginBottom: 8,
            }}
          >
            What happened to binding rate at extreme conditions? Explain with
            active-site shape.
          </p>
          {!submitted ? (
            <>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={3}
                placeholder="Describe what you observed..."
                style={{
                  width: "100%",
                  background: T.raised,
                  border: "1px solid " + T.border,
                  borderRadius: 8,
                  padding: "9px 12px",
                  color: T.text,
                  fontFamily: T.font,
                  fontSize: 12,
                  lineHeight: 1.6,
                  outline: "none",
                  marginBottom: 8,
                }}
              />
              <button
                onClick={() =>
                  reflection.trim().length > 10 && setSubmitted(true)
                }
                style={{
                  padding: "8px 20px",
                  borderRadius: 999,
                  border: "none",
                  background: reflection.trim().length > 10 ? T.teal : T.raised,
                  color:
                    reflection.trim().length > 10 ? "#0d1e2c" : T.textMuted,
                  fontFamily: T.font,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Submit Reflection
              </button>
            </>
          ) : (
            <div
              style={{
                padding: "10px 14px",
                background: T.teal + "15",
                border: "1px solid " + T.teal + "44",
                borderRadius: 10,
                fontSize: 12,
                color: T.teal,
                fontWeight: 600,
              }}
            >
              Reflection submitted.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
