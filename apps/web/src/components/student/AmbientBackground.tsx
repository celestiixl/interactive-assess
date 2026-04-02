"use client";

import { useEffect, useRef } from "react";

const PARTICLE_COLORS = ["#00d4aa", "#ff6b6b", "#f5a623", "#b8f7e8"];

export default function AmbientBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < 16; i++) {
      const p = document.createElement("div");
      const size = Math.random() * 4 + 2;
      const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
      const left = Math.random() * 100;
      const duration = Math.random() * 15 + 10;
      const delay = Math.random() * 20;

      p.style.cssText = [
        `position:absolute`,
        `width:${size}px`,
        `height:${size}px`,
        `background:${color}`,
        `border-radius:50%`,
        `left:${left}%`,
        `bottom:-10px`,
        `opacity:0`,
        `animation:bsParticleFloat ${duration}s ${delay}s infinite linear`,
        `pointer-events:none`,
      ].join(";");

      container.appendChild(p);
      particles.push(p);
    }

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes bsBlobDrift1 {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(40px, 30px) scale(1.05); }
          66%  { transform: translate(-20px, 50px) scale(0.97); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes bsBlobDrift2 {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(-50px, -40px) scale(1.04); }
          66%  { transform: translate(30px, -20px) scale(0.96); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes bsParticleFloat {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          10%  { opacity: 0.7; }
          90%  { opacity: 0.3; }
          100% { transform: translateY(-100vh) translateX(40px); opacity: 0; }
        }
        @keyframes bsPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>

      {/* Fixed background layer */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
        ref={containerRef}
      >
        {/* Teal blob - top left */}
        <div
          style={{
            position: "absolute",
            top: "-15%",
            left: "-10%",
            width: "55vw",
            height: "55vw",
            maxWidth: "700px",
            maxHeight: "700px",
            background:
              "radial-gradient(circle at center, rgba(0,212,170,0.07) 0%, transparent 70%)",
            animation: "bsBlobDrift1 14s ease-in-out infinite",
            willChange: "transform",
          }}
        />

        {/* Coral blob - bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: "-15%",
            right: "-10%",
            width: "60vw",
            height: "60vw",
            maxWidth: "750px",
            maxHeight: "750px",
            background:
              "radial-gradient(circle at center, rgba(255,107,107,0.06) 0%, transparent 70%)",
            animation: "bsBlobDrift2 18s ease-in-out infinite",
            willChange: "transform",
          }}
        />
      </div>
    </>
  );
}
